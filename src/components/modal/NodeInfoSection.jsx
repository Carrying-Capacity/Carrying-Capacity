import { memo, useMemo } from "react";
import { Home, Zap, Sun, Network as NetworkIcon } from "lucide-react";
import { isHouse as isHouseNode } from "../../utils/nodeUtils.js";
import { getPhaseColor, PHASE_COLORS } from "../../constants/index.js";
import { useTransformerData } from "../../hooks/useTransformerData.js";

export const NodeInfoSection = memo(({ node, imbalanceMetrics }) => {
  const isHouse = isHouseNode(node);
  const isTransformer = node?.type === 'transformer';
  const graphData = useTransformerData();

  // Count houses assigned to this transformer
  const houseCount = useMemo(() => {
    if (!isTransformer || !graphData?.nodes) return 0;
    return graphData.nodes.filter(n =>
      n.type === 'house' &&
      (n.parent_transformer === node.transformer_number ||
        n.parent === node.transformer_number ||
        n.parent === `Transformer ${node.transformer_number}`)
    ).length;
  }, [isTransformer, graphData?.nodes, node?.transformer_number]);

  const NodeTypeIcon = node?.type === 'house' ? Home : node?.type === 'transformer' ? Zap : NetworkIcon;

  return (
    <div className="bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/60">
        <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl flex-shrink-0">
          <NodeTypeIcon size={28} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-slate-900 mb-1">Node Information</h4>
          <span className="inline-block px-3 py-1 bg-slate-500/10 border border-slate-500/20 rounded-md text-xs font-semibold text-slate-600 capitalize">
            {node?.type ?? "—"}
          </span>
        </div>
      </div>

      {isTransformer && node?.transformer_number && (
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Zap size={16} className="flex-shrink-0" />
                <span>Transformer Number</span>
              </div>
              <div className="text-base font-semibold text-slate-900 pl-6">{node.transformer_number}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Home size={16} className="flex-shrink-0" />
                <span>Houses Assigned</span>
              </div>
              <div className="text-base font-semibold text-slate-900 pl-6">
                {houseCount} {houseCount === 1 ? 'house' : 'houses'}
              </div>
            </div>
          </div>

          {/* Imbalance Score Card */}
          {imbalanceMetrics && (
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <NetworkIcon size={16} className="flex-shrink-0" />
                  <span>Imbalance Score</span>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: imbalanceMetrics.color }}
                >
                  {imbalanceMetrics.score}/100
                </div>
              </div>

              <div
                className="p-3 rounded-lg border flex items-start gap-3"
                style={{
                  backgroundColor: `${imbalanceMetrics.color}10`, // 10% opacity
                  borderColor: `${imbalanceMetrics.color}40`,     // 40% opacity
                  color: imbalanceMetrics.level === 'Balanced' ? '#166534' : (imbalanceMetrics.level === 'Moderate' ? '#854d0e' : '#991b1b')
                }}
              >
                <div className="mt-0.5 p-1 rounded-full bg-white/50">
                  {imbalanceMetrics.level === 'Balanced' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={imbalanceMetrics.color}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={imbalanceMetrics.color}>
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h5 className="font-semibold text-sm">
                    {imbalanceMetrics.level} Phase Distribution
                  </h5>
                  <p className="text-xs opacity-90 font-medium">{imbalanceMetrics.message}</p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {isHouse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Home size={16} className="flex-shrink-0" />
              <span>House ID</span>
            </div>
            <div className="text-base font-semibold text-slate-900 pl-6">{node?.HouseID ?? "—"}</div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Zap size={16} className="flex-shrink-0" />
              <span>Predicted Phase</span>
            </div>
            <div className="pl-6">
              {(() => {
                const isThreePhase = Array.isArray(node?.predicted_phase) && node.predicted_phase.length > 1;
                const phase = Array.isArray(node?.predicted_phase) ? node.predicted_phase[0] : node?.predicted_phase;

                if (isThreePhase) {
                  return (
                    <div className="flex flex-col gap-2">
                      <span
                        className="inline-block px-3.5 py-1.5 border rounded-lg text-sm font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${PHASE_COLORS.THREE_PHASE}15`,
                          color: PHASE_COLORS.THREE_PHASE,
                          borderColor: `${PHASE_COLORS.THREE_PHASE}40`
                        }}
                      >
                        3-Phase Customer
                      </span>
                      <div className="text-xs text-slate-600 mt-1">
                        Phase Order: {node.predicted_phase.join(' → ')}
                      </div>
                    </div>
                  );
                }

                return (
                  <span
                    className="inline-block px-3.5 py-1.5 border rounded-lg text-sm font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${getPhaseColor(phase)}15`,
                      color: getPhaseColor(phase),
                      borderColor: `${getPhaseColor(phase)}40`
                    }}
                  >
                    Phase {phase ?? "—"}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Sun size={16} className="flex-shrink-0" />
              <span>Solar Panel</span>
            </div>
            <div className="pl-6">
              <span className={`inline-block px-3.5 py-1.5 rounded-lg text-sm font-semibold border ${node?.solar
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                }`}>
                {node?.solar ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <NetworkIcon size={16} className="flex-shrink-0" />
              <span>Parent Transformer</span>
            </div>
            <div className="pl-6">
              <span className="inline-block px-3 py-1.5 bg-slate-500/5 border border-slate-500/15 rounded-md font-mono text-sm font-semibold text-slate-900">
                {node?.parent_transformer ? `Transformer ${node.parent_transformer}` : node?.parent ?? "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

NodeInfoSection.displayName = "NodeInfoSection";
