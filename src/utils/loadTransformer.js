import t1 from "../data/tx1.json";
import t2 from "../data/tx2.json";
import t3 from "../data/tx3.json";

const datasets = [t1, t2, t3];
const normalizeType = (t) => (t ? t.toLowerCase() : t);

// Use WeakMap for better memory management
const transformerRadiiCache = new Map();

// Pre-index transformers for faster lookup
const transformerIndex = new Map();
datasets.forEach((dataset, idx) => {
    const transformer = dataset.find((n) => normalizeType(n.type) === "transformer");
    if (transformer) {
        transformerIndex.set(idx, transformer);
    }
});


export function loadTransformerData() {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Add grid node
    const gridNode = { id: "grid", type: "grid", x: 0, y: 0, label: "Main Grid" };
    nodes.push(gridNode);
    nodeMap.set(gridNode.id, gridNode);

    // Pre-calculate transformer positions
    const step = (2 * Math.PI) / datasets.length;
    const transformerPositions = new Map();

    datasets.forEach((dataset, idx) => {
        const transformer = transformerIndex.get(idx);
        if (!transformer) return;

        // Use cached radius or generate new one
        if (!transformerRadiiCache.has(transformer.id)) {
            transformerRadiiCache.set(transformer.id, 400 + Math.random() * 200);
        }
        const radius = transformerRadiiCache.get(transformer.id);

        const angle = idx * step;
        const tx = Math.cos(angle) * radius;
        const ty = Math.sin(angle) * radius;
        
        transformerPositions.set(idx, { tx, ty });

        const transformerNode = {
            ...transformer,
            type: normalizeType(transformer.type),
            x: tx,
            y: ty,
            label: `Transformer ${idx + 1}`,
            parent: "grid",
            prev_node: "grid",
            current_node: transformer.id,
        };
        nodes.push(transformerNode);
        nodeMap.set(transformerNode.id, transformerNode);

        // Grid → Transformer link
        links.push({ source: gridNode.id, target: transformerNode.id });
    });

    // Process houses in batch for better performance
    datasets.forEach((dataset, idx) => {
        const transformer = transformerIndex.get(idx);
        const position = transformerPositions.get(idx);
        if (!transformer || !position) return;

        const { tx, ty } = position;
        const transformerLabel = `Transformer ${idx + 1}`;

        // Filter houses once and process in batch
        const houses = dataset.filter((n) => n.type === "house");
        houses.forEach((house) => {
            const dx = house.x_meters - transformer.x_meters;
            const dy = house.y_meters - transformer.y_meters;

            const houseNode = {
                ...house,
                type: house.type.toLowerCase(),
                x: tx + dx * 40,
                y: ty + dy * 40,
                label: `House ${house.HouseID}`,
                parent: transformerLabel,
                prev_node: house.prev_nodes ? house.prev_nodes[0] : null,
                current_node: house.id,
            };
            nodes.push(houseNode);
            nodeMap.set(houseNode.id, houseNode);
        });
    });

    // Optimize link creation - avoid flattening and use batch processing
    for (const dataset of datasets) {
        for (const node of dataset) {
            if (node.next_nodes && nodeMap.has(node.id)) {
                for (const targetId of node.next_nodes) {
                    if (nodeMap.has(targetId)) {
                        links.push({ source: node.id, target: targetId });
                    }
                }
            }
        }
    }

    return { nodes, links };
}