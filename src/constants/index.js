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
    position: "absolute",
    top: "20px",
    right: "20px", 
    left: "calc(100vw - 20px - 500px)",
    maxHeight: "80vh",
    zIndex: 10,
    padding: "1.5rem",
    overflow: "auto",
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.23)"
  },
  fullscreen: {
    position: "absolute",
    top: "20px",
    left: "20px",
    right: "20px", 
    zIndex: 50,
    padding: "2rem",
    overflow: "auto",
    backgroundColor: "#fdfdfd",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.23)",
    maxHeight: "calc(100vh - 40px)"
  }
};

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
}));

export const HOUSE635_CONFIGS = {
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
