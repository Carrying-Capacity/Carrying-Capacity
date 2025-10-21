import { useState, useEffect } from 'react';
import { PhasePieChart, MonthlyPhaseBarChart } from "../EnergyCharts";
import { useTransformerData } from "../../hooks/useTransformerData.js";
import { collectDownstreamNodes } from "../../utils/graphUtils.js";
import { MONTH_OPTIONS } from "../../constants/index.js";
import { fetchMultipleHousesData, fetchHousesByTransformer } from "../../utils/dataFetching.js";
import { DataStateWrapper } from "../shared/StateComponents.jsx";

export const TransformerViz = ({ node }) => {
    const [transformerChartMode, setTransformerChartMode] = useState('houses');
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [monthlyPhasePowerData, setMonthlyPhasePowerData] = useState([]);
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);

    const graphData = useTransformerData();

    useEffect(() => {
        if (!graphData?.nodes || !node) {
            setDownstreamHouses([]);
            setPhaseHouseCounts({ A: 0, B: 0, C: 0 });
            return;
        }
        
        let cancelled = false;
        
        const loadHouses = async () => {
            // If node has transformer_number, use database to find houses
            if (node.transformer_number) {
                const { data: dbHouses, error } = await fetchHousesByTransformer(node.transformer_number);
                
                if (cancelled) return;
                
                if (error) {
                    console.error('Error fetching houses by transformer:', error);
                    setDownstreamHouses([]);
                    setPhaseHouseCounts({ A: 0, B: 0, C: 0 });
                    return;
                }
                
                // Get unique house IDs from database
                const dbHouseIdsSet = new Set(
                    (dbHouses || []).map(h => String(h.House_id))
                );
                
                // Match with graph nodes to get phase information
                const houses = graphData.nodes
                    .filter(
                        n => n.type === 'house' && dbHouseIdsSet.has(String(n.HouseID))
                    )
                    .sort((a, b) => String(a.HouseID).localeCompare(String(b.HouseID)));

                setDownstreamHouses(houses);

                const counts = houses.reduce((acc, h) => {
                    const phase = Array.isArray(h.predicted_phase) ? h.predicted_phase[0] : h.predicted_phase;
                    if (phase === 'A' || phase === 'B' || phase === 'C') {
                        acc[phase] = (acc[phase] || 0) + 1;
                    }
                    return acc;
                }, { A: 0, B: 0, C: 0 });
                
                setPhaseHouseCounts(counts);
            } else {
                // Fallback to graph-based downstream collection
                const start = graphData.nodes.find(n => n.id === node.id);
                if (!start) return;
                
                const dsNodes = collectDownstreamNodes(graphData, start);
                const houses = dsNodes
                    .filter(n => n.type === 'house')
                    .sort((a, b) => String(a.HouseID).localeCompare(String(b.HouseID)));

                setDownstreamHouses(houses);

                const counts = houses.reduce((acc, h) => {
                    const phase = Array.isArray(h.predicted_phase) ? h.predicted_phase[0] : h.predicted_phase;
                    if (phase === 'A' || phase === 'B' || phase === 'C') {
                        acc[phase] = (acc[phase] || 0) + 1;
                    }
                    return acc;
                }, { A: 0, B: 0, C: 0 });
                
                setPhaseHouseCounts(counts);
            }
        };
        
        loadHouses();
        return () => { cancelled = true; };
    }, [graphData, node]);

    useEffect(() => {
        if (transformerChartMode !== 'power' || !downstreamHouses.length) {
            setMonthlyPhasePowerData([]);
            return;
        }

        let cancelled = false;
        
        const fetchPower = async () => {
            const houseIds = downstreamHouses
                .map(h => h.HouseID)
                .filter(Boolean)
                .map(id => Number(id) || id); // ensure numeric where possible
            if (!houseIds.length) return;
            
            setPowerLoading(true);
            setPowerError(null);
            
            const { data, error } = await fetchMultipleHousesData(
                'house_monthly_metric_avg_compact', 
                houseIds, 
                'import_power'
            );
            
            if (!cancelled) {
                if (error) {
                    setPowerError(error);
                    setPowerLoading(false);
                    return;
                }
            }
            
            if (!cancelled) {
                const phaseByHouse = {};
                downstreamHouses.forEach(h => {
                    phaseByHouse[String(h.HouseID)] = h.predicted_phase || 'default';
                });
                
                const monthlyData = MONTH_OPTIONS.map((monthOption, index) => {
                    const monthCol = `month_${String(index + 1).padStart(2, '0')}`;
                    const totals = { A: 0, B: 0, C: 0 };
                    
                    data?.forEach(row => {
                        const phase = phaseByHouse[String(row.house_id)];
                        if (phase === 'A' || phase === 'B' || phase === 'C') {
                            totals[phase] += Number(row[monthCol]) || 0;
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
                setPowerLoading(false);
            }
        };
        fetchPower();
        return () => { cancelled = true; };
    }, [transformerChartMode, downstreamHouses]);

    const housesPieData = [
        { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
        { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
        { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
    ];

    return (
        <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Transformer Visualisation</h4>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h5 className="text-md font-medium text-gray-700 mb-2">Select Analysis Type</h5>
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
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
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
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

            <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-visible">
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
    );
};
