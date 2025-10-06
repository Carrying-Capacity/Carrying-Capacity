import houseIcon from "../assets/house.png";
import transformerIcon from "../assets/transformer.png";
import gridIcon from "../assets/grid.png";

// Pre-load and cache images at module level
const createIconCache = () => {
  const imgHouse = new Image();
  const imgTransformer = new Image();
  const imgGrid = new Image();

  imgHouse.src = houseIcon;
  imgTransformer.src = transformerIcon;
  imgGrid.src = gridIcon;

  return { 
    house: imgHouse, 
    transformer: imgTransformer, 
    grid: imgGrid 
  };
};

// Single instance shared across all components
export const iconCache = createIconCache();

// Phase color constants
export const phaseColors = {
  A: "#FF4C4C", // red
  B: "#4CFF4C", // green
  C: "#4C4CFF", // blue
  default: "#999999", // fallback
};

// Node size constants
export const getNodeSize = (type) => {
  switch (type) {
    case "grid": return 100;
    case "transformer": return 60;
    case "house": 
    default: return 14;
  }
};