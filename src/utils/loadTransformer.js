import nodes from "../data/nodes.json";

const datasets = [nodes];
const normalizeType = (t) => (t ? t.toLowerCase() : t);

// Helper function to generate appropriate labels for nodes
const getNodeLabel = (node) => {
    switch (normalizeType(node.type)) {
        case "feeder":
            return node.name || "Main Feeder";
        case "transformer":
            return node.name || `Transformer ${node.transformer_number || node.transformer || 'Unknown'}`;
        case "house":
            return `House ${node.HouseID || node.house_number || node.id}`;
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
    const scale = 100;

    // Process the single network (nodes.json contains the complete network)
    const network = datasets[0]; // Only one dataset now - the complete network

    // Create a set of all valid node IDs for reference cleaning
    const validNodeIds = new Set();
    for (let i = 0; i < network.length; i++) {
        validNodeIds.add(network[i].id);
    }

    // Auto-assign numerical house IDs if they don't exist
    let nextHouseId = 1;
    const houseIdMap = new Map();

    // Pre-calculate house IDs
    for (let i = 0; i < network.length; i++) {
        const node = network[i];
        if (normalizeType(node.type) === "house" && !node.HouseID && !node.house_number) {
            houseIdMap.set(node.id, nextHouseId++);
        }
    }

    // Initialize adjacency maps
    const childrenByNodeId = new Map();
    const parentsByNodeId = new Map();
    const streetsByNetNodeId = new Map();
    const linkById = new Map();

    // Single pass to process nodes and initialize maps
    for (let i = 0; i < network.length; i++) {
        const node = network[i];

        // Skip removed street nodes
        if (node.type === "street" && node.removed) {
            continue;
        }

        const type = normalizeType(node.type);
        const assignedHouseId = node.HouseID || node.house_number || houseIdMap.get(node.id);

        // Clean up broken node references
        const cleanPrevNodes = node.prev_nodes ? node.prev_nodes.filter(id => validNodeIds.has(id)) : [];
        const cleanNextNodes = node.next_nodes ? node.next_nodes.filter(id => validNodeIds.has(id)) : [];

        const processedNode = {
            ...node,
            type,
            x: (node.x_meters || 0) * scale,
            y: (node.y_meters || 0) * scale,
            label: getNodeLabel({ ...node, HouseID: assignedHouseId, transformer_number: node.transformer_number || node.transformer }),
            prev_nodes: cleanPrevNodes,
            next_nodes: cleanNextNodes,
            prev_node: cleanPrevNodes.length > 0 ? cleanPrevNodes[0] : null,
            current_node: node.id,
            name: node.name || (type === "transformer" ? `Transformer ${node.transformer_number || node.transformer || 'Unknown'}` : type === "feeder" ? "Feeder" : null),
            HouseID: assignedHouseId,
            parent: node.parent_transformer || node.parent || node.transformer,
            transformer_number: node.transformer_number || node.transformer
        };

        nodes.push(processedNode);
        nodeMap.set(processedNode.id, processedNode);

        // Initialize adjacency sets
        childrenByNodeId.set(processedNode.id, new Set());
        parentsByNodeId.set(processedNode.id, new Set());
    }

    // Second pass for relationships (links, children, parents)
    // We need a second pass because we need to ensure all nodes are in nodeMap first
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Process next_nodes (links and children)
        if (node.next_nodes && Array.isArray(node.next_nodes)) {
            for (let j = 0; j < node.next_nodes.length; j++) {
                const targetId = node.next_nodes[j];
                if (nodeMap.has(targetId)) {
                    // Create link
                    const link = { source: node.id, target: targetId };
                    links.push(link);

                    // Update adjacency
                    childrenByNodeId.get(node.id).add(targetId);
                    parentsByNodeId.get(targetId).add(node.id);

                    // Update link map
                    linkById.set(`${node.id}-${targetId}`, link);
                    linkById.set(`${targetId}-${node.id}`, link);
                }
            }
        }

        // Process prev_nodes (parents)
        if (node.prev_nodes && Array.isArray(node.prev_nodes)) {
            for (let j = 0; j < node.prev_nodes.length; j++) {
                const parentId = node.prev_nodes[j];
                if (nodeMap.has(parentId)) {
                    parentsByNodeId.get(node.id).add(parentId);
                    childrenByNodeId.get(parentId).add(node.id);
                }
            }
        }

        // Process street specific logic
        if (node.type === "street") {
            // Street to net node map
            if (node.net_node_id) {
                if (!streetsByNetNodeId.has(node.net_node_id)) {
                    streetsByNetNodeId.set(node.net_node_id, new Set());
                }
                streetsByNetNodeId.get(node.net_node_id).add(node.id);

                // Bidirectional connection
                childrenByNodeId.get(node.id).add(node.net_node_id);
                if (childrenByNodeId.has(node.net_node_id)) {
                    childrenByNodeId.get(node.net_node_id).add(node.id);
                }
            }

            // Street connected_nodes
            if (Array.isArray(node.connected_nodes)) {
                for (let j = 0; j < node.connected_nodes.length; j++) {
                    const connectedId = node.connected_nodes[j];
                    if (nodeMap.has(connectedId)) {
                        childrenByNodeId.get(node.id).add(connectedId);
                    }
                }
            }
        }
    }

    return {
        nodes,
        links,
        adjacency: {
            nodeById: nodeMap,
            childrenByNodeId,
            parentsByNodeId,
            streetsByNetNodeId,
            linkById
        }
    };
}