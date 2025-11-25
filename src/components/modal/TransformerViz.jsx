import { useState, useEffect, useMemo } from 'react';
import { PhasePieChart, MonthlyPhaseBarChart } from "../EnergyCharts";
import { useTransformerData } from "../../hooks/useTransformerData.js";
import { collectDownstreamNodes } from "../../utils/graphUtils.js";
import { MONTH_OPTIONS } from "../../constants/index.js";
import { fetchMultipleHousesData } from "../../utils/dataFetching.js";
import { DataStateWrapper } from "../shared/StateComponents.jsx";
import { normalizePhase } from "../../utils/stringUtils.js";

// Determine which phases a house belongs to. Supports single-phase and three-phase encodings.
const getHousePhases = (predictedPhase) => {
    if (!predictedPhase) return [];
    // Array format: treat length > 1 as three-phase; otherwise use first normalized
    if (Array.isArray(predictedPhase)) {
        if (predictedPhase.length > 1) return ['A', 'B', 'C'];
        const p = normalizePhase(predictedPhase);
        return p ? [p] : [];
    }
    // String format: multi-character like "BAC" implies three-phase.
    const s = predictedPhase.toString().trim().toUpperCase();
    if (!s) return [];
    if (s.length === 1) {
        const p = normalizePhase(s);
        return p ? [p] : [];
    }
    // Deduplicate to phases present; if it contains multiple unique A/B/C, treat as all three
    const set = new Set([...s].filter(ch => ch === 'A' || ch === 'B' || ch === 'C'));
    if (set.size > 1) return ['A', 'B', 'C'];
    const only = [...set][0];
    return only ? [only] : [];
};

import { calculateImbalanceScore } from "../../utils/nodeUtils.js";

