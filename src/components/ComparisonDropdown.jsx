import { Trash2, Home, X } from "lucide-react";
import { useComparison } from "../context/ComparisonContext.jsx";

export const ComparisonDropdown = ({ onClearAll }) => {
  const { comparisonList, removeFromComparison } = useComparison();

  if (!comparisonList || !Array.isArray(comparisonList)) {
    return null;
  }

  // Sort houses by HouseID
  const sortedList = [...comparisonList].sort((a, b) => {
    const rawA = Number(a.HouseID ?? a.house_number ?? 0);
    const rawB = Number(b.HouseID ?? b.house_number ?? 0);
    const numA = Number.isNaN(rawA) ? 0 : rawA;
    const numB = Number.isNaN(rawB) ? 0 : rawB;
    return numA - numB;
  });

  return (
    <div className="comparison-dropdown">
      <div className="comparison-dropdown-header">
        <span className="comparison-dropdown-title">Comparison List</span>
        <button
          onClick={onClearAll}
          className="comparison-clear-all"
          title="Clear all"
        >
          <Trash2 size={14} />
          Clear All
        </button>
      </div>
      <div className="comparison-dropdown-list">
        {sortedList.map((house) => {
          const phaseDisplay = Array.isArray(house.predicted_phase) && house.predicted_phase.length > 1
            ? `3-Phase (${house.predicted_phase.join(' → ')})`
            : Array.isArray(house.predicted_phase)
              ? `Phase ${house.predicted_phase[0]}`
              : `Phase ${house.predicted_phase || 'Unknown'}`;
          
          return (
          <div key={house.id} className="comparison-dropdown-item">
            <div className="comparison-item-icon">
              <Home size={16} />
            </div>
            <div className="comparison-item-info">
              <span className="comparison-item-name">{house.label || house.id}</span>
              <span className="comparison-item-id">{phaseDisplay}</span>
            </div>
            <button
              onClick={() => removeFromComparison(house.id)}
              className="comparison-item-remove"
              title="Remove from comparison"
            >
              <X size={16} />
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
};
