import React, { memo } from "react";

export const NodeInfoSection = memo(({ node }) => {
  const isHouse = node.type === "house";

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
      <p className="text-lg mb-2">
        <strong>Type:</strong> {node.type}
      </p>
      {isHouse && (
        <>
          <p className="mb-1">
            <strong>House ID:</strong> {node.HouseID}
          </p>
          <p className="mb-1">
            <strong>Predicted Phase:</strong> {node.predicted_phase}
          </p>
          <p className="mb-1">
            <strong>Solar:</strong> {node.solar ? "Yes" : "No"}
          </p>
          <p className="mb-1">
            <strong>Parent Transformer:</strong> {node.parent}
          </p>
        </>
      )}
    </div>
  );
});

NodeInfoSection.displayName = "NodeInfoSection";
