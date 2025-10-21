import houseIcon from "../assets/house.svg";
import houseSolarIcon from "../assets/house-solar.svg";
import transformerIcon from "../assets/transformer.png";
import gridIcon from "../assets/grid.png";
import streetIcon from "../assets/street.png";
import { PHASE_COLORS, NODE_SIZES } from '../constants/index.js';

// Pre-load and cache images at module level
const createIconCache = () => {
  const imgHouse = new Image();
  const imgHouseSolar = new Image();
  const imgApartment = new Image();
  const imgTransformer = new Image();
  const imgGrid = new Image();
  const imgStreet = new Image();

  imgHouse.src = houseIcon;
  imgHouseSolar.src = houseSolarIcon;
  imgTransformer.src = transformerIcon;
  imgGrid.src = gridIcon;
  imgStreet.src = streetIcon;

  return { 
    house: imgHouse,
    houseSolar: imgHouseSolar,
    apartment: imgApartment,
    transformer: imgTransformer, 
    grid: imgGrid,
    street: imgStreet,
    feeder: imgGrid // Feeder is the grid
  };
};

// Single instance shared across all components
export const iconCache = createIconCache();

// Direct access to constants - import from ../constants/index.js instead
export { PHASE_COLORS as phaseColors, NODE_SIZES };
export const getNodeSize = (type) => NODE_SIZES[type] || NODE_SIZES.default;
