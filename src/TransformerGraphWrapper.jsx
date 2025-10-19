// src/TransformerGraphWrapper.jsx
import React, { useState, Suspense, useEffect, useRef, useCallback, useMemo } from "react";
import { CirclePlus, CircleMinus } from "lucide-react";
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

    const handleNodeClick = useCallback((node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
        setShowComparison(false);
    }, []);

    const handleDropdownChange = useCallback((e) => {
        const nodeId = e.target.value;
        if (nodeId) {
            const node = data.nodes.find(n => n.id === nodeId);
            setFocusNode(nodeId);
            setSelectedNode(node || null);
        } else {
            setFocusNode(null);
            setSelectedNode(null);
        }
        setShowComparison(false);
    }, [data.nodes]);

    const handleSearchChange = useCallback((e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (term.length > 0) {
            const lowerTerm = term.toLowerCase();
            const results = data.nodes.filter(node => {
                const validType = node.type === "house" || node.type === "transformer" || node.type === "feeder";
                if (!validType) return false;
                
                return node.id.toLowerCase().includes(lowerTerm) ||
                       node.label?.toLowerCase().includes(lowerTerm) ||
                       node.name?.toLowerCase().includes(lowerTerm);
            }).slice(0, 10);
            setSearchResults(results);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    }, [data.nodes]);

    const handleSearchSelect = useCallback((node) => {
        setFocusNode(node.id);
        setSelectedNode(node);
        setSearchTerm("");
        setShowSearchResults(false);
        setShowComparison(false);
    }, []);

    const closeModal = useCallback(() => {
        setFocusNode(null);
        setSelectedNode(null);
        setShowComparison(false);
    }, []);

    // Comparison helper functions
    const toggleHouseInComparison = useCallback((node) => {
        if (node.type === "house") {
            setComparisonList(prev => {
                const isInList = prev.find(house => house.id === node.id);
                if (isInList) {
                    return prev.filter(house => house.id !== node.id);
                } else {
                    return [...prev, node];
                }
            });
        }
    }, []);
    
    const addToComparison = useCallback((node) => {
        toggleHouseInComparison(node);
    }, [toggleHouseInComparison]);

    const removeFromComparison = useCallback((nodeId) => {
        setComparisonList(prev => prev.filter(house => house.id !== nodeId));
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonList([]);
        setShowComparison(false);
    }, []);

    const toggleComparisonModal = useCallback(() => {
        if (comparisonList.length > 0) {
            setShowComparison(prev => !prev);
        }
    }, [comparisonList.length]);

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
        <div className="transformer-wrapper">
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
                                {searchResults.map((node) => {
                                    const isInComparison = comparisonList.find(house => house.id === node.id);
                                    const isHouse = node.type === "house";
                                    
                                    return (
                                        <div
                                            key={node.id}
                                            className="search-item"
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                if (isHouse) {
                                                    toggleHouseInComparison(node);
                                                }
                                            }}
                                        >
                                            <div 
                                                className="search-item-content"
                                                onClick={() => handleSearchSelect(node)}
                                            >
                                                <div className="search-item-title">{node.label || node.id}</div>
                                                <div className="search-item-subtitle">
                                                    {node.type} • ID: {node.id}
                                                    {isHouse && (
                                                        <span className="right-click-hint"> • Right-click to compare</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Comparison Button - Only show for houses */}
                                            {isHouse && (
                                                <button
                                                    className="search-item-compare-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleHouseInComparison(node);
                                                    }}
                                                    title={isInComparison ? "Remove from comparison" : "Add to comparison"}
                                                >
                                                    {isInComparison ? (
                                                        <CircleMinus className="search-item-compare-icon" />
                                                    ) : (
                                                        <CirclePlus className="search-item-compare-icon" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
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
                top: '122px', // nav (72px) + control panel (~50px)
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
