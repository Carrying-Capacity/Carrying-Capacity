import houseIcon from "../assets/house.png";
import transformerIcon from "../assets/transformer.png";
import gridIcon from "../assets/grid.png";
import streetIcon from "../assets/street.png";
import { PHASE_COLORS, NODE_SIZES } from '../constants/index.js';

// Pre-load and cache images at module level
const createIconCache = () => {
  const imgHouse = new Image();
  const imgTransformer = new Image();
  const imgGrid = new Image();
  const imgStreet = new Image();

  imgHouse.src = houseIcon;
  imgTransformer.src = transformerIcon;
  imgGrid.src = gridIcon;
  imgStreet.src = streetIcon;

  return { 
    house: imgHouse, 
    transformer: imgTransformer, 
    grid: imgGrid,
    street: imgStreet,
    feeder: imgGrid // Feeder is the grid
  };
};

// Single instance shared across all components
export const iconCache = createIconCache();

// Re-export constants for backward compatibility
export const phaseColors = PHASE_COLORS;
export const getNodeSize = (type) => NODE_SIZES[type] || NODE_SIZES.default;
