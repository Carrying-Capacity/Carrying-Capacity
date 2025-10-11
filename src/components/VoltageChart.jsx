import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
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

      // Determine first week range
      const { data: firstRow, error: firstError } = await supabase
        .from("house_635")
        .select("timestamp")
        .order("timestamp", { ascending: true })
        .limit(1)
        .single();

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

      // Fetch only first week and limit rows
      const { data: fetchedData, error } = await supabase
        .from("house_635")
        .select(`timestamp, "${selectedType}"`)
        .order("timestamp", { ascending: true })
        .lte("timestamp", oneWeekLater.toISOString())
        .limit(rowLimit);

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

  if (loading) return <p>Loading...</p>;
  if (data.length === 0) return <p>No data found.</p>;

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
          <Tooltip
            labelFormatter={value =>
              `Date: ${new Date(value).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`
            }
            formatter={value => [parseFloat(value).toFixed(2), selectedType]}
          />
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
    </div>
  );
}
