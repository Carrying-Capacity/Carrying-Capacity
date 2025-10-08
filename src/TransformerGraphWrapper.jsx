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
            <div className="control-panel">
                {/* Transformer/Feeder Dropdown */}
                <div className="control-group">
                    <label className="control-label">Navigate to:</label>
                    <select 
                        onChange={handleDropdownChange} 
                        value={focusNode || ""}
                        className="control-select"
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
                <div ref={searchContainerRef} className="control-group" style={{ position: "relative" }}>
                    <label className="control-label">Search:</label>
                    <input
                        type="text"
                        placeholder="Search houses, transformers..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="control-input"
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="search-dropdown">
                            {searchResults.map((node) => (
                                <div
                                    key={node.id}
                                    onClick={() => handleSearchSelect(node)}
                                    className="search-item"
                                >
                                    <div className="search-item-title">{node.label || node.id}</div>
                                    <div className="search-item-subtitle">
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
