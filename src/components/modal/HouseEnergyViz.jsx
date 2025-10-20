import { useState } from 'react';
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData } from "../../hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls } from "../EnergyCharts";
import { METRICS_MAP } from "../../constants/index.js";
import { hasEnergyData } from "../../utils/nodeUtils.js";

export const HouseEnergyViz = ({ node }) => {
    const [chartType, setChartType] = useState('monthly');
    const [selectedMetrics, setSelectedMetrics] = useState('voltage');
    
    const houseId = hasEnergyData(node) ? node?.HouseID : null;
    const { monthlyData, loading: monthlyLoading, error: monthlyError } = useMonthlyData(houseId);
    const { dailyData, loading: dailyLoading, error: dailyError } = useDailyData(houseId);
    
    const chartData = chartType === 'monthly' 
        ? transformMonthlyData(monthlyData, METRICS_MAP[selectedMetrics] || [])
        : transformDailyData(dailyData, METRICS_MAP[selectedMetrics] || []);
    
    const isLoading = (chartType === 'monthly' && monthlyLoading) || (chartType === 'daily' && dailyLoading);
    const error = (chartType === 'monthly' && monthlyError) || (chartType === 'daily' && dailyError);

    return (
        <div className="mb-4 border-2 border-gray-200 rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Energy Data Visualisation</h4>

            <ChartControls
                chartType={chartType}
                setChartType={setChartType}
                selectedMetrics={selectedMetrics}
                setSelectedMetrics={setSelectedMetrics}
            />

            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading energy data...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">
                        Error loading data: {error?.message ?? String(error)}
                    </p>
                    <p className="text-sm text-red-500 mt-2">
                        Please check your internet connection and try again.
                    </p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-visible">
                    {chartType === 'monthly' ? (
                        <MonthlyBarChart data={chartData} selectedMetrics={selectedMetrics} />
                    ) : (
                        <DailyLineChart data={chartData} selectedMetrics={selectedMetrics} />
                    )}
                </div>
            )}
        </div>
    );
};
