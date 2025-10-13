import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchFirstTimestamp, fetchTimeSeriesData } from "../utils/dataFetching.js";
import { TimeSeriesTooltip } from "./shared/ChartTooltip.jsx";
import { DataStateWrapper } from "./shared/StateComponents.jsx";

const VALUE_TYPES = [
  { key: "Voltage.PhA", label: "Voltage Phase A" },
  { key: "ImportPower", label: "Import Power" },
  { key: "ExportPower", label: "Export Power" },
  { key: "CapacitivePower", label: "Capactive Power" },
  { key: "InductivePower", label: "Inductive Power" },
  // add more valuetypes here
];

export default function VoltageChart({ rowLimit = 500 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(VALUE_TYPES[0].key);

  const cache = useRef({}); // cache per value type

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (cache.current[selectedType]) {
        setData(cache.current[selectedType]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Get first timestamp to determine date range
      const { data: firstRow, error: firstError } = await fetchFirstTimestamp("house_635");
      
      if (firstError || !firstRow) {
        console.error(firstError);
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
        return;
      }

      const firstTimestamp = new Date(firstRow.timestamp);
      const oneWeekLater = new Date(firstTimestamp.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Fetch time series data for the first week
      const { data: fetchedData, error } = await fetchTimeSeriesData("house_635", {
        columns: `timestamp, "${selectedType}"`,
        endDate: oneWeekLater.toISOString(),
        limit: rowLimit
      });

      if (error) {
        console.error(error);
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
        return;
      }

      if (!fetchedData || fetchedData.length === 0) {
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
        return;
      }

      // Map to chart data
      const chartData = fetchedData.map(d => ({
        time: new Date(d.timestamp).getTime(),
        value: parseFloat(d[selectedType]),
      }));

      if (isMounted) {
        cache.current[selectedType] = chartData; // cache
        setData(chartData);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedType, rowLimit]);

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Value Type:</label>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {VALUE_TYPES.map(v => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <DataStateWrapper 
        loading={loading} 
        error={null}
        data={data}
        loadingMessage="Loading chart data..."
        emptyMessage="No data found for the selected time period."
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={time => new Date(time).toLocaleDateString("en-GB")}
            />
            <YAxis
              label={{ value: selectedType, angle: -90, position: "insideLeft" }}
              domain={[
                dataMin => Math.floor(dataMin),
                dataMax => Math.ceil(dataMax),
              ]}
            />
            <Tooltip content={<TimeSeriesTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              name={selectedType}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </DataStateWrapper>
    </div>
  );
}
