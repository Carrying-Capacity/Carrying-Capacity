import React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  BarChart,
  PieChart as RePieChart,
  ReferenceLine
} from 'recharts';
import { CHART_DIMENSIONS } from '../../constants/index.js';
import { ChartTooltip } from './ChartTooltip.jsx';

// Base chart wrapper with common responsive container and grid
export const ChartWrapper = ({ 
  children, 
  height = CHART_DIMENSIONS.height,
  margin = CHART_DIMENSIONS.margin 
}) => (
  <ResponsiveContainer width="100%" height={height}>
    {React.cloneElement(children, { margin })}
  </ResponsiveContainer>
);

// Base chart with common axes and grid configuration
export const BaseChart = ({ 
  ChartComponent,
  data,
  children,
  xDataKey = "time",
  xAxisProps = {},
  yAxisProps = {},
  tooltipProps = {},
  showLegend = true,
  showGrid = true,
  height,
  margin
}) => (
  <ChartWrapper height={height} margin={margin}>
    <ChartComponent data={data}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" />}
      <XAxis dataKey={xDataKey} {...xAxisProps} />
      <YAxis {...yAxisProps} />
      <Tooltip content={<ChartTooltip {...tooltipProps} />} />
      {showLegend && <Legend />}
      {children}
    </ChartComponent>
  </ChartWrapper>
);

// Time series line chart with common configurations
export const TimeSeriesChart = ({ 
  data, 
  lines = [],
  xDataKey = "time",
  formatXTick,
  yLabel,
  tooltipProps,
  height,
  margin
}) => {
  const xAxisProps = {
    dataKey: xDataKey,
    ...(formatXTick && { tickFormatter: formatXTick }),
    ...(xDataKey === "time" && {
      type: "number",
      domain: ["dataMin", "dataMax"]
    })
  };

  const yAxisProps = yLabel ? {
    label: { value: yLabel, angle: -90, position: 'insideLeft' }
  } : {};

  return (
    <BaseChart
      ChartComponent={LineChart}
      data={data}
      xDataKey={xDataKey}
      xAxisProps={xAxisProps}
      yAxisProps={yAxisProps}
      tooltipProps={tooltipProps}
      height={height}
      margin={margin}
    >
      {lines.map((line, index) => (
        <line.component
          key={line.key || index}
          {...line.props}
        />
      ))}
    </BaseChart>
  );
};

// Bar chart with common configurations
export const StandardBarChart = ({ 
  data, 
  bars = [],
  xDataKey = "month",
  yLabel,
  tooltipProps,
  showReferenceLine,
  referenceLineProps = { y: 0, stroke: "#000", strokeWidth: 2 },
  height,
  margin
}) => {
  const yAxisProps = yLabel ? {
    label: { value: yLabel, angle: -90, position: 'insideLeft' }
  } : {};

  return (
    <BaseChart
      ChartComponent={BarChart}
      data={data}
      xDataKey={xDataKey}
      yAxisProps={yAxisProps}
      tooltipProps={tooltipProps}
      height={height}
      margin={margin}
    >
      {showReferenceLine && (
        <ReferenceLine {...referenceLineProps} />
      )}
      {bars.map((bar, index) => (
        <bar.component
          key={bar.key || index}
          {...bar.props}
        />
      ))}
    </BaseChart>
  );
};

// Pie chart wrapper
export const PieChartWrapper = ({ 
  data, 
  pies = [],
  height = CHART_DIMENSIONS.height,
  margin = CHART_DIMENSIONS.margin 
}) => (
  <ChartWrapper height={height} margin={margin}>
    <RePieChart>
      <Tooltip />
      <Legend />
      {pies.map((pie, index) => (
        <pie.component
          key={pie.key || index}
          {...pie.props}
        />
      ))}
    </RePieChart>
  </ChartWrapper>
);