export const TransformerViz = ({ node, onImbalanceUpdate }) => {
    const [transformerChartMode, setTransformerChartMode] = useState('houses');
    const [downstreamHouses, setDownstreamHouses] = useState([]);
    const [phaseHouseCounts, setPhaseHouseCounts] = useState({ A: 0, B: 0, C: 0 });
    const [solarHouseCounts, setSolarHouseCounts] = useState({ solar: 0, noSolar: 0 });
    const [monthlyPhasePowerData, setMonthlyPhasePowerData] = useState([]);
    const [monthlyPhaseExportData, setMonthlyPhaseExportData] = useState([]);
    const [powerLoading, setPowerLoading] = useState(false);
    const [powerError, setPowerError] = useState(null);

    const graphData = useTransformerData();

    useEffect(() => {
        if (!graphData?.nodes || !node) {
            setDownstreamHouses([]);
            setPhaseHouseCounts({ A: 0, B: 0, C: 0 });
            setSolarHouseCounts({ solar: 0, noSolar: 0 });
            return;
        }

        let cancelled = false;

        const loadHouses = async () => {
            // If node has transformer_number, find houses by matching transformer number locally
            if (node.transformer_number) {
                const txNum = String(node.transformer_number);
                const houses = graphData.nodes
                    .filter(n => n.type === 'house' && (
                        String(n.transformer_number ?? n.transformer ?? n.parent) === txNum
                    ))
                    .sort((a, b) => String(a.HouseID).localeCompare(String(b.HouseID)));

                if (cancelled) return;
                setDownstreamHouses(houses);

                const counts = houses.reduce((acc, h) => {
                    const phases = getHousePhases(h.predicted_phase);
                    phases.forEach(p => {
                        if (p === 'A' || p === 'B' || p === 'C') {
                            acc[p] = (acc[p] || 0) + 1;
                        }
                    });
                    return acc;
                }, { A: 0, B: 0, C: 0 });

                const solarCounts = houses.reduce((acc, h) => {
                    if (h.solar) {
                        acc.solar++;
                    } else {
                        acc.noSolar++;
                    }
                    return acc;
                }, { solar: 0, noSolar: 0 });

                setPhaseHouseCounts(counts);
                setSolarHouseCounts(solarCounts);
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
                    const phases = getHousePhases(h.predicted_phase);
                    phases.forEach(p => {
                        if (p === 'A' || p === 'B' || p === 'C') {
                            acc[p] = (acc[p] || 0) + 1;
                        }
                    });
                    return acc;
                }, { A: 0, B: 0, C: 0 });

                const solarCounts = houses.reduce((acc, h) => {
                    if (h.solar) {
                        acc.solar++;
                    } else {
                        acc.noSolar++;
                    }
                    return acc;
                }, { solar: 0, noSolar: 0 });

                setPhaseHouseCounts(counts);
                setSolarHouseCounts(solarCounts);
            }
        };

        loadHouses();
        return () => { cancelled = true; };
    }, [graphData, node]);

    useEffect(() => {
        if (!downstreamHouses.length) {
            setMonthlyPhasePowerData([]);
            setMonthlyPhaseExportData([]);
            return;
        }

        let cancelled = false;

        const fetchAllData = async () => {
            const houseIds = downstreamHouses
                .map(h => h.HouseID)
                .filter(Boolean)
                .map(id => Number(id) || id);

            if (!houseIds.length) return;

            setPowerLoading(true);
            setPowerError(null);

            // Fetch both Import and Export data in parallel
            const [importRes, exportRes] = await Promise.all([
                fetchMultipleHousesData('house_monthly_metric_avg_compact', houseIds, 'import_power'),
                fetchMultipleHousesData('house_monthly_metric_avg_compact', houseIds, 'export_power')
            ]);

            if (cancelled) return;

            if (importRes.error || exportRes.error) {
                setPowerError(importRes.error || exportRes.error);
                setPowerLoading(false);
                return;
            }

            const phasesByHouse = {};
            downstreamHouses.forEach(h => {
                const phases = getHousePhases(h.predicted_phase);
                if (phases.length) {
                    phasesByHouse[String(h.HouseID)] = phases;
                }
            });

            // Helper to process data
            const processData = (data) => {
                return MONTH_OPTIONS.map((monthOption, index) => {
                    const monthCol = `month_${String(index + 1).padStart(2, '0')}`;
                    const totals = { A: 0, B: 0, C: 0 };

                    data?.forEach(row => {
                        const houseKey = String(row.house_id ?? row.House_id ?? row.HouseID);
                        const phases = phasesByHouse[houseKey] || [];
                        const value = Number(row[monthCol]) || 0;
                        if (!phases.length) return;
                        const share = value / phases.length;
                        phases.forEach(p => {
                            if (p === 'A' || p === 'B' || p === 'C') {
                                totals[p] += share;
                            }
                        });
                    });

                    return {
                        month: monthOption.label,
                        A: totals.A,
                        B: totals.B,
                        C: totals.C
                    };
                });
            };

            const powerData = processData(importRes.data);
            const exportData = processData(exportRes.data);

            setMonthlyPhasePowerData(powerData);
            setMonthlyPhaseExportData(exportData);
            setPowerLoading(false);
        };

        fetchAllData();
        return () => { cancelled = true; };
    }, [downstreamHouses]);

    const housesPieData = useMemo(() => ([
        { name: 'Phase A', phase: 'A', value: phaseHouseCounts.A || 0 },
        { name: 'Phase B', phase: 'B', value: phaseHouseCounts.B || 0 },
        { name: 'Phase C', phase: 'C', value: phaseHouseCounts.C || 0 },
    ]), [phaseHouseCounts]);

    const solarPieData = useMemo(() => ([
        { name: 'Solar', value: solarHouseCounts.solar || 0, color: '#FDB813' }, // Sun yellow
        { name: 'No Solar', value: solarHouseCounts.noSolar || 0, color: '#9CA3AF' }, // Cool gray
    ]), [solarHouseCounts]);

    // Calculate composite score based on all available data
    const { score, level, color, message } = useMemo(() => {
        const scores = [];
        const factors = [];

        // 1. Connection Imbalance Score
        const connScore = calculateImbalanceScore(phaseHouseCounts);
        scores.push(connScore.score);
        factors.push('Connections');

        // 2. Import Power Imbalance Score (if available)
        if (monthlyPhasePowerData.length > 0) {
            const powerTotals = { A: 0, B: 0, C: 0 };
            monthlyPhasePowerData.forEach(m => {
                powerTotals.A += m.A;
                powerTotals.B += m.B;
                powerTotals.C += m.C;
            });
            const pScore = calculateImbalanceScore(powerTotals);
            scores.push(pScore.score);
            factors.push('Power');
        }

        // 3. Export Power Imbalance Score (if available)
        if (monthlyPhaseExportData.length > 0) {
            const exportTotals = { A: 0, B: 0, C: 0 };
            monthlyPhaseExportData.forEach(m => {
                exportTotals.A += m.A;
                exportTotals.B += m.B;
                exportTotals.C += m.C;
            });
            const eScore = calculateImbalanceScore(exportTotals);
            scores.push(eScore.score);
            factors.push('Export');
        }

        // Calculate average score
        const totalScore = scores.reduce((a, b) => a + b, 0);
        const avgScore = Math.round(totalScore / scores.length);

        // Determine level and color based on average
        let finalLevel = 'Balanced';
        let finalColor = '#22c55e'; // Green

        if (avgScore > 30) {
            finalLevel = 'Critical';
            finalColor = '#ef4444'; // Red
        } else if (avgScore > 10) {
            finalLevel = 'Moderate';
            finalColor = '#eab308'; // Yellow
        }

        let msg = `Composite Score: ${avgScore}/100 (Based on ${factors.join(', ')})`;
        if (finalLevel === 'Critical') msg = `Critical Imbalance detected across ${factors.join(', ')}`;

        return { score: avgScore, level: finalLevel, color: finalColor, message: msg };
    }, [phaseHouseCounts, monthlyPhasePowerData, monthlyPhaseExportData]);

    // Report imbalance metrics to parent
    useEffect(() => {
        if (onImbalanceUpdate) {
            onImbalanceUpdate({ score, level, color, message });
        }
    }, [score, level, color, message, onImbalanceUpdate]);

    return (
        <div className="mb-3 border-2 border-gray-200 rounded-lg p-3 md:p-4">
            <h4 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">Transformer Visualisation</h4>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h5 className="text-md font-medium text-gray-700 mb-2">Select Analysis Type</h5>
                <div className="flex flex-col gap-2">
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
                        </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
                        <input
                            type="radio"
                            name="transformer-mode-selection"
                            checked={transformerChartMode === 'export'}
                            onChange={() => setTransformerChartMode('export')}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700">Monthly Export by Phase</span>
                        </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
                        <input
                            type="radio"
                            name="transformer-mode-selection"
                            checked={transformerChartMode === 'solar'}
                            onChange={() => setTransformerChartMode('solar')}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700">Solar Distribution</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white overflow-visible">
                {transformerChartMode === 'houses' && (
                    <PhasePieChart
                        data={housesPieData}
                        title="Houses per Phase"
                        subtitle="Distribution of houses across phases"
                    />
                )}
                {transformerChartMode === 'solar' && (
                    <PhasePieChart
                        data={solarPieData}
                        title="Solar Distribution"
                        subtitle="Houses with vs without solar"
                    />
                )}
                {transformerChartMode === 'power' && (
                    <DataStateWrapper
                        loading={powerLoading}
                        error={powerError}
                        data={monthlyPhasePowerData}
                        loadingMessage="Loading monthly power data..."
                        errorMessage="Failed to load power data"
                    >
                        <MonthlyPhaseBarChart
                            data={monthlyPhasePowerData}
                            title="Monthly Power by Phase"
                            subtitle="Power consumption per phase by month"
                        />
                    </DataStateWrapper>
                )}
                {transformerChartMode === 'export' && (
                    <DataStateWrapper
                        loading={powerLoading}
                        error={powerError}
                        data={monthlyPhaseExportData}
                        loadingMessage="Loading monthly export data..."
                        errorMessage="Failed to load export data"
                    >
                        <MonthlyPhaseBarChart
                            data={monthlyPhaseExportData}
                            title="Monthly Export by Phase"
                            subtitle="Power export per phase by month"
                        />
                    </DataStateWrapper>
                )}
            </div>
        </div >
    );
};
