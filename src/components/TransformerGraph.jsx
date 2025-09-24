import React, { useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Example static data
function generateHouses(transformerId) {
    const numHouses = Math.floor(Math.random() * 6) + 3; // 3-8 houses
    const houses = Array.from({ length: numHouses }, (_, i) => ({
        id: `T${transformerId}-H${i + 1}`,
        name: `House ${i + 1}`,
        phase: ["PhA", "PhB", "PhC"][i % 3],
        info: `Details of House ${i + 1} for Transformer ${transformerId}`,
    }));
    return {
        nodes: [
            { id: `T${transformerId}`, name: `Transformer ${transformerId}`, type: "transformer" },
            ...houses.map(h => ({ ...h, type: "house" }))
        ],
        links: houses.map(h => ({ source: `T${transformerId}`, target: h.id }))
    };
}

export default function TransformerGraph({ transformer }) {
    const [selectedHouse, setSelectedHouse] = useState(null);

    if (!transformer)
        return <div style={{ textAlign: "center", marginTop: "20px" }}>Select a transformer</div>;

    const graphData = generateHouses(transformer);

    const nodeColors = { transformer: "orange", PhA: "red", PhB: "green", PhC: "blue" };
    const nodeSizes = { transformer: 16, house: 8 };

    return (
        <div className="graph-container">
            <ForceGraph2D
                graphData={graphData}
                nodeLabel={n => n.phase ? `${n.name} - ${n.phase}` : n.name}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    // Determine color and size
                    const color = node.type === "transformer" ? nodeColors.transformer : nodeColors[node.phase];
                    const size = node.type === "transformer" ? nodeSizes.transformer : nodeSizes.house;

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                    ctx.fill();

                    ctx.fillStyle = "black";
                    ctx.fillText(node.name, node.x + 10, node.y + 4);
                }}
                onNodeClick={node => {
                    // Only show info for houses
                    if (node.type === "house") setSelectedHouse(node);
                }}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkColor={() => "#999"}
            />
            {selectedHouse && (
                <div className="info-box">
                    <h3>{selectedHouse.name}</h3>
                    <p>{selectedHouse.info}</p>
                    <button onClick={() => setSelectedHouse(null)}>Close</button>
                </div>
            )}
        </div>
    );
}
