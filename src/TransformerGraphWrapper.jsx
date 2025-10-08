// src/TransformerGraphWrapper.jsx
import React, { useState, Suspense, useEffect, useRef } from "react";
import TransformerGraph from "./TransformerGraph";
import { useTransformerData } from "./hooks/useTransformerData.js";
const InfoModal = React.lazy(() => import("./InfoModal"));

export default function TransformerGraphWrapper() {
    const data = useTransformerData();
    const [focusNode, setFocusNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchContainerRef = useRef(null);

    const handleNodeClick = (node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
    };

    const handleDropdownChange = (e) => {
        const nodeId = e.target.value;
        setFocusNode(nodeId);
        setSelectedNode(null);
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (term.length > 0) {
            const results = data.nodes.filter(node => 
                (node.type === "house" || node.type === "transformer" || node.type === "feeder") &&
                (node.id.toLowerCase().includes(term.toLowerCase()) ||
                 (node.label && node.label.toLowerCase().includes(term.toLowerCase())) ||
                 (node.name && node.name.toLowerCase().includes(term.toLowerCase())))
            ).slice(0, 10); // Limit to 10 results
            setSearchResults(results);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const handleSearchSelect = (node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
        setSearchTerm("");
        setShowSearchResults(false);
    };

    const closeModal = () => {
        setFocusNode(null);
        setSelectedNode(null);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div style={{ 
                display: "flex", 
                gap: "1rem", 
                padding: "0.5rem", 
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #ddd",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                {/* Transformer/Feeder Dropdown */}
                <div>
                    <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Navigate to:</label>
                    <select 
                        onChange={handleDropdownChange} 
                        value={focusNode || ""}
                        style={{ padding: "0.25rem", minWidth: "150px" }}
                    >
                        <option value="">Select Node</option>
                        <optgroup label="Feeders">
                            {data.nodes
                                .filter((n) => n.type === "feeder")
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name || `Feeder ${t.id}`}
                                    </option>
                                ))}
                        </optgroup>
                        <optgroup label="Transformers">
                            {data.nodes
                                .filter((n) => n.type === "transformer")
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name || `Transformer ${t.id}`}
                                    </option>
                                ))}
                        </optgroup>
                    </select>
                </div>

                {/* Search Input */}
                <div ref={searchContainerRef} style={{ position: "relative" }}>
                    <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Search:</label>
                    <input
                        type="text"
                        placeholder="Search houses, transformers..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ 
                            padding: "0.25rem", 
                            minWidth: "200px",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            left: "60px", // Offset by label width
                            right: 0,
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000
                        }}>
                            {searchResults.map((node) => (
                                <div
                                    key={node.id}
                                    onClick={() => handleSearchSelect(node)}
                                    style={{
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee"
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                                >
                                    <div style={{ fontWeight: "bold" }}>{node.label || node.id}</div>
                                    <div style={{ fontSize: "0.8em", color: "#666" }}>
                                        {node.type} • ID: {node.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
