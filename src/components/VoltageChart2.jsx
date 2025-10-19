import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../lib/supabase";
import { buildQuery } from "../utils/dataFetching";

const VALUE_TYPES = [
  { key: "Voltage.PhA", label: "Voltage Phase A" },
  { key: "Voltage.PhB", label: "Voltage Phase B" },
  { key: "Voltage.PhC", label: "Voltage Phase C" },
  { key: "ImportPower", label: "Import Power" },
  { key: "ExportPower", label: "Export Power" },
  { key: "InductivePower", label: "Inductive Power" },
  { key: "CapacitivePower", label: "Capacitive Power" },
];

const defaultState = 1;

const VoltageChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("Voltage.PhA");
  const [houseInput, setHouseInput] = useState(String(defaultState)); // text box value
  const [houseId, setHouseId] = useState(defaultState); // debounced numeric value

  // 🕒 Debounce input (wait 500 ms before applying)
  useEffect(() => {
    const handler = setTimeout(() => {
      const parsed = parseInt(houseInput);
      if (!isNaN(parsed) && houseInput.trim() !== "") {
        setHouseId(parsed);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [houseInput]);

  // ⚡ Fetch data whenever debounced houseId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!houseId) return; // avoid empty fetch
      setLoading(true);

      const towndata = buildQuery("towndatamarch_1_2");
      let query = towndata.select("*");
      query = towndata.filters.eq("House_id", houseId)(query);
      query = towndata.order("timestamp", true)(query);

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setData(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [houseId]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 🏠 House input */}
        <label className="flex items-center gap-2">
          <span className="font-medium">House ID:</span>
          <input
            type="text"
            value={houseInput}
            onChange={(e) => setHouseInput(e.target.value)}
            className="p-2 border rounded-lg w-24 text-center shadow-sm"
            placeholder="Enter ID"
          />
        </label>

        {/* 📈 Data type dropdown */}
        <label className="flex items-center gap-2">
          <span className="font-medium">Data Type:</span>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="p-2 border rounded-lg shadow-sm"
          >
            {VALUE_TYPES.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Chart display */}
      {loading ? (
        <div>Loading data for house {houseId}...</div>
      ) : houseInput.trim() === "" ? (
        <div>Please enter a house ID.</div>
      ) : data.length === 0 ? (
        <div>No data found for House {houseId}.</div>
      ) : (
        <div style={{ width: "100%", height: "50vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => new Date(t).toLocaleTimeString()}
              />
              <YAxis
                domain={["auto", "auto"]}
                label={{
                  value: selectedKey,
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                labelFormatter={(t) => new Date(t).toLocaleString()}
                formatter={(value) => [value, selectedKey]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedKey}
                name={VALUE_TYPES.find((v) => v.key === selectedKey)?.label}
                stroke="#8884d8"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
       )}
    </div>
  );
};

export default VoltageChart;