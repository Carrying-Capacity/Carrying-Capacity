const PROPERTY_CATEGORIES = {
  voltage: {
    label: 'Voltage',
    description: 'All voltage phases (A, B, C)'
  },
  realPower: {
    label: 'Real Power',
    description: 'Import and Export Power'
  },
  reactivePower: {
    label: 'Reactive Power',
    description: 'Inductive and Capacitive Power'
  }
};

export default function PropertySelector({ selectedProperty, onPropertyChange, className = "" }) {

  return (
    <div className={`property-selector ${className}`}>
      <div className="mb-3">
        <h5 className="text-md font-medium text-gray-700 mb-2">Select Property Category</h5>
      </div>

      {/* Property category radio buttons */}
      <div className="space-y-2">
        {Object.entries(PROPERTY_CATEGORIES).map(([propertyKey, config]) => (
          <label
            key={propertyKey}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200"
          >
            <input
              type="radio"
              name="property-selection"
              checked={selectedProperty === propertyKey}
              onChange={() => onPropertyChange(propertyKey)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">{config.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
