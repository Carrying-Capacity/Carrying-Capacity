// src/TransformerGraph.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { iconCache, phaseColors, getNodeSize } from "./utils/iconCache.js";
import { useWindowDimensions } from "./hooks/useWindowDimensions.js";
import { collectDownstreamNodes, tracePathToFeeder } from "./utils/graphUtils.js";
import { ANIMATION_CONFIG } from './constants/index.js';

export default function TransformerGraph({ data, focusNode, onNodeClick, onAddToComparison, comparisonList }) {
    const fgRef = useRef();
    const [hoverNode, setHoverNode] = useState(null);
    const [showCompareButton, setShowCompareButton] = useState(null);

    const [flowLinks, setFlowLinks] = useState([]); // links along the path to grid
    const [tick, setTick] = useState(0); // for animated dashed lines
    
    const dimensions = useWindowDimensions();

    // Icons and node sizes are now imported from utils

    const renderNode = useCallback((node, ctx) => {
        const size = getNodeSize(node.type);
        const icon = iconCache[node.type];

        // Draw a semi-transparent phase color behind the icon for houses only
        if (node.type === "house") {
            ctx.beginPath();
            ctx.arc(node.x, node.y + 0.5, size / 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = phaseColors[node.predicted_phase] || phaseColors.default;
            ctx.globalAlpha = 0.4; // semi-transparent
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Add border for houses in comparison list
            const isInComparison = comparisonList && comparisonList.some(h => h.id === node.id);
            if (isInComparison) {
                ctx.strokeStyle = "#3b82f6"; // blue border
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        // Draw the icon on top (all types)
        if (icon && icon.complete) {
            ctx.drawImage(icon, node.x - size / 2, node.y - size / 2, size, size);
        }
    }, []);

    const renderLabel = useCallback((node, ctx) => {
        if (hoverNode && hoverNode.id === node.id) {
            const label = node.label || node.id;
            
            // Set up text style
            ctx.font = "bold 12px Arial";
            const labelWidth = ctx.measureText(label).width;
            
            // Calculate positions
            const padding = 6;
            const boxX = node.x + 15;
            const boxY = node.y - 12;
            const boxWidth = labelWidth + padding * 2;
            let boxHeight = 24;
            
            // Add space for comparison hint if applicable
            let actionText = "";
            if (node.type === "house" && onAddToComparison) {
                const isInComparison = comparisonList && comparisonList.some(h => h.id === node.id);
                actionText = isInComparison ? "Right-click to remove" : "Right-click to compare";
                ctx.font = "10px Arial";
                const actionWidth = ctx.measureText(actionText).width;
                const maxWidth = Math.max(labelWidth, actionWidth);
                boxHeight = 36;
                
                // Draw background with shadow
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(boxX + 2, boxY + 2, maxWidth + padding * 2, boxHeight);
                
                // Draw main background
                ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                ctx.fillRect(boxX, boxY, maxWidth + padding * 2, boxHeight);
                
                // Draw border
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 1;
                ctx.strokeRect(boxX, boxY, maxWidth + padding * 2, boxHeight);
            } else {
                // Draw background with shadow for non-house nodes
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(boxX + 2, boxY + 2, boxWidth, boxHeight);
                
                // Draw main background
                ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
                
                // Draw border
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 1;
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
            }
            
            // Draw main text
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "left";
            ctx.fillText(label, boxX + padding, boxY + 16);
            
            // Draw action text for houses
            if (actionText) {
                ctx.font = "10px Arial";
                const isInComparison = comparisonList && comparisonList.some(h => h.id === node.id);
                ctx.fillStyle = isInComparison ? "#3b82f6" : "#666";
                ctx.fillText(actionText, boxX + padding, boxY + 30);
            }
        }
    }, [hoverNode, comparisonList, onAddToComparison]);

    // Only run animation when there are flow links to animate
    useEffect(() => {
        if (flowLinks.length === 0) {
            setTick(0);
            return;
        }
        
        const interval = setInterval(() => setTick((t) => t + 1), ANIMATION_CONFIG.animationInterval);
        return () => clearInterval(interval);
    }, [flowLinks.length > 0]);


    useEffect(() => {
        if (!fgRef.current || !focusNode) {
            // Stop flow animation when focusNode is cleared
            setFlowLinks([]);
            return;
        }

        const node = data.nodes.find((n) => n.id === focusNode);
        if (!node) return;

        if (node.type === "feeder" || node.type === "transformer") {
            setFlowLinks([]);
            
            if (node.type === "feeder") {
                // Zoom to show entire network for feeder
                fgRef.current.zoomToFit(1000, 150);
            } else {
                // For transformer, find all downstream nodes (recursively)
                const allDownstreamNodes = collectDownstreamNodes(data, node);

                fgRef.current.zoomToFit(
                    1000,
                    150,
                    (n) => allDownstreamNodes.some((dn) => dn.id === n.id)
                );
            }
        } else if (node.type === "house" || node.type === "street") {
            // Trace path back to feeder
            const { pathNodes, pathLinks } = tracePathToFeeder(data, node);
            setFlowLinks(pathLinks);

            // Zoom to fit all nodes along the path
            fgRef.current.zoomToFit(
                1000,
                150,
                (n) => pathNodes.some((p) => p.id === n.id)
            );
        } else {
            setFlowLinks([]);
            fgRef.current.zoomToFit(1000, 100);
        }
    }, [focusNode, data]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
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
                onNodeHover={setHoverNode}
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
                    if (flowLinks.includes(link)) {
                        ctx.strokeStyle = "orange";
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.lineDashOffset = -tick;
                    } else {
                        ctx.strokeStyle = "#999";
                        ctx.lineWidth = 1;
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
                    
                    ctx.fillStyle = flowLinks.includes(link) ? "orange" : "#999";
                    ctx.fill();
                    
                    ctx.restore();
                }}
                onNodeClick={(node) => {
                    onNodeClick(node);
                }}
                onNodeRightClick={(node) => {
                    if (node.type === "house" && onAddToComparison) {
                        onAddToComparison(node);
                    }
                }}
            />
        </div>
    );
}