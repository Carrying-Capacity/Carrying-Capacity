import { useState, useRef, useMemo } from "react";
import { Search, Navigation, Layers, X, GitCompare, Home, Zap as ZapIcon, Network, ChevronDown } from "lucide-react";
import TransformerGraph from "./TransformerGraph";
import InfoModal from "./InfoModal";
import { MetricCard } from "./shared/MetricCard";
import { SearchDropdown } from "./SearchDropdown";
import { ComparisonDropdown } from "./ComparisonDropdown";
import { ComparisonProvider } from "../context/ComparisonContext.jsx";
import { useComparison } from "../context/ComparisonContext.jsx";
import { useTransformerData } from "../hooks/useTransformerData.js";
import { useClickOutside } from "../hooks/useClickOutside.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { useControlPanelHeight } from "../hooks/useControlPanelHeight.js";
import { formatCount } from "../utils/stringUtils.js";
import { BREAKPOINTS, UI_CONSTANTS } from "../constants/index.js";
import "./TransformerGraphWrapper.css";

const TransformerGraphWrapperContent = () => {
    const data = useTransformerData();
    const nodes = data?.nodes || [];
    const links = data?.links || [];
    
    const [focusNode, setFocusNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const [showComparisonDropdown, setShowComparisonDropdown] = useState(false);
    const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
    const searchContainerRef = useRef(null);
    const comparisonDropdownRef = useRef(null);
    
    const isMobile = useMediaQuery(BREAKPOINTS.tablet);
    const {
        comparisonList,
        showComparison,
        clearComparison,
        toggleComparisonModal,
        setShowComparison,
    } = useComparison();
    const graphTopOffset = useControlPanelHeight();

    const { feederNodes, transformerNodes, houseCount, transformerCount, connectionCount } = useMemo(() => {
        const feeders = [];
        const transformers = [];
        let houses = 0;
        
        nodes.forEach(n => {
            if (n.type === "feeder") feeders.push(n);
            else if (n.type === "transformer") transformers.push(n);
            else if (n.type === "house") houses++;
        });
        
        // Sort transformers by transformer_number
        transformers.sort((a, b) => {
            const numA = a.transformer_number || a.transformer || 0;
            const numB = b.transformer_number || b.transformer || 0;
            return numA - numB;
        });
        
        return {
            feederNodes: feeders,
            transformerNodes: transformers,
            houseCount: houses,
            transformerCount: transformers.length,
            connectionCount: links.length
        };
    }, [nodes, links]);

    const handleNodeClick = (node) => {
        setFocusNode(String(node.id));
        // Don't show info modal for feeder nodes, just zoom to them
        if (node.type !== 'feeder') {
            setSelectedNode(node);
        }
        setShowComparison(false);
    };

    const handleDropdownChange = (e) => {
        const nodeId = e.target.value;
        if (nodeId) {
            const node = nodes.find(n => String(n.id) === nodeId);
            setFocusNode(nodeId);
            // Don't show info modal for feeder nodes, just zoom to them
            if (node && node.type !== 'feeder') {
                setSelectedNode(node);
            } else {
                setSelectedNode(null);
            }
        } else {
            setFocusNode(null);
            setSelectedNode(null);
        }
        setShowComparison(false);
    };

    const filteredNodes = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        const lowerTerm = searchTerm.toLowerCase();
        return nodes
            .filter(n => {
                // Exclude streets from search results
                if (n.type === 'street') return false;
                
                const label = String(n.label || n.id).toLowerCase();
                return label.includes(lowerTerm) || (n.type || '').toLowerCase().includes(lowerTerm);
            })
            .slice(0, UI_CONSTANTS.searchResultsLimit);
    }, [searchTerm, nodes]);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowSearchResults(term.trim().length > 0);
    };

    const handleSearchSelect = (node) => {
        setFocusNode(String(node.id));
        setSelectedNode(node);
        setSearchTerm("");
        setShowSearchResults(false);
        setShowComparison(false);
    };

    const handleSearchClear = () => {
        setSearchTerm("");
        setShowSearchResults(false);
    };
    
    const handleSearchFocus = () => {
        if (searchTerm.trim()) setShowSearchResults(true);
    };

    const closeModal = () => {
        setFocusNode(null);
        setSelectedNode(null);
        setShowComparison(false);
        setIsModalFullscreen(false);
    };

    const handleSearchClickOutside = () => setShowSearchResults(false);
    const handleComparisonClickOutside = () => setShowComparisonDropdown(false);
    
    useClickOutside([searchContainerRef], handleSearchClickOutside);
    useClickOutside([comparisonDropdownRef], handleComparisonClickOutside);

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
                                aria-label="Navigate to node"
                            >
                                <option value="">Navigate to node...</option>
                                <optgroup label="Feeders">
                                    {feederNodes.map((t) => {
                                        const feederLabel = t.name || t.label || t.feeder_number || t.id;
                                        return (
                                            <option key={t.id} value={t.id}>
                                                {`Feeder - ${feederLabel}`}
                                            </option>
                                        );
                                    })}
                                </optgroup>
                                <optgroup label="Transformers">
                                    {transformerNodes.map((t) => {
                                        const transformerNumber = t.transformer_number || t.transformer || t.id;
                                        return (
                                            <option key={t.id} value={t.id}>
                                                Transformer {transformerNumber}
                                            </option>
                                        );
                                    })}                                </optgroup>
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
                                onFocus={handleSearchFocus}
                                className="modern-input"
                                aria-label="Search nodes"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={handleSearchClear}
                                    className="search-clear-btn"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            
                            {showSearchResults && (
                                <SearchDropdown 
                                    nodes={filteredNodes}
                                    onSelect={handleSearchSelect}
                                />
                            )}
                        </div>

                        {/* Auto-zoom Toggle - Hidden on mobile */}
                        {!isMobile && (
                            <label className="zoom-toggle-container">
                                <input
                                    type="checkbox"
                                    checked={autoZoomEnabled}
                                    onChange={(e) => setAutoZoomEnabled(e.target.checked)}
                                    className="zoom-toggle-input"
                                />
                                <span className="zoom-toggle-slider"></span>
                                <span className="zoom-toggle-label">Auto-zoom</span>
                            </label>
                        )}
                    </div>
                    
                    {/* Right side - Comparison Controls */}
                    <div className="control-panel-right">
                        {comparisonList.length > 0 && (
                            <>
                                <div ref={comparisonDropdownRef} className="comparison-dropdown-container">
                                    <button
                                        onClick={() => setShowComparisonDropdown(prev => !prev)}
                                        className="comparison-badge comparison-badge-clickable"
                                        title="View comparison list"
                                    >
                                        <Layers size={16} />
                                        <span>{formatCount(comparisonList.length, 'house')}</span>
                                        <ChevronDown size={16} className={`comparison-chevron ${showComparisonDropdown ? 'open' : ''}`} />
                                    </button>
                                    
                                    {showComparisonDropdown && (
                                        <ComparisonDropdown
                                            onClearAll={() => {
                                                clearComparison();
                                                setShowComparisonDropdown(false);
                                            }}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                        <button
                            onClick={toggleComparisonModal}
                            disabled={comparisonList.length === 0}
                            className={`modern-btn modern-btn-primary ${
                                comparisonList.length === 0 ? 'disabled' : ''
                            } ${showComparison ? 'active' : ''}`}
                            title={`Compare ${formatCount(comparisonList.length, 'house')}`}
                        >
                            <GitCompare size={16} />
                            <span>Compare</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Network Metrics - Hidden when modal is fullscreen or when any modal is open on mobile */}
            {!isModalFullscreen && !(isMobile && (selectedNode || showComparison)) && (
                <div className="network-metrics">
                    <MetricCard 
                        icon={Home}
                        value={houseCount}
                        label="Houses"
                        iconClass="metric-icon-houses"
                    />
                    <MetricCard 
                        icon={ZapIcon}
                        value={transformerCount}
                        label="Transformers"
                        iconClass="metric-icon-transformers"
                    />
                    <MetricCard 
                        icon={Network}
                        value={connectionCount}
                        label="Connections"
                        iconClass="metric-icon-connections"
                    />
                </div>
            )}

            {/* Graph Container */}
            <div style={{
                position: 'fixed',
                top: `${graphTopOffset}px`,
                left: 0,
                right: selectedNode && !isModalFullscreen && !isMobile ? '500px' : 0,
                bottom: 0,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
                transition: 'right 0.3s ease'
            }}>
                <TransformerGraph
                    data={data}
                    focusNode={focusNode}
                    onNodeClick={handleNodeClick}
                    isMobile={isMobile}
                    autoZoomEnabled={autoZoomEnabled}
                />
                <InfoModal 
                    node={selectedNode} 
                    onClose={closeModal}
                    isComparison={showComparison}
                    onFullscreenChange={setIsModalFullscreen}
                />
            </div>
        </div>
    );
}

export default function TransformerGraphWrapper() {
    return (
        <ComparisonProvider>
            <TransformerGraphWrapperContent />
        </ComparisonProvider>
    );
}
