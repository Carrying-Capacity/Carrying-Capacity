import { Network, Zap, Home } from 'lucide-react';

/**
 * Get the appropriate icon component for a node type
 * @param {string} nodeType - Type of node (feeder, transformer, house)
 * @returns {React.Component} Icon component
 */
export const getNodeIcon = (nodeType) => {
  const iconMap = {
    feeder: Network,
    transformer: Zap,
    house: Home,
  };
  return iconMap[nodeType] || Home;
};
