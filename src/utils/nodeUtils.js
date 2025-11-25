// Node type checking utilities

export const NODE_TYPES = {
  HOUSE: "house",
  TRANSFORMER: "transformer",
  FEEDER: "feeder",
  STREET: "street",
  GRID: "grid"
};

// Node type validation functions
export const isHouse = (node) => node?.type === NODE_TYPES.HOUSE;
export const isTransformer = (node) => node?.type === NODE_TYPES.TRANSFORMER;
export const isFeeder = (node) => node?.type === NODE_TYPES.FEEDER;
export const isStreet = (node) => node?.type === NODE_TYPES.STREET;
export const isGrid = (node) => node?.type === NODE_TYPES.GRID;

// Check if node is a network infrastructure node (not house or street)
export const isInfrastructureNode = (node) =>
  isTransformer(node) || isFeeder(node) || isGrid(node);

// Check if node is a connection point (house or street)
export const isConnectionNode = (node) =>
  isHouse(node) || isStreet(node);

// Get display name for node
export const getNodeDisplayName = (node) => {
  if (!node) return "Unknown";

  if (node.name) return node.name;
  if (node.label) return node.label;

  // Generate default names based on type
  switch (node.type) {
    case NODE_TYPES.HOUSE:
      return `House ${node.id}`;
    case NODE_TYPES.TRANSFORMER:
      return `Transformer ${node.id}`;
    case NODE_TYPES.FEEDER:
      return `Feeder ${node.id}`;
    case NODE_TYPES.STREET:
      return `Street ${node.id}`;
    case NODE_TYPES.GRID:
      return `Grid ${node.id}`;
    default:
      return `Node ${node.id}`;
  }
};

// Get node properties specific to type
export const getNodeTypeProperties = (node) => {
  if (!node) return {};

  const commonProps = {
    id: node.id,
    type: node.type,
    displayName: getNodeDisplayName(node)
  };

  switch (node.type) {
    case NODE_TYPES.HOUSE:
      return {
        ...commonProps,
        houseId: node.HouseID,
        phase: node.predicted_phase,
        hasSolar: Boolean(node.solar),
        parentTransformer: node.parent
      };

    case NODE_TYPES.TRANSFORMER:
      return {
        ...commonProps,
        capacity: node.capacity,
        phases: node.phases
      };

    case NODE_TYPES.FEEDER:
      return {
        ...commonProps,
        voltage: node.voltage,
        capacity: node.capacity
      };

    default:
      return commonProps;
  }
};

// Filter nodes by type
export const filterNodesByType = (nodes, nodeType) =>
  nodes?.filter(node => node.type === nodeType) || [];

// Get nodes of multiple types
export const filterNodesByTypes = (nodes, nodeTypes) =>
  nodes?.filter(node => nodeTypes.includes(node.type)) || [];

// Check if node has energy data capability
export const hasEnergyData = (node) => isHouse(node) && node.HouseID;

// Calculate imbalance score (0-100) based on phase counts
// Returns { score, level, color }
export const calculateImbalanceScore = (counts) => {
  const values = Object.values(counts);
  const total = values.reduce((a, b) => a + b, 0);

  if (total === 0) return { score: 0, level: 'Balanced', color: '#22c55e' }; // Green

  const max = Math.max(...values);
  const min = Math.min(...values);
  const diff = max - min;

  // Score is percentage of imbalance (0 to 100)
  // If all on one phase: (Total - 0) / Total = 1.0 -> 100
  // If perfectly balanced: (X - X) / Total = 0 -> 0
  const score = Math.round((diff / total) * 100);

  let level = 'Balanced';
  let color = '#22c55e'; // Green

  if (score > 30) {
    level = 'Critical';
    color = '#ef4444'; // Red
  } else if (score > 10) {
    level = 'Moderate';
    color = '#eab308'; // Yellow
  }

  return { score, level, color };
};