import React, { memo } from "react";
import { isHouse as isHouseNode } from "../../utils/nodeUtils.js";

export const NodeInfoSection = memo(({ node }) => {
  const isHouse = isHouseNode(node);

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
      <p className="text-lg mb-2">
        <strong>Type:</strong> {node?.type ?? "—"}
      </p>
      {isHouse && (
        <dl className="space-y-1">
          <div><dt className="font-semibold inline">House ID:</dt> <dd className="inline">{node?.HouseID ?? "—"}</dd></div>
          <div><dt className="font-semibold inline">Predicted Phase:</dt> <dd className="inline">{node?.predicted_phase ?? "—"}</dd></div>
          <div><dt className="font-semibold inline">Solar:</dt> <dd className="inline">{node?.solar ? "Yes" : "No"}</dd></div>
          <div><dt className="font-semibold inline">Parent Transformer:</dt> <dd className="inline">{node?.parent ?? "—"}</dd></div>
        </dl>
      )}
    </div>
  );
});

NodeInfoSection.displayName = "NodeInfoSection";
