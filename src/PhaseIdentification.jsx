import React, { useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function PhaseIdentification() {
    // fixed nodes
    const nodes = [
        { id: "Substation", x: 300, y: 50 },
        { id: "T1", x: 150, y: 200 },
        { id: "T2", x: 300, y: 200 },
        { id: "T3", x: 450, y: 200 },
        { id: "H1", x: 100, y: 400 },
        { id: "H2", x: 200, y: 400 },
        { id: "H3", x: 250, y: 400 },
        { id: "H4", x: 300, y: 400 },
        { id: "H5", x: 350, y: 400 },
        { id: "H6", x: 400, y: 400 },
        { id: "H7", x: 500, y: 400 },
    ];

    const links = [
        { source: "Substation", target: "T1" },
        { source: "Substation", target: "T2" },
        { source: "Substation", target: "T3" },
        { source: "T1", target: "H1" },
        { source: "T1", target: "H2" },
        { source: "T2", target: "H3" },
        { source: "T2", target: "H4" },
        { source: "T2", target: "H5" },
        { source: "T3", target: "H6" },
        { source: "T3", target: "H7" },
    ];

    const phaseColors = {
        Substation: "purple",
        Transformer: "orange",
        PhA: "red",
        PhB: "green",
        PhC: "blue",
    };

    // assign phases and types
    const nodesWithPhase = nodes.map((n) => {
        if (n.id.startsWith("H1") || n.id === "H4" || n.id === "H7") n.phase = "PhA";
        else if (n.id.startsWith("H2") || n.id === "H5") n.phase = "PhB";
        else if (n.id.startsWith("H3") || n.id === "H6") n.phase = "PhC";
        else if (n.id.startsWith("T")) n.phase = "Transformer";
        else n.phase = "Substation";
        return n;
    });

    const [focusedTransformer, setFocusedTransformer] = useState(null);

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <ForceGraph2D
                graphData={{ nodes: nodesWithPhase, links }}
                nodeLabel={(node) =>
                    node.phase ? `${node.id} - ${node.phase}` : node.id
                }
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    let color = phaseColors[node.phase] || "gray";
                    let alpha = 1;

                    if (!focusedTransformer) {
                        if (node.phase.startsWith("Ph")) alpha = 0.2;
                    } else {
                        if (
                            node.id.startsWith("H") &&
                            !links.some(
                                (l) => l.source === focusedTransformer && l.target === node.id
                            )
                        ) {
                            alpha = 0.2;
                        }
                    }

                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
                    ctx.fill();

                    ctx.globalAlpha = 1;
                    ctx.fillStyle = "black";
                    ctx.fillText(node.id, node.x + 12, node.y + 4);
                }}
                onNodeClick={(node) => {
                    if (node.phase === "Transformer") setFocusedTransformer(node.id);
                    else setFocusedTransformer(null);
                }}
                d3Alpha={0}
                d3VelocityDecay={1}
                linkColor={() => "#999"}

            />
        </div>
    );
}