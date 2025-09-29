import React, { useState } from "react";
import TransformerGraph from "./TransformerGraph";
import sampleData from "./data/sampleData"; // your static graph data

export default function App() {
    const [focusNode, setFocusNode] = useState(null); // node id to zoom/focus
    const [selectedNode, setSelectedNode] = useState(null); // node clicked for info

    const handleNodeClick = (node) => {
        setFocusNode(node.id);       // zoom/focus on clicked node
        setSelectedNode(node);       // show info modal
    };

    const handleDropdownChange = (e) => {
        const transformerId = e.target.value;
        setFocusNode(transformerId);
        setSelectedNode(null);       // clear info modal
    };

    const closeModal = () => {
        setFocusNode(null);
        setSelectedNode(null);
    }

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Navbar */}
            <nav
                style={{
                    backgroundColor: "#333",
                    color: "white",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <h1 style={{ margin: 0 }}>Phase Identification Map</h1>
                <select onChange={handleDropdownChange} value={focusNode || ""}>
                    <option value="">Select Transformer</option>
                    {sampleData.nodes
                        .filter((n) => n.type === "transformer")
                        .map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name || t.id}
                            </option>
                        ))}
                </select>
            </nav>

            {/* Graph */}
            <div style={{ flex: 1, minHeight: "100vh", position: "relative" }}>
                <TransformerGraph
                    data={sampleData}
                    focusNode={focusNode}
                    onNodeClick={handleNodeClick}
                />
            </div>

            {/* Info Modal */}
            {selectedNode && (
                <div
                    style={{
                        position: "absolute",
                        top: "100px",
                        right: "50px",
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "1rem",
                        zIndex: 10,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        width: "250px",
                    }}
                >
                    <h3>{selectedNode.name || selectedNode.id}</h3>
                    <p>Type: {selectedNode.type}</p>
                    <p>Additional info can go here...</p>
                    <button
                        onClick={closeModal}
                        style={{
                            marginTop: "1rem",
                            padding: "0.25rem 0.5rem",
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
