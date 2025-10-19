import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData, useTimeSeriesData, transformTimeSeriesData } from "./hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls, PhasePieChart, MonthlyPhaseBarChart } from "./components/EnergyCharts";
import { useTransformerData } from "./hooks/useTransformerData.js";
import { collectDownstreamNodes } from "./utils/graphUtils.js";
import { METRICS_MAP, MODAL_STYLES, MONTH_OPTIONS } from "./constants/index.js";
import { fetchMultipleHousesData } from "./utils/dataFetching.js";
import { isHouse, isTransformer, hasEnergyData } from "./utils/nodeUtils.js";
import { DataStateWrapper } from "./components/shared/StateComponents.jsx";
import PropertySelector from "./components/PropertySelector.jsx";
import TimeSeriesLineChart from "./components/TimeSeriesLineChart.jsx";
import { ModalHeader } from "./components/modal/ModalHeader.jsx";
import { NodeInfoSection } from "./components/modal/NodeInfoSection.jsx";
import { ComparisonSection } from "./components/modal/ComparisonSection.jsx";

const InfoModal = memo(({ node, onClose, isComparison = false, comparisonList = [], onRemoveFromComparison, onAddToComparison }) => {
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
    
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);
    
    const handleClose = useCallback(() => {
        setIsFullscreen(false);
        onClose();
    }, [onClose]);
    
    // Handle escape key and body scroll prevention
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' || event.key === 'x') {
                handleClose();
            }
            if (event.key === 'f' || event.key === 'F') {
                if (node || isComparison) {
                    toggleFullscreen();
                }
            }
        };
        
        document.body.classList.add('modal-open');
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.classList.remove('modal-open');
        };
    }, [handleClose, toggleFullscreen, node, isComparison]);
    
    const graphData = useTransformerData();
    const nodeIsHouse = useMemo(() => isHouse(node), [node]);
    const nodeIsTransformer = useMemo(() => isTransformer(node), [node]);
    const isInComparison = useMemo(() => 
        comparisonList?.some(h => h.id === node?.id),
        [comparisonList, node]
    );

    // Transformer-specific state
    const [transformerChartMode, setTransformerChartMode] = useState('houses'); // 'houses' | 'power'
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [monthlyPhasePowerData, setMonthlyPhasePowerData] = useState([]);
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);

    // Comparison time series state
    const [selectedProperty, setSelectedProperty] = useState('voltage'); // Default to voltage category
    
    // Get house IDs for time series data fetching
    const comparisonHouseIds = useMemo(() => 
        comparisonList.map(house => house.HouseID).filter(Boolean), 
        [comparisonList]
    );
    
    // Fetch time series data for comparison houses
    const { timeSeriesData, loading: timeSeriesLoading, error: timeSeriesError } = useTimeSeriesData(comparisonHouseIds);
    
    // Transform data for charts
    const chartTimeSeriesData = useMemo(() => 
        transformTimeSeriesData(timeSeriesData, selectedProperty, comparisonList),
        [timeSeriesData, selectedProperty, comparisonList]
    );


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
        let cancelled = false;
        const fetchPower = async () => {
            if (!nodeIsTransformer || transformerChartMode !== 'power' || !downstreamHouses.length) {
                if (!cancelled) setMonthlyPhasePowerData([]);
                return;
            }
            
            const houseIds = downstreamHouses.map((h) => h.HouseID).filter(Boolean);
            if (!houseIds.length) return;
            
            setPowerLoading(true);
            setPowerError(null);
            
            const { data, error } = await fetchMultipleHousesData(
                'house_monthly_metric_avg_compact', 
                houseIds, 
                'import_power'
            );
            
            if (error) {
                setPowerError(error);
                setPowerLoading(false);
                return;
            }
            
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
            
            if (!cancelled) {
              setMonthlyPhasePowerData(monthlyData);
              setPowerLoading(false);
            }
        };
        fetchPower();
        return () => { cancelled = true; };
     }, [nodeIsTransformer, transformerChartMode, downstreamHouses]);

    const housesPieData = useMemo(() => (
        [
            { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
            { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
            { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
        ]
    ), [phaseHouseCounts]);

    
    // Show modal if we have a single node or if we're in comparison mode with houses to compare
    if (!node && (!isComparison || comparisonList.length === 0)) return null;
    
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
                className="bg-white border border-gray-300 rounded-lg shadow-2xl transition-all duration-700 ease-in-out opacity-100 modal-content"
                style={isFullscreen ? MODAL_STYLES.fullscreen : MODAL_STYLES.normal}
            >
                <ModalHeader
                    title={isComparison ? `House Comparison (${comparisonList.length} houses)` : node?.label}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onClose={handleClose}
                    showComparisonButton={!isComparison && nodeIsHouse && !!onAddToComparison}
                    isInComparison={isInComparison}
                    onToggleComparison={() =>
                    isInComparison
                        ? onRemoveFromComparison?.(node.id)
                        : onAddToComparison?.(node)
                    }

                />
                
                {isComparison ? (
                    /* Comparison Content */
                    <div>
                        <ComparisonSection 
                            comparisonList={comparisonList}
                            onRemoveFromComparison={onRemoveFromComparison}
                        />
                        
                        {/* Time Series Comparison Chart */}
                        {comparisonList.length > 0 && (
                            <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
                                <h4 className="text-xl font-semibold mb-4 text-gray-800">Time Series Data Visualisation</h4>
                                
                                
                                {/* Property Selection */}
                                <div className="mb-4">
                                    <PropertySelector 
                                        selectedProperty={selectedProperty}
                                        onPropertyChange={setSelectedProperty}
                                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                    />
                                </div>
                                
                                {/* Loading State */}
                                {timeSeriesLoading && (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                        <span className="ml-3 text-gray-600">Loading time series data...</span>
                                    </div>
                                )}
                                
                                {/* Error State */}
                                {timeSeriesError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-red-600">
                                            Error loading time series data: {timeSeriesError?.message ?? String(timeSeriesError)}
                                        </p>
                                        <p className="text-sm text-red-500 mt-2">
                                            Please check your internet connection and try again.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Time Series Chart */}
                                {!timeSeriesLoading && !timeSeriesError && (
                                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <TimeSeriesLineChart 
                                            data={chartTimeSeriesData}
                                            selectedProperty={selectedProperty}
                                            houses={comparisonList}
                                            height={isFullscreen ? 550 : 350}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
                
                {/* Basic Node Information (Single Node Mode) */}
                {!isComparison && node && (
                <div>
                    <NodeInfoSection node={node} />
                    {nodeIsTransformer && (
                        <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
                            <h4 className="text-xl font-semibold mb-4 text-gray-800">Transformer Visualisation</h4>

                            {/* Mode Controls */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h5 className="text-md font-medium text-gray-700 mb-2">Select Analysis Type</h5>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <input
                                            type="radio"
                                            name="transformer-mode-selection"
                                            checked={transformerChartMode === 'houses'}
                                            onChange={() => setTransformerChartMode('houses')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Houses per Phase</span>
                                            <p className="text-xs text-gray-500">Distribution of houses across phases</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <input
                                            type="radio"
                                            name="transformer-mode-selection"
                                            checked={transformerChartMode === 'power'}
                                            onChange={() => setTransformerChartMode('power')}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Monthly Power by Phase</span>
                                            <p className="text-xs text-gray-500">Power consumption per phase by month</p>
                                        </div>
                                    </label>
                                </div>
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
                        <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
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
                                        Error loading data: {
                                          chartType === 'monthly'
                                            ? (monthlyError?.message ?? String(monthlyError))
                                            : (dailyError?.message ?? String(dailyError))
                                        }
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
                )}
            </div>
        </div>
    );
});

InfoModal.displayName = "InfoModal";

export default InfoModal;
