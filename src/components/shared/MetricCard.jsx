export const MetricCard = ({ icon: Icon, value, label, iconClass }) => (
  <div className="metric-card">
    <div className={`metric-icon-wrapper ${iconClass || ''}`}>
      <Icon size={20} />
    </div>
    <div className="metric-content">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  </div>
);
