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
    
    // Comparison feature state
    const [comparisonList, setComparisonList] = useState([]);
    const [showComparison, setShowComparison] = useState(false);

    const handleNodeClick = (node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
        setShowComparison(false); // Close comparison modal when selecting a new node
    };

    const handleDropdownChange = (e) => {
        const nodeId = e.target.value;
        if (nodeId) {
            const node = data.nodes.find(n => n.id === nodeId);
            setFocusNode(nodeId);
            setSelectedNode(node || null);
            setShowComparison(false); // Close comparison modal when selecting a new node
        } else {
            setFocusNode(null);
            setSelectedNode(null);
            setShowComparison(false); // Close comparison modal when clearing selection
        }
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
        setShowComparison(false); // Close comparison modal when selecting a new node via search
    };

    const closeModal = () => {
        setFocusNode(null);
        setSelectedNode(null);
        setShowComparison(false);
    };

    // Comparison helper functions
    const toggleHouseInComparison = (node) => {
        if (node.type === "house") {
            const isInList = comparisonList.find(house => house.id === node.id);
            if (isInList) {
                // Remove from comparison
                setComparisonList(prev => prev.filter(house => house.id !== node.id));
            } else {
                // Add to comparison
                setComparisonList(prev => [...prev, node]);
            }
        }
    };
    
    // Keep the old addToComparison for backward compatibility (now just calls toggleHouseInComparison)
    const addToComparison = (node) => {
        toggleHouseInComparison(node);
    };

    const removeFromComparison = (nodeId) => {
        setComparisonList(prev => prev.filter(house => house.id !== nodeId));
    };

    const clearComparison = () => {
        setComparisonList([]);
        setShowComparison(false);
    };

    const toggleComparisonModal = () => {
        if (comparisonList.length > 0) {
            setShowComparison(!showComparison);
        }
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="control-panel">
                {/* Left side - Navigation and Search */}
                <div className="control-panel-left">
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
                
                {/* Right side - Comparison Controls */}
                <div className="control-panel-right">
                    <div className="control-group">
                        {comparisonList.length > 0 && (
                            <button
                                onClick={clearComparison}
                                className="control-button control-button-secondary"
                                title="Clear comparison list"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={toggleComparisonModal}
                            disabled={comparisonList.length === 0}
                            className={`control-button ${
                                comparisonList.length === 0 ? 'control-button-disabled' : 'control-button-primary'
                            }`}
                            title={`Compare ${comparisonList.length} house${comparisonList.length !== 1 ? 's' : ''}`}
                        >
                            Compare Houses ({comparisonList.length})
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ 
                position: 'fixed',
                top: '110px', // nav (60px) + control panel (~50px)
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden'
            }}>
                <TransformerGraph
                    data={data}
                    focusNode={focusNode}
                    onNodeClick={handleNodeClick}
                    onAddToComparison={addToComparison}
                    comparisonList={comparisonList}
                />
                <Suspense fallback={null}>
                    <InfoModal 
                        node={selectedNode} 
                        onClose={closeModal}
                        isComparison={showComparison}
                        comparisonList={comparisonList}
                        onRemoveFromComparison={removeFromComparison}
                        onAddToComparison={addToComparison}
                    />
                </Suspense>
            </div>
        </div>
    );
}
