import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData } from "./hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls, PhasePieChart } from "./components/EnergyCharts";
import { Maximize2, Minimize2, X as XIcon } from "lucide-react";
import { useTransformerData } from "./hooks/useTransformerData.js";
import { supabase } from "./lib/supabase";

export default function InfoModal({ node, onClose }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartType, setChartType] = useState('monthly'); // 'monthly' or 'daily'
    const [selectedMetrics, setSelectedMetrics] = useState('voltage'); // 'voltage', 'power', 'reactive'
    
    // Data fetching for house nodes
    const houseId = node?.type === "house" ? node.HouseID : null;
    const { monthlyData, loading: monthlyLoading, error: monthlyError } = useMonthlyData(houseId);
    const { dailyData, loading: dailyLoading, error: dailyError } = useDailyData(houseId);
    
    // Transform data for charts
    const getMetricsForType = (type) => {
        switch (type) {
            case 'voltage': return ['voltage'];
            case 'power': return ['import_power', 'export_power'];
            case 'reactive': return ['inductive_power', 'capacitive_power'];
            default: return [];
        }
    };
    
    const chartData = chartType === 'monthly' 
        ? transformMonthlyData(monthlyData, getMetricsForType(selectedMetrics))
        : transformDailyData(dailyData, getMetricsForType(selectedMetrics));
    
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
    const normalModalStyle = {
        position: "absolute",
        top: "20px",
        right: "20px",
        left: "calc(100vw - 20px - 500px)",
        maxHeight: "80vh",
        zIndex: 10,
        padding: "1.5rem",
        overflow: "auto",
        backgroundColor: "#fdfdfd",
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.23)",
        willChange: "top, left, right, max-height, padding, border-radius",
        opacity: 1
    };
    
    const fullscreenModalStyle = {
        position: "absolute",
        top: "20px",
        left: "20px",
        right: "20px",
        zIndex: 50,
        padding: "2rem",
        overflow: "auto",
        backgroundColor: "#fdfdfd",
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.23)",
        maxHeight: "calc(100vh - 40px)",
        willChange: "top, left, right, max-height, padding, border-radius",
        opacity: 1
    };

    // Data for transformer aggregations
    const graphData = useTransformerData();
    const isHouse = node?.type === "house";
    const isTransformer = node?.type === "transformer";

    // Transformer-specific state
    const [transformerChartMode, setTransformerChartMode] = useState('houses'); // 'houses' | 'power'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [phasePowerData, setPhasePowerData] = useState({ A: 0, B: 0, C: 0 });
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);

    // Helper: collect downstream nodes starting from a transformer, including street bridging
    const collectDownstreamNodes = useCallback((startNode) => {
        if (!graphData?.nodes) return [];
        const getNodeById = (id) => graphData.nodes.find((n) => n.id === id);
        const visited = new Set();
        const queue = [];
        const result = [];

        if (!startNode) return result;
        queue.push(startNode);
        visited.add(startNode.id);

        while (queue.length) {
            const curr = queue.shift();
            result.push(curr);

            // 1) explicit next_nodes
            if (Array.isArray(curr.next_nodes)) {
                curr.next_nodes.forEach((nid) => {
                    if (!visited.has(nid)) {
                        const child = getNodeById(nid);
                        if (child) { visited.add(nid); queue.push(child); }
                    }
                });
            }

            // 2) nodes whose prev includes curr
            graphData.nodes.forEach((n) => {
                const prevs = Array.isArray(n.prev_nodes)
                    ? n.prev_nodes
                    : (n.prev_node ? [n.prev_node] : []);
                if (prevs && prevs.includes(curr.id)) {
                    if (!visited.has(n.id)) { visited.add(n.id); queue.push(n); }
                }
            });

            // 3) streets anchored to this net node (transformer or house)
            if (curr.type !== "street") {
                graphData.nodes.forEach((n) => {
                    if (n.type === "street" && n.net_node_id === curr.id) {
                        if (!visited.has(n.id)) { visited.add(n.id); queue.push(n); }
                    }
                });
            }

            // 4) if this is a street, walk connected streets and bridge to its net node (house/transformer)
            if (curr.type === "street") {
                const connected = Array.isArray(curr.connected_nodes) ? curr.connected_nodes : [];
                connected.forEach((nid) => {
                    if (!visited.has(nid)) { const nn = getNodeById(nid); if (nn) { visited.add(nid); queue.push(nn); } }
                });
                if (curr.net_node_id && !visited.has(curr.net_node_id)) {
                    const nn = getNodeById(curr.net_node_id);
                    if (nn) { visited.add(nn.id); queue.push(nn); }
                }
            }
        }

        return result;
    }, [graphData]);

    // Derive downstream houses and phase counts when transformer selected
    useEffect(() => {
        if (!isTransformer || !graphData?.nodes || !node) {
            setDownstreamHouses([]);
            setPhaseHouseCounts({ A: 0, B: 0, C: 0 });
            return;
        }
        const start = graphData.nodes.find((n) => n.id === node.id);
        if (!start) return;
        const dsNodes = collectDownstreamNodes(start);
        const houses = dsNodes.filter((n) => n.type === 'house');
        setDownstreamHouses(houses);
        const counts = houses.reduce((acc, h) => {
            const p = h.predicted_phase || 'default';
            if (p === 'A' || p === 'B' || p === 'C') acc[p] = (acc[p] || 0) + 1;
            return acc;
        }, { A: 0, B: 0, C: 0 });
        setPhaseHouseCounts(counts);
    }, [isTransformer, graphData, node, collectDownstreamNodes]);

    // Fetch monthly import power for transformer houses and aggregate per phase
    useEffect(() => {
        const fetchPower = async () => {
            if (!isTransformer || transformerChartMode !== 'power') return;
            const houseIds = downstreamHouses.map((h) => h.HouseID).filter(Boolean);
            if (houseIds.length === 0) { setPhasePowerData({ A: 0, B: 0, C: 0 }); return; }
            try {
                setPowerLoading(true);
                setPowerError(null);
                const { data, error } = await supabase
                    .from('house_monthly_metric_avg_compact')
                    .select('*')
                    .in('house_id', houseIds)
                    .eq('metric', 'import_power');
                if (error) throw error;
                const monthCol = `month_${String(selectedMonth).padStart(2, '0')}`;
                // Build phase map for quick lookup
                const phaseByHouse = downstreamHouses.reduce((m, h) => { m[h.HouseID] = h.predicted_phase || 'default'; return m; }, {});
                const totals = { A: 0, B: 0, C: 0 };
                data?.forEach((row) => {
                    const phase = phaseByHouse[row.house_id];
                    if (phase === 'A' || phase === 'B' || phase === 'C') {
                        const val = Number(row[monthCol]) || 0;
                        totals[phase] += val;
                    }
                });
                setPhasePowerData(totals);
            } catch (e) {
                console.error('Error fetching transformer power data:', e);
                setPowerError(e.message || 'Failed to load power data');
            } finally {
                setPowerLoading(false);
            }
        };
        fetchPower();
    }, [isTransformer, transformerChartMode, selectedMonth, downstreamHouses]);

    const housesPieData = useMemo(() => (
        [
            { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
            { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
            { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
        ]
    ), [phaseHouseCounts]);

    const powerPieData = useMemo(() => (
        [
            { name: 'Phase A', phase: 'A', value: Number(phasePowerData.A || 0) },
            { name: 'Phase B', phase: 'B', value: Number(phasePowerData.B || 0) },
            { name: 'Phase C', phase: 'C', value: Number(phasePowerData.C || 0) },
        ]
    ), [phasePowerData]);

    const monthOptions = useMemo(() => (
        Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
        }))
    ), []);
    
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
                style={isFullscreen ? fullscreenModalStyle : normalModalStyle}
            >
                <div className="mb-4 px-3 py-2">
                    <div className="flex items-center justify-between gap-2 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', width: '100%' }}>
                        <h3 className="text-2xl font-bold text-gray-800 flex-1 min-w-0 truncate">{node.label}</h3>
                        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
                            <button
                                onClick={toggleFullscreen}
                                className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-5 h-5" />
                                ) : (
                                    <Maximize2 className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                                title="Close (ESC)"
                                aria-label="Close"
                            >
                                <XIcon className="w-5 h-5" />
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
                                    ⚡ Power Draw per Phase
                                </button>

                                {transformerChartMode === 'power' && (
                                    <div className="ml-auto flex items-center gap-2">
                                        <label className="text-sm text-gray-700">Month:</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                                        >
                                            {monthOptions.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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
                                    !powerLoading && !powerError && (
                                        <PhasePieChart data={powerPieData} title="Power Draw per Phase" />
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
