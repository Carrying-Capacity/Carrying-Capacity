import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { iconCache, getNodeSize } from "../utils/iconCache.js";
import { PHASE_COLORS_SOFT } from "../constants/index.js";
import { useContainerSize } from "../hooks/useContainerSize.js";
import { useComparison } from "../context/ComparisonContext.jsx";
import { collectDownstreamNodes, tracePathToFeeder } from "../utils/graphUtils.js";
import { ANIMATION_CONFIG } from '../constants/index.js';

const TransformerGraph = memo(({ data, focusNode, onNodeClick, isMobile = false }) => {
    const fgRef = useRef();
    const [hoverNode, setHoverNode] = useState(null);
    const [flowLinks, setFlowLinks] = useState([]);
    const [tick, setTick] = useState(0);
    const [lastFocusNode, setLastFocusNode] = useState(null);
    
    const [containerRef, dimensions] = useContainerSize();
    const { comparisonIdSet, toggleHouseInComparison } = useComparison();

    const renderNode = useCallback((node, ctx) => {
        const size = getNodeSize(node.type);
        
        // Select icon based on node type and solar status
        let icon = iconCache[node.type];
        if (node.type === "house" && node.solar) {
            icon = iconCache.houseSolar;
        }

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
            // Draw non-house nodes normally
            if (icon && icon.complete) {
                ctx.drawImage(icon, node.x - size / 2, node.y - size / 2, size, size);
            }
        }
    }, [comparisonIdSet]);

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

    // Only run animation when there are flow links to animate
    const hasFlowLinks = flowLinks.length > 0;
    const flowLinkSet = useMemo(() => new Set(flowLinks), [flowLinks]);
    useEffect(() => {
        if (!hasFlowLinks) {
            setTick(0);
            return;
        }
        
        const interval = setInterval(() => setTick((t) => t + 1), ANIMATION_CONFIG.animationInterval);
        return () => clearInterval(interval);
    }, [hasFlowLinks]);


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
                    // Zoom to show entire network for feeder
                    fgRef.current.zoomToFit(1000, 150);
                } else {
                    // For transformer, find all downstream nodes (recursively)
                    const allDownstreamNodes = collectDownstreamNodes(data, node);
                    const downstreamIds = new Set(allDownstreamNodes.map(dn => dn.id));

                    fgRef.current.zoomToFit(
                        1000,
                        150,
                        (n) => downstreamIds.has(n.id)
                    );
                }
            } else if (node.type === "house" || node.type === "street") {
                // Trace path back to feeder
                const { pathNodes, pathLinks } = tracePathToFeeder(data, node);
                setFlowLinks(pathLinks);

                // Zoom to fit all nodes along the path
                const pathNodeIds = new Set(pathNodes.map(p => p.id));
                fgRef.current.zoomToFit(
                    1000,
                    150,
                    (n) => pathNodeIds.has(n.id)
                );
            } else {
                setFlowLinks([]);
                fgRef.current.zoomToFit(1000, 100);
            }
        }, 150); // Increased delay for fullscreen transitions

        return () => clearTimeout(timeoutId);
    }, [focusNode, data, isMobile]);

    // Re-trigger focus when dimensions change significantly (e.g., fullscreen toggle)
    useEffect(() => {
        if (isMobile) return; // Disable re-focus auto zoom on mobile
        if (!lastFocusNode || !fgRef.current) return;

        const node = data.nodes.find((n) => n.id === lastFocusNode);
        if (!node) return;

        // Delay to let the graph resize
        const timeoutId = setTimeout(() => {
            if (!fgRef.current) return;

            if (node.type === "feeder" || node.type === "transformer") {
                if (node.type === "feeder") {
                    fgRef.current.zoomToFit(1000, 150);
                } else {
                    const allDownstreamNodes = collectDownstreamNodes(data, node);
                    const downstreamIds = new Set(allDownstreamNodes.map(dn => dn.id));
                    fgRef.current.zoomToFit(
                        1000,
                        150,
                        (n) => downstreamIds.has(n.id)
                    );
                }
            } else if (node.type === "house" || node.type === "street") {
                const { pathNodes } = tracePathToFeeder(data, node);
                const pathNodeIds = new Set(pathNodes.map(p => p.id));
                fgRef.current.zoomToFit(
                    1000,
                    150,
                    (n) => pathNodeIds.has(n.id)
                );
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [dimensions.width, dimensions.height, lastFocusNode, data, isMobile]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {/* Accessibility: Screen reader node list */}
            <div className="sr-only" role="region" aria-label="Network graph nodes">
                <h3>Network Nodes</h3>
                <ul>
                    {data.nodes.filter(n => n.type !== 'street').slice(0, 20).map(node => (
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
                    {data.nodes.filter(n => n.type !== 'street').length > 20 && (
                        <li>...and {data.nodes.filter(n => n.type !== 'street').length - 20} more nodes</li>
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
                    // Disable pointer area for street nodes
                    if (node.type === "street") {
                        return;
                    }
                    // Default pointer area for other nodes
                    ctx.fillStyle = color;
                    const size = getNodeSize(node.type);
                    ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
                }}
                onNodeHover={(node) => {
                    // Don't show hover for street nodes
                    if (node && node.type === "street") {
                        setHoverNode(null);
                    } else {
                        setHoverNode(node);
                    }
                }}
                nodeCanvasObject={renderNode}
                onRenderFramePost={(ctx) => {
                    // Render all hover labels after all nodes are rendered to ensure they appear on top
                    if (hoverNode) {
                        const node = data.nodes.find(n => n.id === hoverNode.id);
                        if (node) {
                            renderLabel(node, ctx);
                        }
                    }
                }}
                linkCanvasObject={(link, ctx) => {
                    // Highlight path links
                    if (flowLinkSet.has(link)) {
                        ctx.strokeStyle = "#f97316";
                        ctx.lineWidth = 2.5;
                        ctx.setLineDash([5, 5]);
                        ctx.lineDashOffset = -tick;
                    } else {
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([]);
                    }

                    // Draw the line
                    ctx.beginPath();
                    ctx.moveTo(link.source.x, link.source.y);
                    ctx.lineTo(link.target.x, link.target.y);
                    ctx.stroke();

                    // Draw arrow at halfway point
                    const dx = link.target.x - link.source.x;
                    const dy = link.target.y - link.source.y;
                    const angle = Math.atan2(dy, dx);
                    
                    // Arrow position at 50% of the link
                    const arrowX = link.source.x + dx * 0.5;
                    const arrowY = link.source.y + dy * 0.5;
                    
                    // Arrow properties
                    const arrowLength = 10;
                    const arrowWidth = 6;
                    
                    ctx.save();
                    ctx.translate(arrowX, arrowY);
                    ctx.rotate(angle);
                    
                    // Draw arrow
                    ctx.beginPath();
                    ctx.moveTo(arrowLength / 2, 0);
                    ctx.lineTo(-arrowLength / 2, -arrowWidth / 2);
                    ctx.lineTo(-arrowLength / 2, arrowWidth / 2);
                    ctx.closePath();
                    
                    ctx.fillStyle = flowLinkSet.has(link) ? "#f97316" : "#94a3b8";
                    ctx.fill();
                    
                    ctx.restore();
                }}
                onNodeClick={(node) => {
                    // Don't allow clicking on street nodes
                    if (node.type !== "street") {
                        onNodeClick(node);
                    }
                }}
                onNodeRightClick={useCallback((node, event) => {
                    event?.preventDefault();
                    if (node.type === "house") {
                        toggleHouseInComparison(node);
                    }
                }, [toggleHouseInComparison])}
            />
        </div>
    );
});

TransformerGraph.displayName = "TransformerGraph";

export default TransformerGraph;