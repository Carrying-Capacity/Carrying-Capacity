import React, { memo } from "react";
import { Home, Zap, Sun, Network } from "lucide-react";
import { isHouse as isHouseNode } from "../../utils/nodeUtils.js";

export const NodeInfoSection = memo(({ node }) => {
  const isHouse = isHouseNode(node);
  
  const getPhaseColor = (phase) => {
    switch(phase) {
      case 'A': return '#ef4444';
      case 'B': return '#22c55e';
      case 'C': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="node-info-card">
      <div className="node-info-header">
        <div className="node-info-icon">
          {node?.type === 'house' ? '🏠' : node?.type === 'transformer' ? '⚡' : '🔌'}
        </div>
        <div className="node-info-title">
          <h4>Node Information</h4>
          <span className="node-type-badge">{node?.type ?? "—"}</span>
        </div>
      </div>
      
      {isHouse && (
        <div className="node-info-grid">
          <div className="node-info-item">
            <div className="node-info-label">
              <Home size={16} />
              <span>House ID</span>
            </div>
            <div className="node-info-value">{node?.HouseID ?? "—"}</div>
          </div>
          
          <div className="node-info-item">
            <div className="node-info-label">
              <Zap size={16} />
              <span>Predicted Phase</span>
            </div>
            <div className="node-info-value">
              <span 
                className="phase-badge"
                style={{ 
                  backgroundColor: `${getPhaseColor(node?.predicted_phase)}15`,
                  color: getPhaseColor(node?.predicted_phase),
                  borderColor: `${getPhaseColor(node?.predicted_phase)}40`
                }}
              >
                Phase {node?.predicted_phase ?? "—"}
              </span>
            </div>
          </div>
          
          <div className="node-info-item">
            <div className="node-info-label">
              <Sun size={16} />
              <span>Solar Panel</span>
            </div>
            <div className="node-info-value">
              <span className={`status-badge ${node?.solar ? 'status-yes' : 'status-no'}`}>
                {node?.solar ? "Yes" : "No"}
              </span>
            </div>
          </div>
          
          <div className="node-info-item">
            <div className="node-info-label">
              <Network size={16} />
              <span>Parent Transformer</span>
            </div>
            <div className="node-info-value transformer-id">{node?.parent ?? "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
});

NodeInfoSection.displayName = "NodeInfoSection";
