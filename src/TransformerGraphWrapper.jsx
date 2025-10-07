// src/TransformerGraphWrapper.jsx
import React, { useState, Suspense } from "react";
import TransformerGraph from "./TransformerGraph";
import { useTransformerData } from "./hooks/useTransformerData.js";
const InfoModal = React.lazy(() => import("./InfoModal"));

export default function TransformerGraphWrapper() {
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
        <>
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

            <div style={{ flex: 1, position: "relative", height: "100%" }}>
                <TransformerGraph
                    data={data}
                    focusNode={focusNode}
                    onNodeClick={handleNodeClick}
                />
                <Suspense fallback={null}>
                    <InfoModal node={selectedNode} onClose={closeModal} />
                </Suspense>
            </div>
        </>
    );
}
