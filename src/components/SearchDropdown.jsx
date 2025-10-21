import { Plus, Minus } from "lucide-react";
import { useComparison } from "../context/ComparisonContext.jsx";
import { getNodeIcon } from "../utils/iconUtils.js";

export const SearchDropdown = ({ nodes, onSelect }) => {
  const { comparisonIdSet, toggleHouseInComparison } = useComparison();

  if (!nodes?.length) return null;

  return (
    <div className="modern-search-dropdown">
      {nodes.map((node) => {
        const isInComparison = comparisonIdSet.has(node.id);
        const isHouse = node.type === "house";
        const NodeIcon = getNodeIcon(node.type);
        const transformerNumber = node.transformer_number || node.transformer;
        const displayName = node.type === 'transformer'
          ? `Transformer ${transformerNumber ?? ''}`.trim()
          : node.type === 'feeder'
            ? 'Feeder'
            : (node.label || `House ${node.HouseID || node.house_number || ''}`.trim());
        
        // Get phase information for houses
        const phaseInfo = node.type === 'house' && node.predicted_phase 
          ? (Array.isArray(node.predicted_phase) ? node.predicted_phase.join('') : node.predicted_phase)
          : null;
        
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
              <div className="search-item-name">{displayName}</div>
              <div className="search-item-meta">
                
                {node.type === 'house' && phaseInfo && (
                  <>
                    <span className="search-item-type">Phase {phaseInfo}</span>
                  </>
                )}
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
