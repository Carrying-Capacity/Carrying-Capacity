import { useState, useMemo } from 'react';
import { useTimeSeriesData, transformTimeSeriesData } from "../../hooks/useEnergyData";
import PropertySelector from "../PropertySelector.jsx";
import TimeSeriesLineChart from "../TimeSeriesLineChart.jsx";

export const ComparisonTimeSeriesViz = ({ comparisonList, isFullscreen }) => {
    const [selectedProperty, setSelectedProperty] = useState('voltage');

    const comparisonHouseIds = useMemo(() =>
        comparisonList.map(house => house.HouseID).filter(Boolean),
        [comparisonList]
    );

    const { timeSeriesData, loading, error } = useTimeSeriesData(comparisonHouseIds);

    const chartData = useMemo(() =>
        transformTimeSeriesData(timeSeriesData, selectedProperty, comparisonList),
        [timeSeriesData, selectedProperty, comparisonList]
    );

    const getChartTitle = (property) => {
        switch (property) {
            case 'voltage': return 'Voltage';
            case 'realPower': return 'Real Power';
            case 'reactivePower': return 'Reactive Power';
            default: return '';
        }
    };

    const getChartSubtitle = (property) => {
        switch (property) {
            case 'voltage': return 'All voltage phases (A, B, C)';
            case 'realPower': return 'Import and Export Power';
            case 'reactivePower': return 'Inductive and Capacitive Power';
            default: return '';
        }
    };

    const title = getChartTitle(selectedProperty);
    const subtitle = getChartSubtitle(selectedProperty);

    return (
        <div className="mb-3 border-2 border-gray-200 rounded-lg p-3 md:p-4">
            <h4 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">Time Series Data Visualisation</h4>

            <div className="mb-4">
                <PropertySelector
                    selectedProperty={selectedProperty}
                    onPropertyChange={setSelectedProperty}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                />
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading time series data...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">
                        Error loading time series data: {error?.message ?? String(error)}
                    </p>
                    <p className="text-sm text-red-500 mt-2">
                        Please try again. If the problem persists, contact support.
                    </p>
                </div>
            )}

            {!loading && !error && (
                comparisonHouseIds.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No houses selected for comparison.
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-2 md:p-3 bg-white overflow-visible">
                        <TimeSeriesLineChart
                            data={chartData}
                            selectedProperty={selectedProperty}
                            houses={comparisonList}
                            height={isFullscreen ? 550 : 350}
                            title={title}
                            subtitle={subtitle}
                        />
                    </div>
                )
            )}
        </div>
    );
};
