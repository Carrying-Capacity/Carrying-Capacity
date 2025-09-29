// src/TransformerGraph.jsx
import React, { useRef, useMemo, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

import houseIcon from "./assets/house.png";
import transformerIcon from "./assets/transformer.png";
import gridIcon from "./assets/grid.png";

export default function TransformerGraph({ data, focusNode, onNodeClick }) {
    const fgRef = useRef();
    const [hoverNode, setHoverNode] = useState(null);

    const [flowLinks, setFlowLinks] = useState([]); // links along the path to grid
    const [tick, setTick] = useState(0); // for animated dashed lines

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () =>
            setDimensions({ width: window.innerWidth, height: window.innerHeight });

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const icons = useMemo(() => {
        const imgHouse = new Image(); imgHouse.src = houseIcon;
        const imgTransformer = new Image(); imgTransformer.src = transformerIcon;
        const imgGrid = new Image(); imgGrid.src = gridIcon;

        return { house: imgHouse, transformer: imgTransformer, grid: imgGrid };
    }, []);

    const getNodeSize = (type) => {
        switch (type) {
            case "grid": return 100;
            case "transformer": return 60;
            case "house": default: return 14;
        }
    };

    const renderNode = (node, ctx) => {
        const size = getNodeSize(node.type);
        const icon = icons[node.type];

        // Draw a semi-transparent phase color behind the icon for houses only
        if (node.type === "house") {
            const phaseColors = {
                A: "#FF4C4C", // red
                B: "#4CFF4C", // green
                C: "#4C4CFF", // blue
                default: "#999999", // fallback
            };
            ctx.beginPath();
            ctx.arc(node.x, node.y+0.5, size / 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = phaseColors[node.predicted_phase] || phaseColors.default;
            ctx.globalAlpha = 0.4; // semi-transparent
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Draw the icon on top (all types)
        if (icon && icon.complete) {
            ctx.drawImage(icon, node.x - size / 2, node.y - size / 2, size, size);
        }
    };

    const renderLabel = (node, ctx) => {
        if (hoverNode && hoverNode.id === node.id) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(node.label || node.id, node.x + 10, node.y + 4);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 50);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (!fgRef.current || !focusNode) {
            // Stop flow animation when focusNode is cleared
            setFlowLinks([]);
            return;
        }

        const node = data.nodes.find((n) => n.id === focusNode);
        if (!node) return;

        if (node.type === "transformer") {
            setFlowLinks([]);
            // Get all nodes with parent matching this transformer's label
            const transformerLabel = node.label;
            fgRef.current.zoomToFit(1000, 150, (n) => n.id === node.id || n.parent === transformerLabel);
        } else if (node.type === "house") {
            // Traverse prev_node chain back to grid
            const pathNodes = [node]; // include the clicked house
            const pathLinks = [];
            let currentNode = node;

            while (currentNode.prev_node) {
                const prevId = Array.isArray(currentNode.prev_node)
                    ? currentNode.prev_node[0]
                    : currentNode.prev_node;

                const prevNode = data.nodes.find((n) => n.id === prevId);
                if (!prevNode) break;

                pathNodes.push(prevNode);

                const link = data.links.find(
                    (l) =>
                        (l.source.id === prevId && l.target.id === currentNode.id) ||
                        (l.target.id === prevId && l.source.id === currentNode.id)
                );
                if (link) pathLinks.push(link);

                currentNode = prevNode;
                if (currentNode.type === "grid") break;
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