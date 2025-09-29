import t1 from "../data/tx1.json";
import t2 from "../data/tx2.json";
import t3 from "../data/tx3.json";

const datasets = [t1, t2, t3];
const normalizeType = (t) => (t ? t.toLowerCase() : t);
let transformerRadii ={};


export function loadTransformerData() {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Add grid node
    const gridNode = { id: "grid", type: "grid", x: 0, y: 0, name: "Main Grid" };
    nodes.push(gridNode);
    nodeMap.set(gridNode.id, gridNode);

    // Place transformers around a circle
    const step = (2 * Math.PI) / datasets.length;

    datasets.forEach((dataset, idx) => {
        const transformer = dataset.find(
            (n) => n.type.toLowerCase() === "transformer"
        );
        if (!transformer) return;

        if (!transformerRadii[transformer.id]) {
            transformerRadii[transformer.id] = 400 + Math.random() * 200;
        }
        const radius = transformerRadii[transformer.id];

        const angle = idx * step;
        const tx = Math.cos(angle) * radius;
        const ty = Math.sin(angle) * radius;

        const transformerNode = {
            ...transformer,
            type: normalizeType(transformer.type),
            x: tx,
            y: ty,
            name: transformer.name || transformer.id,
        };
        nodes.push(transformerNode);
        nodeMap.set(transformerNode.id, transformerNode);

        // Grid → Transformer link
        links.push({ source: gridNode.id, target: transformerNode.id });

        // Houses relative to transformer
        dataset
            .filter((n) => n.type === "house")
            .forEach((house) => {
                const dx = house.x_meters - transformer.x_meters;
                const dy = house.y_meters - transformer.y_meters;

                const houseNode = {
                    ...house,
                    x: tx + dx*40,
                    y: ty + dy*40,
                };
                nodes.push(houseNode);
                nodeMap.set(houseNode.id, houseNode);
            });
    });

    // After all nodes are created, build links only if both ends exist
    datasets.flat().forEach((node) => {
        node.next_nodes?.forEach((targetId) => {
            if (nodeMap.has(node.id) && nodeMap.has(targetId)) {
                links.push({ source: node.id, target: targetId });
            }
        });
    });

    return { nodes, links };
}