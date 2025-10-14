import React from "react";

// Unified tooltip component for all charts
export const ChartTooltip = ({ active, payload, label, unit = '', labelFormatter, valueFormatter }) => {
  if (!active || !payload?.length) return null;

  const formatLabel = labelFormatter || ((value) => {
    // Check if it's a timestamp
    if (typeof value === 'number' && value > 1000000000) {
      return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return value;
  });

  const formatValue = valueFormatter || ((value) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : numValue.toFixed(3);
  });

  return (
    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
      <p className="font-medium text-gray-800">{formatLabel(label)}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {`${entry.name || entry.dataKey}: ${formatValue(entry.value)}${unit}`}
        </p>
      ))}
    </div>
  );
};
