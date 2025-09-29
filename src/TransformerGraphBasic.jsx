// src/TransformerGraph.jsx
import React from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function TransformerGraph({ data, onNodeClick }) {
    return (
        <ForceGraph2D
            graphData={data}
            enableNodeDrag={false}       // no dragging
            d3VelocityDecay={1}          // disable forces
            cooldownTicks={0}            // no simulation
            warmupTicks={0}
            nodeRelSize={6}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            nodeCanvasObject={(node, ctx) => {
                // simple circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle =
                    node.type === "grid"
                        ? "red"
                        : node.type === "transformer"
                            ? "orange"
                            : "blue";
                ctx.fill();

                // label
                ctx.fillStyle = "black";
                ctx.font = "10px Arial";
                ctx.fillText(node.id, node.x + 10, node.y + 4);
            }}
            onNodeClick={onNodeClick}
        />
    );
}
