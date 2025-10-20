import { Trash2, Home, X } from "lucide-react";
import { useComparison } from "../context/ComparisonContext.jsx";

export const ComparisonDropdown = ({ onClearAll }) => {
  const { comparisonList, removeFromComparison } = useComparison();

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
        {comparisonList.map((house) => (
          <div key={house.id} className="comparison-dropdown-item">
            <div className="comparison-item-icon">
              <Home size={16} />
            </div>
            <div className="comparison-item-info">
              <span className="comparison-item-name">{house.label || house.id}</span>
              <span className="comparison-item-id">ID: {house.id}</span>
            </div>
            <button
              onClick={() => removeFromComparison(house.id)}
              className="comparison-item-remove"
              title="Remove from comparison"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
