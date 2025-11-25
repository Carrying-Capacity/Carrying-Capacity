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
import { ChartTooltip } from './shared/ChartTooltip.jsx'

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
        <Tooltip content={<ChartTooltip unit={unit} />} />
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
        <Tooltip content={<ChartTooltip unit={unit} />} />
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
  const METRICS_CATEGORIES = {
    voltage: {
      label: 'Voltage',
      description: 'All voltage phases (A, B, C)'
    },
    power: {
      label: 'Real Power',
      description: 'Import and Export Power'
    },
    reactive: {
      label: 'Reactive Power',
      description: 'Inductive and Capacitive Power'
    }
  };

  const CHART_TYPES = {
    monthly: {
      label: 'Monthly Bar Chart',
      description: 'Average values for each month'
    },
    daily: {
      label: 'Average Daily Line Chart',
      description: 'Average values throughout the day for the year'
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Chart Type Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h5 className="text-md font-medium text-gray-700 mb-2">Select Chart Type</h5>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CHART_TYPES).map(([chartKey, config]) => (
            <label
              key={chartKey}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <input
                type="radio"
                name="chart-type-selection"
                checked={chartType === chartKey}
                onChange={() => setChartType(chartKey)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Metrics Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h5 className="text-md font-medium text-gray-700 mb-2">Select Property Category</h5>
        <p className="text-xs text-gray-500 mb-3 italic">Data shows averages across all days in the selected time period</p>
        <div className="space-y-2">
          {Object.entries(METRICS_CATEGORIES).map(([metricKey, config]) => (
            <label
              key={metricKey}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <input
                type="radio"
                name="metrics-selection"
                checked={selectedMetrics === metricKey}
                onChange={() => setSelectedMetrics(metricKey)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Phase Pie Chart Component
export const PhasePieChart = ({ data }) => {
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
              <Cell key={`cell-${index}`} fill={entry.color || PHASE_COLORS[entry.phase] || PHASE_COLORS.default} />
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
        <Tooltip content={<ChartTooltip unit="kWh" />} />
        <Legend />
        <Bar dataKey="A" name="Phase A" stackId="power" fill={PHASE_COLORS.A} />
        <Bar dataKey="B" name="Phase B" stackId="power" fill={PHASE_COLORS.B} />
        <Bar dataKey="C" name="Phase C" stackId="power" fill={PHASE_COLORS.C} />
      </BarChart>
    </ResponsiveContainer>
  )
}