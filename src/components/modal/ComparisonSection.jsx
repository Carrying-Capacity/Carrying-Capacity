import { memo } from "react";
import { CircleMinus } from "lucide-react";

export const ComparisonSection = memo(({ comparisonList = [], onRemoveFromComparison }) => {
  if (comparisonList.length === 0) {
    return (
      <div className="mb-6 border-2 border-gray-200 rounded-lg p-4">
        <h4 className="text-xl font-semibold mb-3 text-gray-800">House Comparison</h4>
        <p className="text-gray-600">
          No houses selected for comparison. Right-click on houses in the graph to add them.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 border-2 border-gray-200 rounded-lg p-4">
      <h4 className="text-xl font-semibold mb-3 text-gray-800">House Comparison</h4>
      <div className="space-y-4">
        {comparisonList.map((house) => (
          <div key={house.id} className="p-3 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-semibold text-lg">{house.label || house.id}</h5>
                <p className="text-sm text-gray-600">
                  <strong>House ID:</strong> {house.HouseID}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phase:</strong> {
                    Array.isArray(house.predicted_phase) && house.predicted_phase.length > 1
                      ? `3-Phase (${house.predicted_phase.join(' → ')})`
                      : Array.isArray(house.predicted_phase) 
                        ? house.predicted_phase[0]
                        : house.predicted_phase
                  }
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transformer:</strong> {house.parent}
                </p>
              </div>
              {onRemoveFromComparison && (
                <button
                  type="button"
                  onClick={() => onRemoveFromComparison(house.id)}
                  className="modal-header-button"
                  title="Remove from comparison"
                  aria-label="Remove from comparison"
                >
                  <CircleMinus className="modal-header-icon" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ComparisonSection.displayName = "ComparisonSection";
