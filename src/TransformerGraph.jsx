import React, { useRef, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

import houseIcon from "./assets/house.png";
import transformerIcon from "./assets/transformer.png";
import gridIcon from "./assets/grid.png";

export default function TransformerGraph({ data, focusNode, onNodeClick }) {
    const fgRef = useRef();
    const [faded, setFaded] = useState(null); // currently focused transformer/house
    const [flowHouse, setFlowHouse] = useState(null); // clicked house for power flow
    const [tick, setTick] = useState(0); // animation tick

    // --- 1️⃣ Animation interval for dashed links ---
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 50);
        return () => clearInterval(interval);
    }, []);

    // --- 2️⃣ Initial centering on grid and zoom to fit ---
    useEffect(() => {
        if (fgRef.current && data.nodes.length) {
            const gridNode = data.nodes.find((n) => n.type === "grid");
            if (gridNode) {
                fgRef.current.centerAt(gridNode.x, gridNode.y, 0);
                fgRef.current.zoomToFit(1000, 40); // 40px padding
            } else {
                fgRef.current.zoomToFit(1000);
            }
        }
    }, [data]);

    // --- 3️⃣ Handle focusNode and window resize ---
    useEffect(() => {
        const handleResize = () => {
            if (fgRef.current) fgRef.current.zoomToFit(1000);
        };

        window.addEventListener("resize", handleResize);

        if (fgRef.current && focusNode) {
            const node = data.nodes.find((n) => n.id === focusNode);
            if (node) {
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(4, 1000);
                setFaded(focusNode);
            }
        } else {
            setFaded(null);
            setFlowHouse(null);
        }

        return () => window.removeEventListener("resize", handleResize);
    }, [focusNode, data]);

    // --- Helper functions ---
    const getConnectedNodeIds = (startId) => {
        const visited = new Set();
        const stack = [startId];
        while (stack.length) {
            const id = stack.pop();
            visited.add(id);
            data.links.forEach((link) => {
                if (link.source.id === id && !visited.has(link.target.id)) stack.push(link.target.id);
                if (link.target.id === id && !visited.has(link.source.id)) stack.push(link.source.id);
            });
        }
        return visited;
    };

    const getFlowLinks = (houseId) => {
        const house = data.nodes.find((n) => n.id === houseId);
        if (!house || house.type !== "house") return [];
        const transformerLink = data.links.find(
            (l) =>
                (l.source.id === houseId && l.target.type === "transformer") ||
                (l.target.id === houseId && l.source.type === "transformer")
        );
        if (!transformerLink) return [];
        const transformerId =
            transformerLink.source.type === "transformer"
                ? transformerLink.source.id
                : transformerLink.target.id;
        const gridLink = data.links.find(
            (l) =>
                (l.source.id === transformerId && l.target.type === "grid") ||
                (l.target.id === transformerId && l.source.type === "grid")
        );
        const flowLinks = [];
        if (gridLink) flowLinks.push(gridLink);
        flowLinks.push(transformerLink);
        return flowLinks;
    };

    const iconCache = {
        house: new Image(),
        transformer: new Image(),
        grid: new Image(),
    };
    iconCache.house.src = houseIcon;
    iconCache.transformer.src = transformerIcon;
    iconCache.grid.src = gridIcon;

    const getNodeSize = (node) => {
        if (node.type === "grid") return 40;
        if (node.type === "transformer") return 25;
        return 15;
    };

    return (
        <ForceGraph2D
            ref={fgRef}
            graphData={data}
            nodeCanvasObject={(node, ctx) => {
                const size = getNodeSize(node);
                const connectedNodes = faded ? getConnectedNodeIds(faded) : null;
                const opacity = !faded
                    ? 1
                    : connectedNodes.has(node.id) || node.id === flowHouse
                        ? 1
                        : 0.1;

                ctx.globalAlpha = opacity;

                let img;
                if (node.type === "grid") img = iconCache.grid;
                else if (node.type === "transformer") img = iconCache.transformer;
                else img = iconCache.house;

                if (img.complete) {
                    ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);
                } else {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
                    ctx.fillStyle =
                        node.type === "house"
                            ? "blue"
                            : node.type === "transformer"
                                ? "orange"
                                : "red";
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                const size = getNodeSize(node);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
                ctx.fill();
            }}
            linkCanvasObject={(link, ctx) => {
                const connectedNodes = faded ? getConnectedNodeIds(faded) : null;
                const sourceVisible =
                    !faded || connectedNodes.has(link.source.id) || link.source.id === flowHouse;
                const targetVisible =
                    !faded || connectedNodes.has(link.target.id) || link.target.id === flowHouse;
                if (!sourceVisible && !targetVisible) return;

                ctx.strokeStyle = "#999";
                ctx.lineWidth = 1;
                ctx.setLineDash([]);

                if (flowHouse) {
                    const flowLinks = getFlowLinks(flowHouse);
                    if (flowLinks.includes(link)) {
                        ctx.strokeStyle = "orange";
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.lineDashOffset = -tick;
                    }
                }

                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.stroke();
            }}
            enableNodeDrag={false}
            cooldownTicks={100}
            onNodeClick={(node) => {
                onNodeClick(node);
                setFaded(node.id);
                if (node.type === "house") setFlowHouse(node.id);
                else setFlowHouse(null);
            }}
        />
    );
}
