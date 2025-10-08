// src/TransformerGraph.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { iconCache, phaseColors, getNodeSize } from "./utils/iconCache.js";
import { useWindowDimensions } from "./hooks/useWindowDimensions.js";
import { collectDownstreamNodes, tracePathToFeeder } from "./utils/graphUtils.js";
import { ANIMATION_CONFIG } from './constants/index.js';

export default function TransformerGraph({ data, focusNode, onNodeClick }) {
    const fgRef = useRef();
    const [hoverNode, setHoverNode] = useState(null);

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
        }

        // Draw the icon on top (all types)
        if (icon && icon.complete) {
            ctx.drawImage(icon, node.x - size / 2, node.y - size / 2, size, size);
        }
    }, []);

    const renderLabel = useCallback((node, ctx) => {
        if (hoverNode && hoverNode.id === node.id) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(node.label || node.id, node.x + 10, node.y + 4);
        }
    }, [hoverNode]);

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
                console.log(`Transformer ${node.id}: found ${allDownstreamNodes.length} downstream nodes`);

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
                linkDirectionalArrowLength={10}
                linkDirectionalArrowRelPos={30}
                nodeLabel={() => ""}
                onNodeHover={setHoverNode}
                nodeCanvasObject={(node, ctx) => {
                    renderNode(node, ctx);
                    renderLabel(node, ctx);
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

                    ctx.beginPath();
                    ctx.moveTo(link.source.x, link.source.y);
                    ctx.lineTo(link.target.x, link.target.y);
                    ctx.stroke();
                }}
                onNodeClick={(node) => {
                    onNodeClick(node);
                }}
            />
        </div>
    );
}