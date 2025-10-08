import React, { useState, useEffect, useMemo } from "react";
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData } from "./hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls, PhasePieChart, MonthlyPhaseBarChart } from "./components/EnergyCharts";
import { Maximize2, Minimize2, X as XIcon } from "lucide-react";
import { useTransformerData } from "./hooks/useTransformerData.js";
import { supabase } from "./lib/supabase";
import { collectDownstreamNodes } from "./utils/graphUtils.js";
import { METRICS_MAP, MODAL_STYLES, MONTH_OPTIONS } from "./constants/index.js";

export default function InfoModal({ node, onClose }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartType, setChartType] = useState('monthly'); // 'monthly' or 'daily'
    const [selectedMetrics, setSelectedMetrics] = useState('voltage'); // 'voltage', 'power', 'reactive'
    
    // Data fetching for house nodes
    const houseId = node?.type === "house" ? node.HouseID : null;
    const { monthlyData, loading: monthlyLoading, error: monthlyError } = useMonthlyData(houseId);
    const { dailyData, loading: dailyLoading, error: dailyError } = useDailyData(houseId);
    
    // Transform data for charts  
    const chartData = chartType === 'monthly' 
        ? transformMonthlyData(monthlyData, METRICS_MAP[selectedMetrics] || [])
        : transformDailyData(dailyData, METRICS_MAP[selectedMetrics] || []);
    
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    
    // Handle escape key to close fullscreen
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
            if (event.key === 'f' || event.key === 'F') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    setIsFullscreen(true);
                }
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen, onClose]);
    
    const baseModalClasses = "bg-white border border-gray-300 rounded-lg shadow-2xl transition-all duration-700 ease-in-out opacity-100";

    // Data for transformer aggregations
    const graphData = useTransformerData();
    const isHouse = node?.type === "house";
    const isTransformer = node?.type === "transformer";

    // Transformer-specific state
    const [transformerChartMode, setTransformerChartMode] = useState('houses'); // 'houses' | 'power'
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [monthlyPhasePowerData, setMonthlyPhasePowerData] = useState([]);
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);


    // Derive downstream houses and phase counts when transformer selected
    useEffect(() => {
        if (!isTransformer || !graphData?.nodes || !node) {
            setDownstreamHouses([]);
            setPhaseHouseCounts({ A: 0, B: 0, C: 0 });
            return;
        }
        const start = graphData.nodes.find((n) => n.id === node.id);
        if (!start) return;
        const dsNodes = collectDownstreamNodes(graphData, start);
        const houses = dsNodes.filter((n) => n.type === 'house');
        setDownstreamHouses(houses);
        const counts = houses.reduce((acc, h) => {
            const p = h.predicted_phase || 'default';
            if (p === 'A' || p === 'B' || p === 'C') acc[p] = (acc[p] || 0) + 1;
            return acc;
        }, { A: 0, B: 0, C: 0 });
        setPhaseHouseCounts(counts);
    }, [isTransformer, graphData, node]);

    // Fetch monthly import power for transformer houses and aggregate per phase
    useEffect(() => {
        const fetchPower = async () => {
            if (!isTransformer || transformerChartMode !== 'power') {
                setMonthlyPhasePowerData([]);
                return;
            }
            const houseIds = downstreamHouses.map((h) => h.HouseID).filter(Boolean);
            if (houseIds.length === 0) { 
                setMonthlyPhasePowerData([]);
                return; 
            }
            try {
                setPowerLoading(true);
                setPowerError(null);
                const { data, error } = await supabase
                    .from('house_monthly_metric_avg_compact')
                    .select('*')
                    .in('house_id', houseIds)
                    .eq('metric', 'import_power');
                if (error) throw error;
                
                // Build phase map for quick lookup
                const phaseByHouse = downstreamHouses.reduce((m, h) => { 
                    m[h.HouseID] = h.predicted_phase || 'default'; 
                    return m; 
                }, {});
                
                // Create monthly data array for stacked bar chart
                const monthlyData = MONTH_OPTIONS.map((monthOption, index) => {
                    const monthIndex = index + 1;
                    const monthCol = `month_${String(monthIndex).padStart(2, '0')}`;
                    const totals = { A: 0, B: 0, C: 0 };
                    
                    data?.forEach((row) => {
                        const phase = phaseByHouse[row.house_id];
                        if (phase === 'A' || phase === 'B' || phase === 'C') {
                            const val = Number(row[monthCol]) || 0;
                            totals[phase] += val;
                        }
                    });
                    
                    return {
                        month: monthOption.label,
                        A: totals.A,
                        B: totals.B,
                        C: totals.C
                    };
                });
                
                setMonthlyPhasePowerData(monthlyData);
            } catch (e) {
                console.error('Error fetching transformer power data:', e);
                setPowerError(e.message || 'Failed to load power data');
            } finally {
                setPowerLoading(false);
            }
        };
        fetchPower();
    }, [isTransformer, transformerChartMode, downstreamHouses]);

    const housesPieData = useMemo(() => (
        [
            { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
            { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
            { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
        ]
    ), [phaseHouseCounts]);

    
    if (!node) return null;
    
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "black",
                    opacity: isFullscreen ? 0.5 : 0,
                    transition: "opacity 700ms ease-in-out",
                    pointerEvents: isFullscreen ? "auto" : "none",
                    zIndex: 40
                }}
            />
            <div
                className={baseModalClasses}
                style={isFullscreen ? MODAL_STYLES.fullscreen : MODAL_STYLES.normal}
            >
                <div className="modal-header">
                    <div className="modal-header-row">
                        <h3 className="modal-header-title">{node.label}</h3>
                        <div className="modal-header-buttons">
                            <button
                                onClick={toggleFullscreen}
                                className="modal-header-button"
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="modal-header-icon" />
                                ) : (
                                    <Maximize2 className="modal-header-icon" />
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="modal-header-button"
                                title="Close (ESC)"
                                aria-label="Close"
                            >
                                <XIcon className="modal-header-icon" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Basic Node Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg mb-2"><strong>Type:</strong> {node.type}</p>
                    {isHouse && (
                        <>
                            <p className="mb-1"><strong>House ID:</strong> {node.HouseID}</p>
                            <p className="mb-1"><strong>Predicted Phase:</strong> {node.predicted_phase}</p>
                            <p className="mb-1"><strong>Solar:</strong> {node.solar ? "Yes" : "No"}</p>
                            <p className="mb-1"><strong>Parent Transformer:</strong> {node.parent}</p>
                        </>
                    )}
                    {isTransformer && (
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold mb-4 text-gray-800">Transformer Analytics</h4>

                            {/* Mode Controls */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <button
                                    onClick={() => setTransformerChartMode('houses')}
                                    className={`px-3 py-1 rounded ${transformerChartMode === 'houses' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    🏠 Houses per Phase
                                </button>
                                <button
                                    onClick={() => setTransformerChartMode('power')}
                                    className={`px-3 py-1 rounded ${transformerChartMode === 'power' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    📊 Monthly Power by Phase
                                </button>
                            </div>

                            {/* Loading / Error */}
                            {transformerChartMode === 'power' && powerLoading && (
                                <div className="flex items-center justify-center h-48 text-gray-600">Loading monthly power data…</div>
                            )}
                            {transformerChartMode === 'power' && powerError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{powerError}</div>
                            )}

                            {/* Charts */}
                            <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${
                                isFullscreen ? 'h-[calc(100vh-400px)]' : 'h-96'
                            }`}>
                                {transformerChartMode === 'houses' ? (
                                    <PhasePieChart data={housesPieData} title="Houses per Phase" />
                                ) : (
                                    !powerLoading && !powerError && monthlyPhasePowerData.length > 0 && (
                                        <MonthlyPhaseBarChart data={monthlyPhasePowerData} />
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Energy Data Visualization - Only for houses */}
                {isHouse && (
                    <div className="mb-4">
                        <h4 className="text-xl font-semibold mb-4 text-gray-800">Energy Data Visualization</h4>
                        
                        {/* Chart Controls */}
                        <ChartControls
                            chartType={chartType}
                            setChartType={setChartType}
                            selectedMetrics={selectedMetrics}
                            setSelectedMetrics={setSelectedMetrics}
                        />
                        
                        {/* Loading State */}
                        {((chartType === 'monthly' && monthlyLoading) || (chartType === 'daily' && dailyLoading)) && (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                <span className="ml-3 text-gray-600">Loading energy data...</span>
                            </div>
                        )}
                        
                        {/* Error State */}
                        {((chartType === 'monthly' && monthlyError) || (chartType === 'daily' && dailyError)) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600">
                                    ❌ Error loading data: {chartType === 'monthly' ? monthlyError : dailyError}
                                </p>
                                <p className="text-sm text-red-500 mt-2">
                                    Please check your internet connection and try again.
                                </p>
                            </div>
                        )}
                        
                        {/* Charts */}
                        {!monthlyLoading && !dailyLoading && !monthlyError && !dailyError && (
                            <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${
                                isFullscreen ? 'h-[calc(100vh-400px)]' : 'h-96'
                            }`}>
                                {chartType === 'monthly' ? (
                                    <MonthlyBarChart data={chartData} selectedMetrics={selectedMetrics} />
                                ) : (
                                    <DailyLineChart data={chartData} selectedMetrics={selectedMetrics} />
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Transformer message */}

            </div>
        </>
    );
}
