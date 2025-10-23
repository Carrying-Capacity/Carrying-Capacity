import { ANIMATION_CONFIG } from '../constants/index.js';

/**
 * Get node by ID from graph data (deprecated - use adjacency.nodeById map instead)
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
 * Find link between two nodes (deprecated - use adjacency.linkById map instead)
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
 * Uses precomputed adjacency maps for O(1) lookups instead of O(N) scans
 */
export const collectDownstreamNodes = (graphData, startNode) => {
  if (!graphData?.adjacency || !startNode) return [];

  const { nodeById, childrenByNodeId } = graphData.adjacency;
  const visited = new Set();
  const queue = [startNode];
  const result = [];

  visited.add(startNode.id);

  while (queue.length) {
    const curr = queue.shift();
    result.push(curr);

    // Get all children from precomputed adjacency map (O(1) lookup)
    const children = childrenByNodeId.get(curr.id);
    if (children) {
      children.forEach(childId => {
        if (!visited.has(childId)) {
          const childNode = nodeById.get(childId);
          if (childNode) {
            visited.add(childId);
            queue.push(childNode);
          }
        }
      });
    }
  }

  return result;
};

/**
 * Trace path from a house/street node back to the feeder (root)
 * Uses precomputed adjacency maps for O(1) lookups instead of O(N) scans
 */
export const tracePathToFeeder = (graphData, startNode) => {
  if (!graphData?.adjacency || !startNode) return { pathNodes: [], pathLinks: [] };

  const { nodeById, parentsByNodeId, linkById } = graphData.adjacency;
  const pathNodes = [startNode];
  const pathLinks = [];
  let currentNode = startNode;
  const visitedNodes = new Set([startNode.id]);

  for (let depth = 0; depth < ANIMATION_CONFIG.maxTraversalDepth; depth++) {
    // Get parents from precomputed adjacency map (O(1) lookup)
    const parents = parentsByNodeId.get(currentNode.id);
    if (!parents || parents.size === 0) {
      break;
    }

    // Take the first parent (typically there's only one in a tree structure)
    const prevId = Array.from(parents)[0];
    if (!prevId) {
      break;
    }

    const prevNode = nodeById.get(prevId);
    if (!prevNode) {
      break;
    }

    // Add the previous node to the path
    pathNodes.push(prevNode);
    visitedNodes.add(prevNode.id);

    // Find the link using precomputed link map (O(1) lookup)
    const link = linkById.get(`${currentNode.id}-${prevNode.id}`);
    if (link) {
      pathLinks.push(link);
    }

    currentNode = prevNode;

    // Stop if we've reached the feeder (root of the network)
    if (currentNode.type === "feeder") {
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