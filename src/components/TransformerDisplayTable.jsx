import React, { useState, useRef, useEffect } from "react";
import data from "../data/nodes.json";

const ReactiveTable = () => {
  // Extract only houses
  const houses = data.filter((item) => item.type === "house");

  // Get unique transformer IDs
  const uniqueTransformers = [
    ...new Set(houses.map((h) => h.transformer).filter((t) => t != null)),
  ];

  const [selectedTransformer, setSelectedTransformer] = useState(
    uniqueTransformers[0] || null
  );

  const [searchTerm, setSearchTerm] = useState("");

  // Columns to show (in order)
  const columns = ["house_number", "predicted_phase", "solar"];

  // Filter + sort data by house number
  const currentData = houses
    .filter((h) => h.transformer === selectedTransformer)
    .sort((a, b) => (a.house_number ?? 0) - (b.house_number ?? 0));

  // Map of house number → transformer
  const houseToTransformer = Object.fromEntries(
    houses.map((h) => [h.house_number, h.transformer])
  );

  // Refs to scroll to
  const rowRefs = useRef({});

  const renderValue = (val) => {
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "[]";
    return val ?? "";
  };

  // User searches for a house number
  const handleSearch = () => {
    const targetNum = Number(searchTerm.trim());
    if (!targetNum || isNaN(targetNum)) return;

    const targetTransformer = houseToTransformer[targetNum];
    if (!targetTransformer) {
      alert(`House ${targetNum} was not found.`);
      return;
    }

    // Change transformer and then scroll after DOM updates
    setSelectedTransformer(targetTransformer);
    setTimeout(() => {
      const row = rowRefs.current[targetNum];
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.add("bg-yellow-100");
        setTimeout(() => row.classList.remove("bg-yellow-100"), 2000);
      }
    }, 200);
  };

  // Reset row refs on transformer change
  useEffect(() => {
    rowRefs.current = {};
  }, [selectedTransformer]);

  return (
    <div className="w-full p-4 bg-white shadow rounded-lg">
      {/* Search + Dropdown */}
      <div className="flex flex-wrap items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Transformer:</label>
          <select
            value={selectedTransformer || ""}
            onChange={(e) => setSelectedTransformer(Number(e.target.value))}
            className="border rounded p-1"
          >
            {uniqueTransformers.map((t) => (
              <option key={t} value={t}>
                Transformer {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Search</label>
          <input
            type="text"
            placeholder="123"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded p-1 w-16"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Go
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto border rounded">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {columns.map((key) => (
                  <th
                    key={key}
                    style={{ width: `${100 / columns.length}%` }}
                    className="border px-4 py-2 text-left bg-gray-100"
                  >
                    {key
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, idx) => (
                <tr
                  key={idx}
                  ref={(el) => (rowRefs.current[item.house_number] = el)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((key) => (
                    <td key={key} className="border px-4 py-2 break-words">
                      {renderValue(item[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentData.length === 0 && (
        <p className="mt-2 text-gray-500">No houses for this transformer.</p>
      )}
    </div>
  );
};

export default ReactiveTable;
