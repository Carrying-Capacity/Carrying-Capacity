import { Plus, Minus } from "lucide-react";
import { useComparison } from "../context/ComparisonContext.jsx";
import { getNodeIcon } from "../utils/iconUtils.js";

export const SearchDropdown = ({ nodes, onSelect }) => {
  const { comparisonIdSet, toggleHouseInComparison } = useComparison();

  if (!nodes.length) return null;

  return (
    <div className="modern-search-dropdown">
      {nodes.map((node) => {
        const isInComparison = comparisonIdSet.has(node.id);
        const isHouse = node.type === "house";
        const NodeIcon = getNodeIcon(node.type);
        
        return (
          <div
            key={node.id}
            className="modern-search-item"
            onClick={() => onSelect(node)}
          >
            <div className="search-item-icon-wrapper">
              <NodeIcon size={18} />
            </div>
            <div className="search-item-info">
              <div className="search-item-name">{node.label || node.id}</div>
              <div className="search-item-meta">
                <span className="search-item-type">{node.type}</span>
                <span className="search-item-divider">•</span>
                <span className="search-item-id">ID: {node.id}</span>
              </div>
            </div>
            
            {isHouse && (
              <button
                className={`search-compare-btn ${isInComparison ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHouseInComparison(node);
                }}
                title={isInComparison ? "Remove from comparison" : "Add to comparison"}
              >
                {isInComparison ? <Minus size={16} /> : <Plus size={16} />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
