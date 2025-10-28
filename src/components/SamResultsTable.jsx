import React from "react";
import data from "../data/sam_results.json";

const SamResultTable = () => {
  const { results, time } = data;

  return (
    <div>
      {/* Results Table */}
      <div className="overflow-x-auto mb-4 mx-40">
        <table className="w-full min-w-[400px] border-collapse table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Method</th>
              <th className="border px-4 py-2 text-center">Score (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results).map(([method, score]) => (
              <tr key={method} className="hover:bg-gray-50">
                <td className="border px-4 py-2 capitalize">{method.replace("_", "-")}</td>
                <td className="border px-4 py-2 text-center">{score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SamResultTable;
