import example from "../data/example.json";

const datasets = [example];
const normalizeType = (t) => (t ? t.toLowerCase() : t);

// Helper function to generate appropriate labels for nodes
const getNodeLabel = (node) => {
    switch (normalizeType(node.type)) {
        case "feeder":
            return node.name || "Main Feeder";
        case "transformer":
            return node.name || "Transformer";
        case "house":
            return `House ${node.HouseID || node.id}`;
        case "street":
            return `Street ${node.id}`;
        default:
            return node.id;
    }
};


export function loadTransformerData() {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Scale factor for positioning
    const scale = 4;

    // Process the single network (example.json contains the complete network)
    const network = datasets[0]; // Only one dataset now - the complete network
    
    // Create a set of all valid node IDs for reference cleaning
    const validNodeIds = new Set(network.map(node => node.id));
    
    // Auto-assign numerical house IDs if they don't exist
    let nextHouseId = 1;
    const houseIdMap = new Map();
    
    // First pass: assign house IDs to houses that don't have them
    network.forEach((node) => {
        if (normalizeType(node.type) === "house" && !node.HouseID) {
            houseIdMap.set(node.id, nextHouseId++);
        }
    });
    
    // Process all nodes in the network
    network.forEach((node) => {
        // Skip removed street nodes
        if (node.type === "street" && node.removed) {
            return;
        }

        // Clean up broken node references
        const cleanPrevNodes = node.prev_nodes ? node.prev_nodes.filter(id => validNodeIds.has(id)) : [];
        const cleanNextNodes = node.next_nodes ? node.next_nodes.filter(id => validNodeIds.has(id)) : [];
        
        // Create node with JSON-defined position and auto-assigned house ID if needed
        const assignedHouseId = houseIdMap.get(node.id) || node.HouseID;
        const processedNode = {
            ...node,
            type: normalizeType(node.type),
            x: (node.x_meters || 0) * scale,
            y: (node.y_meters || 0) * scale,
            label: getNodeLabel({ ...node, HouseID: assignedHouseId }),
            prev_nodes: cleanPrevNodes,
            next_nodes: cleanNextNodes,
            prev_node: cleanPrevNodes.length > 0 ? cleanPrevNodes[0] : null,
            current_node: node.id,
            name: node.name || (node.type === "transformer" ? "Transformer" : node.type === "feeder" ? "Feeder" : null),
            HouseID: assignedHouseId // Ensure HouseID is always present for houses
        };

        nodes.push(processedNode);
        nodeMap.set(processedNode.id, processedNode);
    });

    // Create links based on JSON-defined connections
    nodes.forEach((node) => {
        if (node.next_nodes && Array.isArray(node.next_nodes)) {
            node.next_nodes.forEach((targetId) => {
                if (nodeMap.has(targetId)) {
                    links.push({ source: node.id, target: targetId });
                }
            });
        }
    });

    return { nodes, links };
}