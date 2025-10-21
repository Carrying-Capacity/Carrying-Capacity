import { Plus, Minus } from "lucide-react";
import { useComparison } from "../context/ComparisonContext.jsx";
import { getNodeIcon } from "../utils/iconUtils.js";

export const SearchDropdown = ({ nodes, onSelect }) => {
  const { comparisonIdSet, toggleHouseInComparison } = useComparison();

  if (!nodes?.length) return null;

  // Sort nodes: houses by HouseID, transformers by transformer_number
  const sortedNodes = [...nodes].sort((a, b) => {
    // Sort by type first (feeder, transformer, house)
    const typeOrder = { feeder: 0, transformer: 1, house: 2 };
    const typeA = typeOrder[a.type] ?? 3;
    const typeB = typeOrder[b.type] ?? 3;
    if (typeA !== typeB) return typeA - typeB;

    // Within same type, sort by number
    if (a.type === 'house') {
      const numA = a.HouseID || a.house_number || 0;
      const numB = b.HouseID || b.house_number || 0;
      return numA - numB;
    }
    if (a.type === 'transformer') {
      const numA = a.transformer_number || a.transformer || 0;
      const numB = b.transformer_number || b.transformer || 0;
      return numA - numB;
    }
    return 0;
  });

  return (
    <div className="modern-search-dropdown">
      {sortedNodes.map((node) => {
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
