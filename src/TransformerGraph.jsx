// src/TransformerGraph.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { iconCache, phaseColors, getNodeSize } from "./utils/iconCache.js";
import { useWindowDimensions } from "./hooks/useWindowDimensions.js";

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
        
        const interval = setInterval(() => setTick((t) => t + 1), 50);
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
                // Extend traversal to include street graphs anchored via net_node_id
                const getNodeById = (id) => data.nodes.find((n) => n.id === id);

                const getDownstreamNodes = (startNode, visited = new Set()) => {
                    const downstream = [startNode];
                    visited.add(startNode.id);

                    const enqueue = (id) => {
                        if (!id || visited.has(id)) return;
                        const child = getNodeById(id);
                        if (child) {
                            downstream.push(...getDownstreamNodes(child, visited));
                        }
                    };

                    // 1) explicit next_nodes
                    if (Array.isArray(startNode.next_nodes)) {
                        startNode.next_nodes.forEach(enqueue);
                    }

                    // 2) nodes whose prev includes startNode
                    data.nodes.forEach((n) => {
                        const prevs = Array.isArray(n.prev_nodes)
                            ? n.prev_nodes
                            : (n.prev_node ? [n.prev_node] : []);
                        if (prevs && prevs.includes(startNode.id)) {
                            enqueue(n.id);
                        }
                    });

                    // 3) streets anchored to this net node (transformer or house)
                    if (startNode.type !== "street") {
                        data.nodes.forEach((n) => {
                            if (n.type === "street" && n.net_node_id === startNode.id) {
                                enqueue(n.id);
                            }
                        });
                    }

                    // 4) if this is a street, walk connected streets and bridge to its net node (house/transformer)
                    if (startNode.type === "street") {
                        const connected = Array.isArray(startNode.connected_nodes) ? startNode.connected_nodes : [];
                        connected.forEach(enqueue);
                        if (startNode.net_node_id) {
                            enqueue(startNode.net_node_id);
                        }
                    }

                    return downstream;
                };

                const allDownstreamNodes = getDownstreamNodes(node);
                console.log(`Transformer ${node.id}: found ${allDownstreamNodes.length} downstream nodes`);

                fgRef.current.zoomToFit(
                    1000,
                    150,
                    (n) => allDownstreamNodes.some((dn) => dn.id === n.id)
                );
            }
        } else if (node.type === "house" || node.type === "street") {
            // Traverse prev_node chain back to feeder
            const pathNodes = [node]; // include the clicked house/street
            const pathLinks = [];
            let currentNode = node;
            const maxDepth = 100; // Prevent infinite loops
            let depth = 0;
            const visitedNodes = new Set([node.id]); // Track visited nodes to prevent cycles

            // Continue traversal until we reach the feeder or hit a stopping condition
            while (depth < maxDepth) {
                // Determine previous node(s) robustly
                let prevIds = [];
                if (Array.isArray(currentNode.prev_nodes) && currentNode.prev_nodes.length > 0) {
                    prevIds = currentNode.prev_nodes;
                } else if (currentNode.prev_node) {
                    // Normalized field added during loading
                    prevIds = [currentNode.prev_node];
                }

                // If this is a street node with an associated network node (house), bridge to it
                if (prevIds.length === 0 && currentNode.type === "street" && currentNode.net_node_id) {
                    prevIds = [currentNode.net_node_id];
                }

                // Choose first upstream (data is single-parent)
                const prevId = prevIds[0] || null;

                // Stop if no previous node (we've reached the root)
                if (!prevId) {
                    console.log(`Reached root node: ${currentNode.type} (${currentNode.id})`);
                    break;
                }

                // Find the previous node
                const prevNode = data.nodes.find((n) => n.id === prevId);
                if (!prevNode) {
                    console.warn(`Could not find prev node with ID: ${prevId} - trying to find alternative path`);
                    
                    // Try to find any node that connects to the current node via next_nodes
                    const alternativePrev = data.nodes.find((n) => 
                        n.next_nodes && n.next_nodes.includes(currentNode.id)
                    );
                    
                    if (alternativePrev) {
                        console.log(`Found alternative parent node: ${alternativePrev.type} ${alternativePrev.id}`);
                        // Use the alternative node
                        pathNodes.push(alternativePrev);
                        visitedNodes.add(alternativePrev.id);
                        
                        // Find the link
                        const link = data.links.find((l) => {
                            const sourceId = l.source.id || l.source;
                            const targetId = l.target.id || l.target;
                            return (sourceId === alternativePrev.id && targetId === currentNode.id) ||
                                   (targetId === alternativePrev.id && sourceId === currentNode.id);
                        });
                        
                        if (link) {
                            pathLinks.push(link);
                        }
                        
                        currentNode = alternativePrev;
                        depth++;
                        
                        // Continue if we haven't reached the feeder
                        if (currentNode.type === "feeder") {
                            console.log(`Path complete via alternative route: reached feeder (${pathNodes.length} nodes)`);
                            break;
                        }
                        continue; // Continue the while loop with the alternative node
                    } else {
                        console.warn(`No alternative path found - stopping traversal`);
                        break;
                    }
                }

                // Check for cycles
                if (visitedNodes.has(prevNode.id)) {
                    console.warn(`Cycle detected at node: ${prevNode.id}`);
                    break;
                }

                // Add the previous node to the path
                pathNodes.push(prevNode);
                visitedNodes.add(prevNode.id);

                // Find the link between current and previous node
                const link = data.links.find((l) => {
                    const sourceId = l.source.id || l.source;
                    const targetId = l.target.id || l.target;
                    return (sourceId === prevId && targetId === currentNode.id) ||
                           (targetId === prevId && sourceId === currentNode.id);
                });
                
                if (link) {
                    pathLinks.push(link);
                }

                // Move to the previous node
                currentNode = prevNode;
                depth++;
                
                // Stop if we've reached the feeder (root of the network)
                if (currentNode.type === "feeder") {
                    console.log(`Path complete: reached feeder (${pathNodes.length} nodes)`);
                    break;
                }
            }

            if (depth >= maxDepth) {
                console.warn(`Max traversal depth reached. Path may be incomplete.`);
            }

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