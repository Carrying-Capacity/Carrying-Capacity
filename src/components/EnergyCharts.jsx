import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { PieChart as RePieChart, Pie, Cell } from 'recharts'
import { PHASE_COLORS, CHART_CONFIGS, UNITS, CHART_DIMENSIONS } from '../constants/index.js'

// Custom tooltip for better data presentation
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-medium text-gray-800">{`${label}`}</p>
        {payload.map((entry, index) => {
          // Handle negative export power display
          let displayValue = entry.value
          let displayName = entry.name
          
          
          return (
            <p key={index} style={{ color: entry.color }}>
              {`${displayName}: ${displayValue?.toFixed(3)}${unit}`}
            </p>
          )
        })}
      </div>
    )
  }
  return null
}

// Monthly Bar Chart Component
export const MonthlyBarChart = ({ data, selectedMetrics }) => {
  const barConfig = CHART_CONFIGS[selectedMetrics] || []
  const unit = UNITS[selectedMetrics] || ''

  return (
    <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.height}>
      <BarChart data={data} margin={CHART_DIMENSIONS.margin}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        {selectedMetrics === 'power' && <ReferenceLine y={0} stroke="#000" strokeWidth={2} />}
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Legend />
        {barConfig.map(config => (
          <Bar
            key={config.key}
            dataKey={config.key}
            name={config.name}
            fill={config.color}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// Daily Line Chart Component
export const DailyLineChart = ({ data, selectedMetrics }) => {
  const lineConfig = (CHART_CONFIGS[selectedMetrics] || []).map(config => ({ ...config, strokeWidth: 2 }))
  const unit = UNITS[selectedMetrics] || ''

  // Custom tick formatter to show only every 4th hour (00:00, 06:00, 12:00, 18:00)
  const formatXAxisTick = (tickItem, index) => {
    return index % 12 === 0 ? tickItem : ''
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.height}>
      <LineChart data={data} margin={CHART_DIMENSIONS.margin}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tickFormatter={formatXAxisTick}
          interval={0}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Legend />
        {lineConfig.map(config => (
          <Line
            key={config.key}
            type="monotone"
            dataKey={config.key}
            stroke={config.color}
            strokeWidth={config.strokeWidth}
            name={config.name}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Control buttons component
export const ChartControls = ({ 
  chartType, 
  setChartType, 
  selectedMetrics, 
  setSelectedMetrics,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4">

      {/* Chart Type Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setChartType('monthly')}
          className={`px-4 py-2 rounded transition-colors ${
            chartType === 'monthly'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Monthly Bar Chart
        </button>
        <button
          onClick={() => setChartType('daily')}
          className={`px-4 py-2 rounded transition-colors ${
            chartType === 'daily'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📈 Daily Line Chart
        </button>
      </div>

      {/* Metrics Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedMetrics('voltage')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedMetrics === 'voltage'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⚡ Voltage
        </button>
        <button
          onClick={() => setSelectedMetrics('power')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedMetrics === 'power'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔋 Import/Export Power
        </button>
        <button
          onClick={() => setSelectedMetrics('reactive')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedMetrics === 'reactive'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⚙️ Reactive Power
        </button>
      </div>
    </div>
  )
}

// Phase Pie Chart Component
export const PhasePieChart = ({ data, title = 'Phase Distribution' }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.height}>
        <RePieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PHASE_COLORS[entry.phase] || PHASE_COLORS.default} />
            ))}
          </Pie>
        </RePieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Stacked Bar Chart for Monthly Power by Phase
export const MonthlyPhaseBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.height}>
      <BarChart data={data} margin={CHART_DIMENSIONS.margin}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis label={{ value: 'Power (kWh)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip unit="kWh" />} />
        <Legend />
        <Bar dataKey="A" name="Phase A" stackId="power" fill={PHASE_COLORS.A} />
        <Bar dataKey="B" name="Phase B" stackId="power" fill={PHASE_COLORS.B} />
        <Bar dataKey="C" name="Phase C" stackId="power" fill={PHASE_COLORS.C} />
      </BarChart>
    </ResponsiveContainer>
  )
}
