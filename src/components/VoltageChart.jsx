import { useEffect, useMemo, useState } from "react";
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
import { fetchTimeSeriesData } from "../utils/dataFetching";
import { DataStateWrapper } from "./shared/StateComponents";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const VALUE_TYPES = [
  { key: "Voltage.PhA", label: "Voltage Phase A" },
  { key: "Voltage.PhB", label: "Voltage Phase B" },
  { key: "Voltage.PhC", label: "Voltage Phase C" },
  { key: "ImportPower", label: "Import Power" },
  { key: "ExportPower", label: "Export Power" },
  { key: "InductivePower", label: "Inductive Power" },
  { key: "CapacitivePower", label: "Capacitive Power" },
];

const VoltageChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKey, setSelectedKey] = useState("Voltage.PhA");
  const [houseInput, setHouseInput] = useState("20");
  const debouncedHouseInput = useDebouncedValue(houseInput, 500);

  const houseId = useMemo(() => {
    const parsed = parseInt(debouncedHouseInput);
    return Number.isFinite(parsed) ? parsed : null;
  }, [debouncedHouseInput]);

  // Fetch data whenever debounced houseId changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!houseId) {
        if (cancelled) return;
        setData([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: rows, error: err } = await fetchTimeSeriesData("towndatamarch_1_2", {
          houseId,
          columns: "*",
          orderBy: "timestamp",
          ascending: true,
        });
        if (cancelled) return;
        if (err) {
          setError(err);
          setData([]);
          return;
        }
        setData(rows || []);
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [houseId]);

  const displayData = houseInput.trim() === "" ? [] : data;

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* House input */}
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

        {/* Data type dropdown */}
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
      <DataStateWrapper
        loading={loading}
        error={error}
        data={displayData}
        loadingMessage={`Loading data for house ${houseId ?? "-"}...`}
        emptyMessage={
          houseInput.trim() === "" ? "Please enter a house ID." : `No data found for House ${houseId}.`
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
            <YAxis
              domain={["auto", "auto"]}
              label={{
                value: selectedKey,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} formatter={(value) => [value, selectedKey]} />
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
      </DataStateWrapper>
    </div>
  );
};

export default VoltageChart;