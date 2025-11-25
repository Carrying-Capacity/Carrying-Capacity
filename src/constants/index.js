// Shared constants and configuration
export const CHART_COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  accent: '#ff7300',
  warning: '#ffc658',
  danger: '#ff7c7c',
  success: '#4CFF4C',
  error: '#FF4C4C',
  info: '#4C4CFF',
  neutral: '#999999'
};

export const PHASE_COLORS = {
  A: CHART_COLORS.error,    // red
  B: CHART_COLORS.success,  // green  
  C: CHART_COLORS.info,     // blue
  THREE_PHASE: '#9333ea',   // purple for 3-phase customers
  default: CHART_COLORS.neutral
};

// Softer colors for house backgrounds (glassmorphism style)
export const PHASE_COLORS_SOFT = {
  A: '#f87171',      // softer red
  B: '#4ade80',      // softer green
  C: '#60a5fa',      // softer blue
  THREE_PHASE: '#a78bfa',  // softer purple
  default: '#94a3b8'  // softer gray
};

export const NODE_SIZES = {
  feeder: 60,
  transformer: 30,
  street: 10,
  house: 14,
  default: 14
};

export const CHART_CONFIGS = {
  voltage: [
    { key: 'voltage', name: 'Voltage (V)', color: CHART_COLORS.primary }
  ],
  power: [
    { key: 'import_power', name: 'Import Power (kWh)', color: CHART_COLORS.secondary },
    { key: 'export_power', name: 'Export Power (kWh)', color: CHART_COLORS.accent }
  ],
  reactive: [
    { key: 'inductive_power', name: 'Inductive Power (kVArh)', color: CHART_COLORS.warning },
    { key: 'capacitive_power', name: 'Capacitive Power (kVArh)', color: CHART_COLORS.danger }
  ]
};

export const METRICS_MAP = {
  voltage: ['voltage'],
  power: ['import_power', 'export_power'],
  reactive: ['inductive_power', 'capacitive_power']
};

export const UNITS = {
  voltage: 'V',
  power: 'kWh',
  reactive: 'kVArh'
};

export const ANIMATION_CONFIG = {
  duration: 700,
  debounceDelay: 100,
  animationInterval: 50,
  maxTraversalDepth: 100
};

export const CHART_DIMENSIONS = {
  height: 400,
  margin: { top: 10, right: 10, left: 10, bottom: 10 }
};

// UI Constants - must be defined before MODAL_STYLES
export const UI_CONSTANTS = {
  defaultGraphTopOffset: 132,
  searchResultsLimit: 10,
  comparisonDropdownMaxHeight: 300,
  modalOffset: 20,
};

export const MODAL_STYLES = {
  normal: {
    position: "fixed",
    top: "var(--modal-top, 152px)",
    right: `${UI_CONSTANTS.modalOffset}px`,
    width: "480px",
    maxWidth: "calc(100vw - 40px)",
    maxHeight: `calc(100vh - var(--modal-top, 172px) - ${UI_CONSTANTS.modalOffset}px)`,
    zIndex: 1005,
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  fullscreen: {
    position: "fixed",
    top: "var(--modal-top, 152px)",
    left: `${UI_CONSTANTS.modalOffset}px`,
    right: `${UI_CONSTANTS.modalOffset}px`,
    bottom: `${UI_CONSTANTS.modalOffset}px`,
    zIndex: 1006,
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  }
};

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
}));

// Time series properties for comparison charts from towndatamarch_1_2 table
export const TIME_SERIES_PROPERTIES = {
  'Voltage.PhA': {
    label: 'Voltage Phase A (V)',
    color: PHASE_COLORS.A,
    unit: 'V'
  },
  'Voltage.PhB': {
    label: 'Voltage Phase B (V)',
    color: PHASE_COLORS.B,
    unit: 'V'
  },
  'Voltage.PhC': {
    label: 'Voltage Phase C (V)',
    color: PHASE_COLORS.C,
    unit: 'V'
  },
  ImportPower: {
    label: 'Import Power (kW)',
    color: CHART_COLORS.secondary,
    unit: 'kW'
  },
  ExportPower: {
    label: 'Export Power (kW)',
    color: CHART_COLORS.accent,
    unit: 'kW'
  },
  InductivePower: {
    label: 'Inductive Power (kVAr)',
    color: CHART_COLORS.warning,
    unit: 'kVAr'
  },
  CapacitivePower: {
    label: 'Capacitive Power (kVAr)',
    color: CHART_COLORS.danger,
    unit: 'kVAr'
  }
};

// Colors for different houses in comparison charts
export const HOUSE_COLORS = [
  '#8884d8', '#82ca9d', '#ff7300', '#ffc658', '#ff7c7c',
  '#4CFF4C', '#4C4CFF', '#999999', '#e91e63', '#9c27b0',
  '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'
];

// Utility function to get phase color
export const getPhaseColor = (phase) => {
  return PHASE_COLORS[phase] || PHASE_COLORS.default;
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};
