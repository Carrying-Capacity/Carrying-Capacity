import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { iconCache, getNodeSize } from "../utils/iconCache.js";
import { PHASE_COLORS_SOFT } from "../constants/index.js";
import { useContainerSize } from "../hooks/useContainerSize.js";
import { useComparison } from "../context/ComparisonContext.jsx";
import { collectDownstreamNodes, tracePathToFeeder } from "../utils/graphUtils.js";
import { ANIMATION_CONFIG } from '../constants/index.js';

// Style constants extracted from render path
const LINK_STYLES = {
    flow: { strokeStyle: "#f97316", lineWidth: 1.5, fillStyle: "#f97316" },
    feederToTransformer: { strokeStyle: "#cbd5e1", lineWidth: 1.5, fillStyle: "#94a3b8" },
    normal: { strokeStyle: "#cbd5e1", lineWidth: 1.5, fillStyle: "#94a3b8" }
};

const TransformerGraph = memo(({ data, focusNode, onNodeClick, isMobile = false, autoZoomEnabled = true }) => {
    const fgRef = useRef();
    const [hoverNode, setHoverNode] = useState(null);
    const [flowLinks, setFlowLinks] = useState([]);
    const [tick, setTick] = useState(0);
    const [lastFocusNode, setLastFocusNode] = useState(null);
    const [pulsingNodeIds, setPulsingNodeIds] = useState(new Set());
    const [downstreamLinks, setDownstreamLinks] = useState(new Set());
    const [selectedTransformerId, setSelectedTransformerId] = useState(null);
    const [pulseTick, setPulseTick] = useState(0);
    const iconLoadHandlersRef = useRef(new Map());
    const flowAnimationFrameRef = useRef(null);
    const flowAnimationLastTimeRef = useRef(null);
    const flowAnimationAccumulatorRef = useRef(0);
    const pulseAnimationFrameRef = useRef(null);
    const pulseAnimationLastTimeRef = useRef(null);
    const pulseAnimationAccumulatorRef = useRef(0);
    
    const [containerRef, dimensions] = useContainerSize();
    const { comparisonIdSet, toggleHouseInComparison } = useComparison();

    // Helper to attach onload handler for incomplete icons
    const ensureIconLoaded = useCallback((icon) => {
        if (!icon || icon.complete) return;
        
        // Check if we already have a handler for this icon
        if (iconLoadHandlersRef.current.has(icon)) return;
        
        const handler = () => {
            // Trigger a refresh when the icon loads
            fgRef.current?.refresh?.();
            // Clean up the handler
            iconLoadHandlersRef.current.delete(icon);
        };
        
        icon.addEventListener('load', handler, { once: true });
        iconLoadHandlersRef.current.set(icon, handler);
    }, []);

    const renderNode = useCallback((node, ctx) => {
        const size = getNodeSize(node.type);
        
        // Select icon based on node type and solar status
        let icon = iconCache[node.type];
        if (node.type === "house" && node.solar) {
            icon = iconCache.houseSolar;
        }

        // Ensure icon will trigger refresh when loaded
        ensureIconLoaded(icon);

        if (node.type === "house") {
            ctx.save();
            
            // Check if 3-phase customer (array with multiple phases)
            const isThreePhase = Array.isArray(node.predicted_phase) && node.predicted_phase.length > 1;
            
            let bgColor;
            if (isThreePhase) {
                bgColor = PHASE_COLORS_SOFT.THREE_PHASE;
            } else {
                // Get phase color (handle both array and string formats)
                const phase = Array.isArray(node.predicted_phase) ? node.predicted_phase[0] : node.predicted_phase;
                bgColor = PHASE_COLORS_SOFT[phase] || PHASE_COLORS_SOFT.default;
            }
            
            // Draw pulsing ring for houses connected to selected transformer
            if (pulsingNodeIds.has(node.id)) {
                const pulseProgress = (pulseTick % 60) / 60; // 0 to 1 over 60 frames
                const pulseScale = 1 + Math.sin(pulseProgress * Math.PI * 2) * 0.3; // Oscillate between 1 and 1.3
                const pulseAlpha = 0.6 - (Math.sin(pulseProgress * Math.PI * 2) * 0.3); // Oscillate opacity
                
                ctx.strokeStyle = "#f97316"; // Orange color
                ctx.lineWidth = 3;
                ctx.globalAlpha = pulseAlpha;
                const pulseSize = size * 1.2 * pulseScale;
                ctx.beginPath();
                ctx.roundRect(
                    node.x - pulseSize / 2,
                    node.y - pulseSize / 2,
                    pulseSize,
                    pulseSize,
                    4
                );
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
            
            // Draw rounded square background (full opacity)
            const squareSize = size * 1.2;
            const cornerRadius = 4;
            ctx.fillStyle = bgColor;
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.roundRect(
                node.x - squareSize / 2, 
                node.y - squareSize / 2, 
                squareSize, 
                squareSize, 
                cornerRadius
            );
            ctx.fill();
            
            // Add border for houses in comparison list
            if (comparisonIdSet.has(node.id)) {
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            ctx.restore();
            
            // Draw the icon, slightly smaller
            if (icon && icon.complete) {
                ctx.save();
                const iconSize = size * 0.7; // Make icon smaller
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1.0;
                ctx.drawImage(icon, node.x - iconSize / 2, node.y - iconSize / 2, iconSize, iconSize);
                ctx.restore();
            }
        } else {
            // Draw non-house nodes (network, street, transformer, feeder)
            // Draw pulsing glow for selected transformer
            if (node.type === "transformer" && selectedTransformerId === node.id) {
                ctx.save();
                const pulseProgress = (pulseTick % 60) / 60; // 0 to 1 over 60 frames
                const pulseScale = 1 + Math.sin(pulseProgress * Math.PI * 2) * 0.3; // Oscillate between 1 and 1.3
                const pulseAlpha = 0.6 - (Math.sin(pulseProgress * Math.PI * 2) * 0.3); // Oscillate opacity
                
                ctx.strokeStyle = "#f97316"; // Orange color
                ctx.lineWidth = 3;
                ctx.globalAlpha = pulseAlpha;
                const pulseSize = size * 1.4 * pulseScale;
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize / 2, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }
            
            if (icon && icon.complete) {
                ctx.drawImage(icon, node.x - size / 2, node.y - size / 2, size, size);
            }
        }
    }, [comparisonIdSet, ensureIconLoaded, pulsingNodeIds, selectedTransformerId, pulseTick]);

    const renderLabel = useCallback((node, ctx) => {
        if (hoverNode && hoverNode.id === node.id) {
            const label = node.label || node.id;
            const padding = 12;
            const boxX = node.x + 15;
            const boxY = node.y - 12;
            
            ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            const labelWidth = ctx.measureText(label).width;
            let boxHeight = 32;
            
            let actionText = "";
            let maxWidth = labelWidth;
            
            if (node.type === "house") {
                const isInComparison = comparisonIdSet.has(node.id);
                actionText = isInComparison ? "Right-click to remove" : "Right-click to compare";
                ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
                const actionWidth = ctx.measureText(actionText).width;
                maxWidth = Math.max(labelWidth, actionWidth);
                boxHeight = 48;
            }
            
            const boxWidth = maxWidth + padding * 2;
            const borderRadius = 12;
            
            // Draw outer glow
            ctx.shadowColor = "rgba(59, 130, 246, 0.3)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            
            // Draw glassmorphism background with gradient
            const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            gradient.addColorStop(1, "rgba(248, 250, 252, 0.95)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
            ctx.fill();
            
            // Reset shadow for border
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Draw border with subtle gradient
            const borderGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
            borderGradient.addColorStop(0, "rgba(226, 232, 240, 0.8)");
            borderGradient.addColorStop(1, "rgba(203, 213, 225, 0.8)");
            
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
            ctx.stroke();
            
            // Draw main text with better typography
            ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(label, boxX + padding, boxY + (actionText ? 16 : boxHeight / 2));
            
            // Draw action text for houses with modern styling
            if (actionText) {
                ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
                ctx.fillStyle = comparisonIdSet.has(node.id) ? "#3b82f6" : "#64748b";
                ctx.fillText(actionText, boxX + padding, boxY + 34);
            }
        }
    }, [hoverNode, comparisonIdSet]);

    // Cleanup icon load handlers on unmount
    useEffect(() => {
        return () => {
            // Remove all pending icon load handlers
            iconLoadHandlersRef.current.forEach((handler, icon) => {
                icon.removeEventListener('load', handler);
            });
            iconLoadHandlersRef.current.clear();
        };
    }, []);

    // Only run animation when there are flow links to animate
    const hasFlowLinks = flowLinks.length > 0;
    const flowLinkSet = useMemo(() => new Set(flowLinks), [flowLinks]);
    
    // Memoize linkCanvasObject to avoid per-frame allocations
    const linkCanvasObject = useCallback((link, ctx) => {
        const isFlowLink = flowLinkSet.has(link);
        const isDownstreamLink = downstreamLinks.has(link);
        
        // Check if this is a feeder-to-transformer link
        const sourceNode = link.source;
        const targetNode = link.target;
        const isFeederToTransformer = 
            (sourceNode.type === "feeder" && targetNode.type === "transformer") ||
            (sourceNode.type === "transformer" && targetNode.type === "feeder");
        
        // Determine style: flow links get animated orange, feeder-to-transformer get thick dark, downstream links get static orange, others normal
        let style;
        if (isFlowLink) {
            style = LINK_STYLES.flow;
        } else if (isFeederToTransformer) {
            style = LINK_STYLES.feederToTransformer;
        } else if (isDownstreamLink) {
            style = { strokeStyle: "#f97316", lineWidth: 2, fillStyle: "#f97316" };
        } else {
            style = LINK_STYLES.normal;
        }
        
        // Set link style
        ctx.strokeStyle = style.strokeStyle;
        ctx.lineWidth = style.lineWidth;
        if (isFlowLink) {
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -tick;
        } else {
            ctx.setLineDash([]);
        }

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    }, [tick, flowLinkSet, downstreamLinks]);
    
    useEffect(() => {
        if (!hasFlowLinks) {
            if (flowAnimationFrameRef.current !== null) {
                cancelAnimationFrame(flowAnimationFrameRef.current);
                flowAnimationFrameRef.current = null;
            }
            flowAnimationLastTimeRef.current = null;
            flowAnimationAccumulatorRef.current = 0;
            setTick(0);
            return;
        }

        const frameDuration = ANIMATION_CONFIG.animationInterval;

        const animate = (timestamp) => {
            if (flowAnimationLastTimeRef.current === null) {
                flowAnimationLastTimeRef.current = timestamp;
            }

            const delta = timestamp - flowAnimationLastTimeRef.current;
            flowAnimationLastTimeRef.current = timestamp;
            flowAnimationAccumulatorRef.current += delta;

            while (flowAnimationAccumulatorRef.current >= frameDuration) {
                setTick((t) => t + 1);
                flowAnimationAccumulatorRef.current -= frameDuration;
            }

            flowAnimationFrameRef.current = requestAnimationFrame(animate);
        };

        flowAnimationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (flowAnimationFrameRef.current !== null) {
                cancelAnimationFrame(flowAnimationFrameRef.current);
                flowAnimationFrameRef.current = null;
            }
            flowAnimationLastTimeRef.current = null;
            flowAnimationAccumulatorRef.current = 0;
        };
    }, [hasFlowLinks]);

    // Pulse animation for nodes connected to selected transformer
    useEffect(() => {
        if (pulsingNodeIds.size === 0) {
            if (pulseAnimationFrameRef.current !== null) {
                cancelAnimationFrame(pulseAnimationFrameRef.current);
                pulseAnimationFrameRef.current = null;
            }
            pulseAnimationLastTimeRef.current = null;
            pulseAnimationAccumulatorRef.current = 0;
            setPulseTick(0);
            return;
        }

        const frameDuration = 1000 / 60;

        const animate = (timestamp) => {
            if (pulseAnimationLastTimeRef.current === null) {
                pulseAnimationLastTimeRef.current = timestamp;
            }

            const delta = timestamp - pulseAnimationLastTimeRef.current;
            pulseAnimationLastTimeRef.current = timestamp;
            pulseAnimationAccumulatorRef.current += delta;

            while (pulseAnimationAccumulatorRef.current >= frameDuration) {
                setPulseTick((t) => t + 1);
                pulseAnimationAccumulatorRef.current -= frameDuration;
            }

            pulseAnimationFrameRef.current = requestAnimationFrame(animate);
        };

        pulseAnimationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (pulseAnimationFrameRef.current !== null) {
                cancelAnimationFrame(pulseAnimationFrameRef.current);
                pulseAnimationFrameRef.current = null;
            }
            pulseAnimationLastTimeRef.current = null;
            pulseAnimationAccumulatorRef.current = 0;
        };
    }, [pulsingNodeIds.size]);

    // Force re-render when hover changes to show/hide labels
    useEffect(() => {
        if (fgRef.current) {
            // Request animation frame to ensure label renders immediately
            requestAnimationFrame(() => {
                if (fgRef.current) {
                    // Nudge the graph to trigger onRenderFramePost
                    const currentZoom = fgRef.current.zoom();
                    fgRef.current.zoom(currentZoom);
                }
            });
        }
    }, [hoverNode]);

    useEffect(() => {
        if (!hoverNode && fgRef.current?.canvas) {
            fgRef.current.canvas.style.cursor = "default";
        }
    }, [hoverNode]);

    // Initial zoom-to-fit when graph first loads
    useEffect(() => {
        if (!fgRef.current || !data.nodes.length || isMobile) return;
        
        const timeoutId = setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.zoomToFit(1000, 50);
            }
        }, 200);
        
        return () => clearTimeout(timeoutId);
    }, [data.nodes.length, isMobile]);

    // Focus effect - runs when focusNode changes or dimensions change significantly
    useEffect(() => {
        if (isMobile) {
            // Do not perform auto zoom on mobile
            setFlowLinks([]);
            setLastFocusNode(null);
            return;
        }
        if (!fgRef.current || !focusNode) {
            // Stop flow animation when focusNode is cleared
            setFlowLinks([]);
            setPulsingNodeIds(new Set());
            setDownstreamLinks(new Set());
            setSelectedTransformerId(null);
            setLastFocusNode(null);
            return;
        }

        const node = data.nodes.find((n) => n.id === focusNode);
        if (!node) return;

        setLastFocusNode(focusNode);

        // Add a delay to ensure the graph is fully rendered (especially after fullscreen toggle)
        const timeoutId = setTimeout(() => {
            if (!fgRef.current) return;

            if (node.type === "feeder" || node.type === "transformer") {
                setFlowLinks([]);
                
                if (node.type === "feeder") {
                    // Zoom to show entire network for feeder (only if auto-zoom enabled)
                    if (autoZoomEnabled) {
                        fgRef.current.zoomToFit(1000, 50);
                    }
                    setPulsingNodeIds(new Set());
                    setDownstreamLinks(new Set());
                    setSelectedTransformerId(null);
                } else {
                    // For transformer, find all downstream nodes (recursively)
                    const allDownstreamNodes = collectDownstreamNodes(data, node);
                    const downstreamIds = new Set(allDownstreamNodes.map(dn => dn.id));
                    
                    // Set pulsing for houses connected to this transformer only
                    const pulsingIds = new Set(
                        allDownstreamNodes
                            .filter(n => n.type === 'house')
                            .map(n => n.id)
                    );
                    setPulsingNodeIds(pulsingIds);
                    setSelectedTransformerId(node.id);
                    
                    // Collect all links between downstream nodes for orange coloring
                    // Use adjacency map for O(1) lookups instead of scanning all links
                    const downstreamLinkSet = new Set();
                    if (data.adjacency?.linkById) {
                        downstreamIds.forEach(nodeId => {
                            const children = data.adjacency.childrenByNodeId.get(nodeId);
                            if (children) {
                                children.forEach(childId => {
                                    if (downstreamIds.has(childId)) {
                                        const link = data.adjacency.linkById.get(`${nodeId}-${childId}`);
                                        if (link) {
                                            downstreamLinkSet.add(link);
                                        }
                                    }
                                });
                            }
                        });
                    }
                    setDownstreamLinks(downstreamLinkSet);

                    // Only zoom if auto-zoom is enabled
                    if (autoZoomEnabled) {
                        fgRef.current.zoomToFit(
                            1000,
                            50,
                            (n) => downstreamIds.has(n.id)
                        );
                    }
                }
            } else if (node.type === "house" || node.type === "street") {
                // Trace path back to feeder
                const { pathNodes, pathLinks } = tracePathToFeeder(data, node);
                setFlowLinks(pathLinks);
                setPulsingNodeIds(new Set());
                setDownstreamLinks(new Set());
                setSelectedTransformerId(null);

                // Only zoom if auto-zoom is enabled
                if (autoZoomEnabled) {
                    const pathNodeIds = new Set(pathNodes.map(p => p.id));
                    fgRef.current.zoomToFit(
                        1000,
                        50,
                        (n) => pathNodeIds.has(n.id)
                    );
                }
            } else {
                setFlowLinks([]);
                setPulsingNodeIds(new Set());
                setDownstreamLinks(new Set());
                setSelectedTransformerId(null);
                if (autoZoomEnabled) {
                    fgRef.current.zoomToFit(1000, 30);
                }
            }
        }, 150); // Increased delay for fullscreen transitions

        return () => clearTimeout(timeoutId);
    }, [focusNode, data, isMobile, autoZoomEnabled]);

    // Re-trigger focus when dimensions change significantly (e.g., fullscreen toggle)
    useEffect(() => {
        if (isMobile || !autoZoomEnabled) return; // Disable re-focus auto zoom on mobile or when disabled
        if (!lastFocusNode || !fgRef.current) return;

        const node = data.nodes.find((n) => n.id === lastFocusNode);
        if (!node) return;

        // Delay to let the graph resize
        const timeoutId = setTimeout(() => {
            if (!fgRef.current) return;

            if (node.type === "feeder" || node.type === "transformer") {
                if (node.type === "feeder") {
                    fgRef.current.zoomToFit(1000, 50);
                } else {
                    const allDownstreamNodes = collectDownstreamNodes(data, node);
                    const downstreamIds = new Set(allDownstreamNodes.map(dn => dn.id));
                    fgRef.current.zoomToFit(
                        1000,
                        50,
                        (n) => downstreamIds.has(n.id)
                    );
                }
            } else if (node.type === "house" || node.type === "street") {
                const { pathNodes } = tracePathToFeeder(data, node);
                const pathNodeIds = new Set(pathNodes.map(p => p.id));
                fgRef.current.zoomToFit(
                    1000,
                    50,
                    (n) => pathNodeIds.has(n.id)
                );
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [dimensions.width, dimensions.height, lastFocusNode, data, isMobile, autoZoomEnabled]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {/* Accessibility: Screen reader node list */}
            <div className="sr-only" role="region" aria-label="Network graph nodes">
                <h3>Network Nodes</h3>
                <ul>
                    {data.nodes.filter(n => n.type !== 'street' && n.type !== 'feeder').slice(0, 20).map(node => (
                        <li key={node.id}>
                            {node.type}: {node.label || node.id}
                            {node.type === 'house' && (
                                <button 
                                    onClick={() => onNodeClick(node)}
                                    aria-label={`Select ${node.label || node.id}`}
                                >
                                    Select
                                </button>
                            )}
                        </li>
                    ))}
                    {data.nodes.filter(n => n.type !== 'street' && n.type !== 'feeder').length > 20 && (
                        <li>...and {data.nodes.filter(n => n.type !== 'street' && n.type !== 'feeder').length - 20} more nodes</li>
                    )}
                </ul>
            </div>
            <ForceGraph2D
                ref={fgRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                enableNodeDrag={false}
                d3VelocityDecay={1}
                cooldownTicks={0}
                warmupTicks={0}
                nodeRelSize={6}
                nodeLabel={() => ""}
                nodePointerAreaPaint={(node, color, ctx) => {
                    // Disable pointer area for street and feeder nodes - return immediately without drawing
                    if (node.type === "street" || node.type === "feeder" || node.type === "network") {
                        return;
                    }
                    // Default pointer area for other nodes
                    ctx.fillStyle = color;
                    const size = getNodeSize(node.type);
                    ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
                }}
                onNodeHover={(node) => {
                    const canvas = fgRef.current?.canvas;
                    if (node && (node.type === "street" || node.type === "feeder" || node.type === "network")) {
                        if (canvas) {
                            canvas.style.cursor = 'default';
                        }
                        setHoverNode(null);
                        return;
                    }

                    if (!node) {
                        if (canvas) {
                            canvas.style.cursor = 'default';
                        }
                        setHoverNode(null);
                        return;
                    }

                    if (canvas) {
                        if (node.type === 'house' || node.type === 'transformer') {
                            canvas.style.cursor = 'pointer';
                        } else {
                            canvas.style.cursor = 'default';
                        }
                    }

                    setHoverNode(node);
                }}
                nodeCanvasObject={renderNode}
                onRenderFramePost={(ctx) => {
                    // Render all hover labels after all nodes are rendered to ensure they appear on top
                    if (hoverNode) {
                        const node = data.nodes.find(n => n.id === hoverNode.id);
                        // Skip label rendering for street and feeder nodes
                        if (node && node.type !== 'street' && node.type !== 'feeder') {
                            renderLabel(node, ctx);
                        }
                    }
                }}
                linkCanvasObject={linkCanvasObject}
                onNodeClick={(node) => {
                    // Early return for street and feeder nodes to prevent any interaction
                    if (!node || node.type === "street" || node.type === "feeder" || node.type === "network") {
                        return;
                    }
                    onNodeClick(node);
                }}
                onNodeRightClick={useCallback((node, event) => {
                    event?.preventDefault();
                    // Defensive check: only handle house nodes
                    if (!node || node.type !== "house") {
                        return;
                    }
                    toggleHouseInComparison(node);
                }, [toggleHouseInComparison])}
            />
        </div>
    );
});

TransformerGraph.displayName = "TransformerGraph";

export default TransformerGraph;