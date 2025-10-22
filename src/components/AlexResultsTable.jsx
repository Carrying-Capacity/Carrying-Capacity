import React, { useState } from "react";
import data from "../data/alex_results.json"; // adjust path

const AlexResultTable = () => {
  // Dynamically get categories from JSON keys
  const categories = Object.keys(data);

  // Default to first category
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  const currentData = data[selectedCategory] || [];

  const renderValue = (val) => {
    if (Array.isArray(val)) {
      // Render arrays with commas and spaces
      return val.join(", ");
    }
    if (typeof val === "boolean") {
      return val ? "Yes" : "No";
    }
    return val;
  };

    // Find the total row (by id === "total")
  return (
    <div className="w-full p-4 bg-white shadow rounded-lg">
      {/* Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Method of phase estimation:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded p-1"
        >
          {categories.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto border rounded">
          <table className="w-full min-w-[600px] border-collapse table-auto">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {currentData.length > 0 &&
                  Object.keys(currentData[0]).map((key) => (
                    <th
                      key={key}
                      className="border px-4 py-2 text-left bg-gray-200"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>{currentData.map((item, idx) => {
                const isTotalRow =
                  Object.values(item).some(
                    (val) =>
                      typeof val === "string" &&
                      val.toLowerCase().trim() === "total"
                  ) ||
                  Object.keys(item).some(
                    (key) =>
                      key.toLowerCase().trim() === "total"
                  );

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 ${
                      isTotalRow ? "bg-gray-50 font-bold" : ""
                    }`}
                  >
                    {Object.values(item).map((val, i) => (
                      <td key={i} className="border px-4 py-2 text-center align-middle">
                      {renderValue(val)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {currentData.length === 0 && <p className="mt-2">No data available.</p>}
    </div>
  );
};

export default AlexResultTable;
