import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TIME_SERIES_PROPERTIES, HOUSE_COLORS, PHASE_COLORS } from '../constants/index.js';

// Property category mappings
const PROPERTY_MAPPINGS = {
  voltage: ['Voltage.PhA', 'Voltage.PhB', 'Voltage.PhC'],
  realPower: ['ImportPower', 'ExportPower'],
  reactivePower: ['InductivePower', 'CapacitivePower']
};

// Use standardized phase colors from constants
const VOLTAGE_PHASE_COLORS = {
  'Voltage.PhA': PHASE_COLORS.A,  // Red
  'Voltage.PhB': PHASE_COLORS.B,  // Green  
  'Voltage.PhC': PHASE_COLORS.C,  // Blue
  'ImportPower': '#82ca9d',
  'ExportPower': '#ff7300',
  'InductivePower': '#ffc658',
  'CapacitivePower': '#ff7c7c'
};

export default function TimeSeriesLineChart({ 
  data, 
  selectedProperty, 
  houses, 
  className = "",
  height = 400 
}) {
  
  // Get the actual properties to display based on category
  const propertiesToShow = PROPERTY_MAPPINGS[selectedProperty] || [];
  
  // Calculate dynamic range for all properties in the selected category
  const axisRange = useMemo(() => {
    if (!data?.length || !selectedProperty) return null;
    
    let min = Infinity;
    let max = -Infinity;
    
    // Find min/max values across all properties and houses
    propertiesToShow.forEach(property => {
      houses.forEach(house => {
        const key = `${house.HouseID}_${property}`;
        data.forEach(dataPoint => {
          const value = dataPoint[key];
          if (value && !isNaN(value)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        });
      });
    });
    
    if (min !== Infinity && max !== -Infinity) {
      // Add 5% padding to the range
      const padding = (max - min) * 0.05;
      return {
        min: min - padding,
        max: max + padding
      };
    }
    
    return null;
  }, [data, selectedProperty, houses, propertiesToShow]);

  // Generate line configurations
  const lineConfigs = useMemo(() => {
    if (!selectedProperty || !data?.length) return [];
    
    // Helper function to check if a property has all zero values
    const isPropertyAllZeros = (houseId, property) => {
      const hasData = data.some(dataPoint => {
        const value = dataPoint[`${houseId}_${property}`];
        return value !== 0 && value != null && !isNaN(value);
      });
      return !hasData;
    };
    
    // Helper function to get all actual voltage properties that exist in the data
    const getActualVoltageProperties = () => {
      const actualProperties = new Set();
      data.forEach(dataPoint => {
        Object.keys(dataPoint).forEach(key => {
          if (key.includes('_Voltage.Ph')) {
            const property = key.split('_')[1];
            actualProperties.add(property);
          }
        });
      });
      return Array.from(actualProperties);
    };
    
    const configs = [];
    
    if (selectedProperty === 'voltage') {
      // Get actual voltage properties from the data (including renamed ones)
      const actualVoltageProperties = getActualVoltageProperties();
      
      // For voltage, show each phase as separate lines across all houses, but skip all-zero phases
      actualVoltageProperties.forEach(property => {
        houses.forEach((house, houseIndex) => {
          const key = `${house.HouseID}_${property}`;
          
          // Skip this phase if it's all zeros
          if (isPropertyAllZeros(house.HouseID, property)) {
            return;
          }
          
          const phaseName = property.replace('Voltage.Ph', 'Phase ');
          
          const config = {
            key,
            name: `${house.label || house.HouseID} - ${phaseName}`,
            color: VOLTAGE_PHASE_COLORS[property] || VOLTAGE_PHASE_COLORS['Voltage.PhA'], // Fallback to PhA color for renamed properties
            strokeWidth: 2,
            strokeDasharray: houseIndex > 0 ? "5 5" : undefined, // Dash for houses after first
            property,
            houseId: house.HouseID
          };
          
          configs.push(config);
        });
      });
    } else {
      // For power types, show each house with different colors for each property type
      houses.forEach((house, houseIndex) => {
        const baseColor = HOUSE_COLORS[houseIndex % HOUSE_COLORS.length];
        
        propertiesToShow.forEach((property, propIndex) => {
          const key = `${house.HouseID}_${property}`;
          const propertyName = property.replace('Power', ' Power');
          
          configs.push({
            key,
            name: `${house.label || house.HouseID} - ${propertyName}`,
            color: VOLTAGE_PHASE_COLORS[property] || baseColor,
            strokeWidth: 2,
            strokeDasharray: propIndex > 0 ? "5 5" : undefined, // Dash for second property type
            property,
            houseId: house.HouseID
          });
        });
      });
    }
    
    return configs;
  }, [houses, selectedProperty, propertiesToShow, data]);

  // Get unit for the selected category
  const getCategoryUnit = (category) => {
    switch(category) {
      case 'voltage': return 'V';
      case 'realPower': return 'kW';
      case 'reactivePower': return 'kVAr';
      default: return '';
    }
  };

  // Custom tooltip to show formatted values
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length || !selectedProperty) return null;

    const categoryUnit = getCategoryUnit(selectedProperty);
    const categoryLabels = {
      voltage: 'Voltage',
      realPower: 'Real Power', 
      reactivePower: 'Reactive Power'
    };

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Time: {label}</p>
        <p className="text-xs font-medium text-gray-500 mb-2">{categoryLabels[selectedProperty]}</p>
        {payload.map((entry, index) => {
          const config = lineConfigs.find(c => c.key === entry.dataKey);
          if (!config) return null;
          
          const value = entry.value != null ? entry.value.toFixed(2) : 'N/A';
          
          return (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {config.name}: {value} {categoryUnit}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom legend to show house and property info
  const CustomLegend = (props) => {
    const { payload } = props;
    const hasMany = payload?.length > 8;
    
    return (
      <div className="relative">
        {hasMany && (
          <div className="text-center mb-1">
            <span className="text-xs text-gray-400 italic">Scroll to see all items ↕</span>
          </div>
        )}
        <div 
          className="px-2"
          style={{
            maxHeight: '120px',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f1f1'
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center pb-2">
            {payload?.map((entry, index) => {
              const config = lineConfigs.find(c => c.key === entry.dataKey);
              if (!config) return null;
              
              return (
                <div key={index} className="flex items-center space-x-2 shrink-0">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-gray-600">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (!data?.length || !selectedProperty || !houses?.length) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 mb-2">No data to display</p>
          <p className="text-sm text-gray-400">
            {!houses?.length && "Add houses to comparison list"}
            {houses?.length && !selectedProperty && "Select a property to display"}
            {houses?.length && selectedProperty && !data?.length && "Loading data..."}
          </p>
        </div>
      </div>
    );
  }

  const categoryUnit = getCategoryUnit(selectedProperty);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(1)}
            domain={axisRange ? [axisRange.min, axisRange.max] : ['auto', 'auto']}
            label={{ 
              value: categoryUnit, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            wrapperStyle={{ 
              paddingTop: '10px',
              maxHeight: '140px',
              overflow: 'visible'
            }}
          />
          
          {lineConfigs.map((config) => (
            <Line
              key={config.key}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={config.strokeWidth}
              dot={false}
              name={config.name}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}