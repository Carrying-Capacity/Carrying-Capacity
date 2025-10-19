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
  default: CHART_COLORS.neutral
};

export const NODE_SIZES = {
  grid: 100,
  feeder: 100,
  transformer: 60,
  street: 14,
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
  margin: { top: 20, right: 30, left: 20, bottom: 5 }
};

export const MODAL_STYLES = {
  normal: {
    position: "fixed",
    top: "152px",
    right: "20px", 
    width: "480px",
    maxWidth: "calc(100vw - 40px)",
    maxHeight: "calc(100vh - 172px)",
    zIndex: 1005,
    padding: "1.5rem",
    overflow: "auto",
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)"
  },
  fullscreen: {
    position: "fixed",
    top: "152px",
    left: "20px",
    right: "20px", 
    bottom: "20px",
    zIndex: 1006,
    padding: "2rem",
    overflow: "auto",
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)"
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

