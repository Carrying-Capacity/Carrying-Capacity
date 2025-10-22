import React, { useState } from "react";
import data from "../data/example2.json"; // your JSON file

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

  // Columns to show (in order)
  const columns = ["house_number", "predicted_phase", "solar"];

  // Filter + sort data by house number
  const currentData = houses
    .filter((h) => h.transformer === selectedTransformer)
    .sort((a, b) => (a.house_number ?? 0) - (b.house_number ?? 0));

  const renderValue = (val) => {
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "[]";
    return val ?? "";
  };

  return (
    <div className="w-full p-4 bg-white shadow rounded-lg">
      {/* Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Choose transformer to view:</label>
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

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto border rounded">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {columns.map((key, idx) => (
                  <th
                    key={key}
                    style={{ width: `${100 / columns.length}%` }}
                    className="border px-4 py-2 text-left bg-gray-100"
                  >
                    {key
                      .split("_")
                      .map(
                        (w) => w.charAt(0).toUpperCase() + w.slice(1)
                      )
                      .join(" ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
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
