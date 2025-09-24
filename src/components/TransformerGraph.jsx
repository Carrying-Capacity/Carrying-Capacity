import React, { useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Generate transformer graph with houses connected to transformer or each other
function generateTransformerGraph(transformerId) {
    const numHouses = Math.floor(Math.random() * 5) + 5; // 5–9 houses
    const transformerNode = { id: `T${transformerId}`, name: `Transformer ${transformerId}`, type: "transformer", x: 400, y: 300 };

    // Create house nodes
    const houseNodes = Array.from({ length: numHouses }, (_, i) => {
        const angle = (2 * Math.PI * i) / numHouses;
        const radius = 200 + Math.random() * 50; // some variation
        return {
            id: `T${transformerId}-H${i + 1}`,
            name: `House ${i + 1}`,
            type: "house",
            phase: ["PhA", "PhB", "PhC"][i % 3],
            info: `Details of House ${i + 1} for Transformer ${transformerId}`,
            x: transformerNode.x + radius * Math.cos(angle),
            y: transformerNode.y + radius * Math.sin(angle)
        };
    });

    // Links: some houses connect to transformer, some to other houses
    const links = [];

    houseNodes.forEach((house, idx) => {
        if (Math.random() < 0.5) {
            // 50% chance connect to transformer
            links.push({ source: transformerNode.id, target: house.id });
        } else {
            // Otherwise connect to a random previous house
            const targetIdx = Math.floor(Math.random() * idx);
            links.push({ source: houseNodes[targetIdx].id, target: house.id });
        }
    });

    // Extra random house-house links for visual variety
    for (let i = 0; i < houseNodes.length; i++) {
        for (let j = i + 1; j < houseNodes.length; j++) {
            if (Math.random() < 0.2) links.push({ source: houseNodes[i].id, target: houseNodes[j].id });
        }
    }

    return { nodes: [transformerNode, ...houseNodes], links };
}

export default function TransformerGraph({ transformer }) {
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        if (transformer) setGraphData(generateTransformerGraph(transformer));
    }, [transformer]);

    if (!transformer) return <div style={{ textAlign: "center", marginTop: "20px" }}>Select a transformer</div>;

    const nodeColors = { transformer: "orange", PhA: "red", PhB: "green", PhC: "blue" };
    const nodeSizes = { transformer: 16, house: 8 };

    return (
        <div className="graph-container">
            {graphData && (
                <ForceGraph2D
                    graphData={graphData}
                    nodeLabel={n => n.phase ? `${n.name} - ${n.phase}` : n.name}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

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
                        if (node.type === "house") setSelectedHouse(node);
                    }}
                    d3VelocityDecay={1}   // static
                    enableNodeDrag={false} // disable dragging
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkColor={() => "#999"}
                />
            )}
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