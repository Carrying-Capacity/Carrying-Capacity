import { useEffect, useMemo, useState } from "react";
import { fetchTimeSeriesData } from "../utils/dataFetching";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * Shared hook for voltage chart data fetching and state management
 * @param {string} initialHouseId - Initial house ID value
 * @param {string} initialSelectedKey - Initial data type key
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} Chart state and controls
 */
export function useVoltageChartData(
  initialHouseId = "20",
  initialSelectedKey = "Voltage.PhA",
  debounceMs = 500
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKey, setSelectedKey] = useState(initialSelectedKey);
  const [houseInput, setHouseInput] = useState(initialHouseId);
  
  const debouncedHouseInput = useDebouncedValue(houseInput, debounceMs);

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

  return {
    data: displayData,
    loading,
    error,
    selectedKey,
    setSelectedKey,
    houseInput,
    setHouseInput,
    houseId,
  };
}
