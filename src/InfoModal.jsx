import React, { useState, useEffect } from "react";
import { useMonthlyData, useDailyData, transformMonthlyData, transformDailyData } from "./hooks/useEnergyData";
import { MonthlyBarChart, DailyLineChart, ChartControls } from "./components/EnergyCharts";

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
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen, onClose]);
    
    if (!node) return null;
    
    const baseModalClasses = "bg-white border border-gray-300 rounded-lg shadow-2xl transition-all duration-300 opacity-100";
    const normalModalStyle = {
        position: "absolute",
        top: "100px",
        right: "50px",
        width: "400px",
        maxHeight: "80vh",
        zIndex: 10,
        padding: "1.5rem",
        overflow: "auto",
        backgroundColor: "#ffffff",
        opacity: 1
    };
    
    const fullscreenModalStyle = {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100vw",
        height: "100vh",
        zIndex: 50,
        padding: "2rem",
        overflow: "auto",
        borderRadius: "0",
        backgroundColor: "#ffffff",
        opacity: 1
    };
    
    const isHouse = node.type === "house";
    
    return (
        <>
            {isFullscreen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
            )}
            <div
                className={baseModalClasses}
                style={isFullscreen ? fullscreenModalStyle : normalModalStyle}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{node.label}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold px-2 py-1 hover:bg-gray-100 rounded"
                        title="Close (ESC)"
                    >
                        ✕
                    </button>
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
                    {node.type === "transformer" && (
                        <>
                            <p className="mb-1"><strong>Phase Distribution:</strong> Not available</p>
                            <p className="mb-1"><strong>Power Draw:</strong> Not available</p>
                            <p className="mb-1"><strong>Phase Power Distribution:</strong> Not available</p>
                        </>
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
                            isFullscreen={isFullscreen}
                            toggleFullscreen={toggleFullscreen}
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
                        
                        {/* Data Summary */}
                        {chartData && chartData.length > 0 && (
                            <div className="mt-4 text-sm text-gray-600">
                                <p>
                                    📊 Showing {chartType} data for House {node.HouseID} • 
                                    {chartData.length} data points • 
                                    Metrics: {getMetricsForType(selectedMetrics).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Transformer message */}
                {!isHouse && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-800">
                            📊 Energy visualization is only available for house nodes.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
