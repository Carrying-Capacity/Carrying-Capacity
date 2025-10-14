import React, { useState, useEffect, useMemo } from "react";
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData } from "./hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls, PhasePieChart, MonthlyPhaseBarChart } from "./components/EnergyCharts";
import { Maximize2, Minimize2, X as XIcon } from "lucide-react";
import { useTransformerData } from "./hooks/useTransformerData.js";
import { collectDownstreamNodes } from "./utils/graphUtils.js";
import { METRICS_MAP, MODAL_STYLES, MONTH_OPTIONS } from "./constants/index.js";
import { fetchMultipleHousesData } from "./utils/dataFetching.js";
import { isHouse, isTransformer, hasEnergyData } from "./utils/nodeUtils.js";
import { Button } from "./components/shared/Button.jsx";
import { DataStateWrapper } from "./components/shared/StateComponents.jsx";

export default function InfoModal({ node, onClose }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartType, setChartType] = useState('monthly'); // 'monthly' or 'daily'
    const [selectedMetrics, setSelectedMetrics] = useState('voltage'); // 'voltage', 'power', 'reactive'
    
    // Data fetching for house nodes
    const houseId = hasEnergyData(node) ? node.HouseID : null;
    const { monthlyData, loading: monthlyLoading, error: monthlyError } = useMonthlyData(houseId);
    const { dailyData, loading: dailyLoading, error: dailyError } = useDailyData(houseId);
    
    // Transform data for charts  
    const chartData = chartType === 'monthly' 
        ? transformMonthlyData(monthlyData, METRICS_MAP[selectedMetrics] || [])
        : transformDailyData(dailyData, METRICS_MAP[selectedMetrics] || []);
    
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    
    // Handle escape key and body scroll prevention
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' || event.key === 'x') {
                setIsFullscreen(false);
                onClose();
            }
            if (event.key === 'f' || event.key === 'F') {
                if (node) {
                    if (isFullscreen) {
                        setIsFullscreen(false);
                    } else {
                        setIsFullscreen(true);
                    }
                }
            }
        };
        
        // Prevent body scroll when modal is open
        document.body.classList.add('modal-open');
        
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.classList.remove('modal-open');
        };
    }, [isFullscreen, onClose]);
    
    const baseModalClasses = "bg-white border border-gray-300 rounded-lg shadow-2xl transition-all duration-700 ease-in-out opacity-100";

    // Data for transformer aggregations
    const graphData = useTransformerData();
    const nodeIsHouse = isHouse(node);
    const nodeIsTransformer = isTransformer(node);

    // Transformer-specific state
    const [transformerChartMode, setTransformerChartMode] = useState('houses'); // 'houses' | 'power'
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [monthlyPhasePowerData, setMonthlyPhasePowerData] = useState([]);
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);


    // Derive downstream houses and phase counts when transformer selected
    useEffect(() => {
        if (!nodeIsTransformer || !graphData?.nodes || !node) {
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
    }, [nodeIsTransformer, graphData, node]);

    // Fetch monthly import power for transformer houses and aggregate per phase
    useEffect(() => {
        const fetchPower = async () => {
            if (!nodeIsTransformer || transformerChartMode !== 'power') {
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
                const { data, error } = await fetchMultipleHousesData(
                    'house_monthly_metric_avg_compact', 
                    houseIds, 
                    'import_power'
                );
                if (error) throw new Error(error);
                
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
    }, [nodeIsTransformer, transformerChartMode, downstreamHouses]);

    const housesPieData = useMemo(() => (
        [
            { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
            { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
            { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
        ]
    ), [phaseHouseCounts]);

    
    if (!node) return null;
    
    return (
        <div className="modal-container">
            {isFullscreen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "black",
                        opacity: 0.5,
                        transition: "opacity 700ms ease-in-out",
                        zIndex: 999
                    }}
                    onClick={() => setIsFullscreen(false)}
                />
            )}
            <div
                className={`${baseModalClasses} modal-content`}
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
                                onClick={() => {
                                    setIsFullscreen(false);
                                    onClose();
                                }}
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
                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="text-lg mb-2"><strong>Type:</strong> {node.type}</p>
                    {nodeIsHouse && (
                        <>
                            <p className="mb-1"><strong>House ID:</strong> {node.HouseID}</p>
                            <p className="mb-1"><strong>Predicted Phase:</strong> {node.predicted_phase}</p>
                            <p className="mb-1"><strong>Solar:</strong> {node.solar ? "Yes" : "No"}</p>
                            <p className="mb-1"><strong>Parent Transformer:</strong> {node.parent}</p>
                        </>
                    )}
                    {nodeIsTransformer && (
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold mb-4 text-gray-800">Transformer Analytics</h4>

                            {/* Mode Controls */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Button
                                    onClick={() => setTransformerChartMode('houses')}
                                    size="sm"
                                    active={transformerChartMode === 'houses'}
                                >
                                    Houses per Phase
                                </Button>
                                <Button
                                    onClick={() => setTransformerChartMode('power')}
                                    size="sm"
                                    active={transformerChartMode === 'power'}
                                >
                                    Monthly Power by Phase
                                </Button>
                            </div>

                            {/* Charts with state handling */}

                            <div className={`border border-gray-200 rounded-lg p-4 bg-white ${
                                isFullscreen ? '' : 'h-96'
                            }`}>
                                {transformerChartMode === 'houses' ? (
                                    <PhasePieChart data={housesPieData} title="Houses per Phase" />
                                ) : (
                                    <DataStateWrapper
                                        loading={powerLoading}
                                        error={powerError}
                                        data={monthlyPhasePowerData}
                                        loadingMessage="Loading monthly power data..."
                                        errorMessage="Failed to load power data"
                                    >
                                        <MonthlyPhaseBarChart data={monthlyPhasePowerData} />
                                    </DataStateWrapper>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Energy Data Visualisation - Only for houses */}
                    {nodeIsHouse && (
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold mb-4 text-gray-800">Energy Data Visualisation</h4>

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
                                        Error loading data: {chartType === 'monthly' ? monthlyError : dailyError}
                                    </p>
                                    <p className="text-sm text-red-500 mt-2">
                                        Please check your internet connection and try again.
                                    </p>
                                </div>
                            )}

                            {/* Charts */}
                            {!monthlyLoading && !dailyLoading && !monthlyError && !dailyError && (
                                <div className={`border border-gray-200 rounded-lg p-4 bg-white ${
                                    isFullscreen ? '' : 'h-96'
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
                </div>
            </div>
        </div>
    );
}
