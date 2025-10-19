// src/TransformerGraphWrapper.jsx
import React, { useState, Suspense, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Search, Navigation, Layers, X, Plus, Minus, GitCompare, Trash2, Home, Zap as ZapIcon, Network } from "lucide-react";
import TransformerGraph from "./TransformerGraph";
import { useTransformerData } from "./hooks/useTransformerData.js";
import "./TransformerGraphWrapper.css";
const InfoModal = React.lazy(() => import("./InfoModal"));

export default function TransformerGraphWrapper() {
    const data = useTransformerData();
    const [focusNode, setFocusNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const searchContainerRef = useRef(null);
    
    // Comparison feature state
    const [comparisonList, setComparisonList] = useState([]);
    const [showComparison, setShowComparison] = useState(false);

    // Memoize expensive calculations
    const metrics = useMemo(() => ({
        houses: data?.nodes?.filter(n => n.type === "house").length || 0,
        transformers: data?.nodes?.filter(n => n.type === "transformer").length || 0,
        connections: data?.links?.length || 0
    }), [data?.nodes, data?.links]);

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

    // Memoize filtered search results
    const filteredNodes = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        const lowerTerm = searchTerm.toLowerCase();
        return data.nodes.filter((n) => {
            const label = (n.label || n.id || "").toLowerCase();
            const type = (n.type || "").toLowerCase();
            return label.includes(lowerTerm) || type.includes(lowerTerm);
        }).slice(0, 10); // Limit to 10 results
    }, [searchTerm, data.nodes]);

    const handleSearchChange = useCallback((e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowSearchResults(term.trim().length > 0);
    }, []);

    // Update search results when filteredNodes change
    useEffect(() => {
        setSearchResults(filteredNodes);
    }, [filteredNodes]);

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
        <div className="transformer-wrapper-modern">
            <div className="modern-control-panel">
                <div className="control-panel-container">
                    {/* Left side - Navigation and Search */}
                    <div className="control-panel-left">
                        {/* Transformer/Feeder Dropdown */}
                        <div className="modern-control-group">
                            <div className="control-icon-wrapper">
                                <Navigation size={18} className="control-icon" />
                            </div>
                            <select 
                                onChange={handleDropdownChange} 
                                value={focusNode || ""}
                                className="modern-select"
                            >
                                <option value="">Navigate to node...</option>
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
                        <div ref={searchContainerRef} className="modern-control-group search-control">
                            <div className="control-icon-wrapper">
                                <Search size={18} className="control-icon" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search houses, transformers..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="modern-input"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm("");
                                        setShowSearchResults(false);
                                    }}
                                    className="search-clear-btn"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            
                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="modern-search-dropdown">
                                    {searchResults.map((node) => {
                                        const isInComparison = comparisonList.find(house => house.id === node.id);
                                        const isHouse = node.type === "house";
                                        const NodeIcon = node.type === "feeder" ? Network : node.type === "transformer" ? ZapIcon : Home;
                                        
                                        return (
                                            <div
                                                key={node.id}
                                                className="modern-search-item"
                                                onClick={() => handleSearchSelect(node)}
                                            >
                                                <div className="search-item-icon-wrapper">
                                                    <NodeIcon size={18} />
                                                </div>
                                                <div className="search-item-info">
                                                    <div className="search-item-name">{node.label || node.id}</div>
                                                    <div className="search-item-meta">
                                                        <span className="search-item-type">{node.type}</span>
                                                        <span className="search-item-divider">•</span>
                                                        <span className="search-item-id">ID: {node.id}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Comparison Button - Only show for houses */}
                                                {isHouse && (
                                                    <button
                                                        className={`search-compare-btn ${isInComparison ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleHouseInComparison(node);
                                                        }}
                                                        title={isInComparison ? "Remove from comparison" : "Add to comparison"}
                                                    >
                                                        {isInComparison ? <Minus size={16} /> : <Plus size={16} />}
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
                        {comparisonList.length > 0 && (
                            <>
                                <div className="comparison-badge">
                                    <Layers size={16} />
                                    <span>{comparisonList.length} house{comparisonList.length !== 1 ? 's' : ''}</span>
                                </div>
                                <button
                                    onClick={clearComparison}
                                    className="modern-btn modern-btn-secondary"
                                    title="Clear comparison list"
                                >
                                    <Trash2 size={16} />
                                    <span>Clear</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={toggleComparisonModal}
                            disabled={comparisonList.length === 0}
                            className={`modern-btn modern-btn-primary ${
                                comparisonList.length === 0 ? 'disabled' : ''
                            }`}
                            title={`Compare ${comparisonList.length} house${comparisonList.length !== 1 ? 's' : ''}`}
                        >
                            <GitCompare size={16} />
                            <span>Compare</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Network Metrics - Hidden when modal is fullscreen */}
            {!isModalFullscreen && (
                <div className="network-metrics">
                <div className="metric-card">
                    <div className="metric-icon-wrapper metric-icon-houses">
                        <Home size={20} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.houses}</div>
                        <div className="metric-label">Houses</div>
                    </div>
                </div>
                
                <div className="metric-card">
                    <div className="metric-icon-wrapper metric-icon-transformers">
                        <ZapIcon size={20} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.transformers}</div>
                        <div className="metric-label">Transformers</div>
                    </div>
                </div>
                
                <div className="metric-card">
                    <div className="metric-icon-wrapper metric-icon-connections">
                        <Network size={20} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{metrics.connections}</div>
                        <div className="metric-label">Connections</div>
                    </div>
                </div>
                </div>
            )}

            <div style={{ 
                position: 'fixed',
                top: '132px', // nav (72px) + control panel (~60px)
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
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
                        onFullscreenChange={setIsModalFullscreen}
                    />
                </Suspense>
            </div>
        </div>
    );
}
