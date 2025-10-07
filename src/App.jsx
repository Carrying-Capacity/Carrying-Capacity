import React, { useState, Suspense } from "react";
import TransformerGraph from "./TransformerGraph";
import { useTransformerData } from "./hooks/useTransformerData.js";
import logo from "./assets/logo.svg";

// Lazy load InfoModal to reduce initial bundle size
const InfoModal = React.lazy(() => import("./InfoModal"));

export default function App() {
    const data = useTransformerData();
    const [focusNode, setFocusNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const handleNodeClick = (node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
    };

    const handleDropdownChange = (e) => {
        const transformerId = e.target.value;
        setFocusNode(transformerId);
        setSelectedNode(null);
    };

    const closeModal = () => {
        setFocusNode(null);
        setSelectedNode(null);
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <nav
                style={{
                    flex: "0 0 5vh",     // exactly 5vh tall
                    backgroundColor: "#333",
                    color: "white",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img 
                        src={logo} 
                        alt="Phase Identification Map Logo" 
                        style={{ width: "32px", height: "32px" }}
                    />
                    <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Phase Identification Map</h1>
                </div>
                <select onChange={handleDropdownChange} value={focusNode || ""}>
                    <option value="">Select Transformer</option>
                    {data.nodes
                        .filter((n) => n.type === "transformer")
                        .map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name || t.id}
                            </option>
                        ))}
                </select>
            </nav>

            <div style={{ flex: 1, position: "relative", height: "100%"}}>
                <TransformerGraph
                    data={data}
                    focusNode={focusNode}
                    onNodeClick={handleNodeClick}
                />
                <Suspense fallback={null}>
                    <InfoModal node={selectedNode} onClose={closeModal} />
                </Suspense>
            </div>
        </div>
    );
}