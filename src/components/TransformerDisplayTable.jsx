import React, { useState } from "react";
import data from "../data/json_maker_result.json"; // make this actually use James' table

// Categories moved outside the component
const categories = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17"];

const ReactiveTable = () => {
  const [selectedCategory, setSelectedCategory] = useState("15");

  const currentData = data[selectedCategory] || [];

  const renderValue = (val) => {
    if (typeof val === "boolean") {
      return val ? "Yes" : "No";
    }
    return val;
  };

  return (
    <div className="w-full p-4 bg-white shadow rounded-lg">
      {/* Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Choose transformer to view:</label>
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
                      className="border px-4 py-2 text-left bg-gray-100"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(item).map((val, i) => (
                    <td key={i} className="border px-4 py-2">
                      {renderValue(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentData.length === 0 && <p className="mt-2">No data available.</p>}
    </div>
  );
};

export default ReactiveTable;
