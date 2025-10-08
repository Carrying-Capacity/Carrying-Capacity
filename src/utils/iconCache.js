import houseIcon from "../assets/house.png";
import transformerIcon from "../assets/transformer.png";
import gridIcon from "../assets/grid.png";
import streetIcon from "../assets/street.png";

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
    case "feeder": return 100; // Feeder replaces grid
    case "transformer": return 60;
    case "street": return 14;
    case "house": 
    default: return 14;
  }
};
