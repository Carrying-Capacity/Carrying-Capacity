import { ANIMATION_CONFIG } from '../constants/index.js';

/**
 * Get node by ID from graph data
 */
export const getNodeById = (nodes, id) => nodes.find(n => n.id === id);

/**
 * Get previous node IDs for a given node, handling different field formats
 */
export const getPreviousNodeIds = (node) => {
  if (Array.isArray(node.prev_nodes) && node.prev_nodes.length > 0) {
    return node.prev_nodes;
  }
  if (node.prev_node) {
    return [node.prev_node];
  }
  return [];
};

/**
 * Find link between two nodes
 */
export const findLinkBetweenNodes = (links, nodeId1, nodeId2) => {
  return links.find(link => {
    const sourceId = link.source.id || link.source;
    const targetId = link.target.id || link.target;
    return (sourceId === nodeId1 && targetId === nodeId2) ||
           (targetId === nodeId1 && sourceId === nodeId2);
  });
};

/**
 * Collect all downstream nodes starting from a given node (used for transformer views)
 */
export const collectDownstreamNodes = (graphData, startNode) => {
  if (!graphData?.nodes || !startNode) return [];

  const visited = new Set();
  const queue = [startNode];
  const result = [];

  visited.add(startNode.id);

  while (queue.length) {
    const curr = queue.shift();
    result.push(curr);

    const enqueueNode = (nodeId) => {
      if (!nodeId || visited.has(nodeId)) return;
      const childNode = getNodeById(graphData.nodes, nodeId);
      if (childNode) {
        visited.add(nodeId);
        queue.push(childNode);
      }
    };

    // 1) explicit next_nodes
    if (Array.isArray(curr.next_nodes)) {
      curr.next_nodes.forEach(enqueueNode);
    }

    // 2) nodes whose prev includes current node
    graphData.nodes.forEach(node => {
      const prevIds = getPreviousNodeIds(node);
      if (prevIds.includes(curr.id)) {
        enqueueNode(node.id);
      }
    });

    // 3) streets anchored to this net node (transformer or house)
    if (curr.type !== "street") {
      graphData.nodes.forEach(node => {
        if (node.type === "street" && node.net_node_id === curr.id) {
          enqueueNode(node.id);
        }
      });
    }

    // 4) if this is a street, walk connected streets and bridge to its net node
    if (curr.type === "street") {
      const connected = Array.isArray(curr.connected_nodes) ? curr.connected_nodes : [];
      connected.forEach(enqueueNode);
      if (curr.net_node_id) {
        enqueueNode(curr.net_node_id);
      }
    }
  }

  return result;
};

/**
 * Trace path from a house/street node back to the feeder (root)
 */
export const tracePathToFeeder = (graphData, startNode) => {
  if (!graphData?.nodes || !startNode) return { pathNodes: [], pathLinks: [] };

  const pathNodes = [startNode];
  const pathLinks = [];
  let currentNode = startNode;
  const visitedNodes = new Set([startNode.id]);

  for (let depth = 0; depth < ANIMATION_CONFIG.maxTraversalDepth; depth++) {
    let prevIds = getPreviousNodeIds(currentNode);
    
    // If this is a street node with an associated network node, bridge to it
    if (prevIds.length === 0 && currentNode.type === "street" && currentNode.net_node_id) {
      prevIds = [currentNode.net_node_id];
    }

    const prevId = prevIds[0];
    if (!prevId) {
      console.log(`Reached root node: ${currentNode.type} (${currentNode.id})`);
      break;
    }

    let prevNode = getNodeById(graphData.nodes, prevId);
    
    // Try to find alternative path if previous node not found
    if (!prevNode) {
      console.warn(`Could not find prev node with ID: ${prevId} - trying alternative path`);
      prevNode = graphData.nodes.find(n => 
        n.next_nodes && n.next_nodes.includes(currentNode.id)
      );
      
      if (!prevNode) {
        console.warn('No alternative path found - stopping traversal');
        break;
      }
      console.log(`Found alternative parent node: ${prevNode.type} ${prevNode.id}`);
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
    const link = findLinkBetweenNodes(graphData.links, currentNode.id, prevNode.id);
    if (link) {
      pathLinks.push(link);
    }

    currentNode = prevNode;

    // Stop if we've reached the feeder (root of the network)
    if (currentNode.type === "feeder") {
      console.log(`Path complete: reached feeder (${pathNodes.length} nodes)`);
      break;
    }
  }

  return { pathNodes, pathLinks };
};

/**
 * Utility to create debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};