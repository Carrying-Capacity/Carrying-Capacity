import React from "react";
import { ForceGraph2D } from "react-force-graph";

export default function PhaseIdentification() {
    // Minimal static graph
    const data = {
        nodes: [
            { id: "Substation" },
            { id: "T1" },
            { id: "H1" },
            { id: "H2" },
        ],
        links: [
            { source: "Substation", target: "T1" },
            { source: "T1", target: "H1" },
            { source: "T1", target: "H2" },
        ],
    };

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <ForceGraph2D
                graphData={data}
                nodeLabel={(node) => node.id}
                nodeAutoColorBy="id"
            />
        </div>
    );
}
