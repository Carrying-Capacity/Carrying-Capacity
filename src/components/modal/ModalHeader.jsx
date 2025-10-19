import { memo } from "react";
import { Maximize2, Minimize2, X as XIcon, CirclePlus, CircleMinus } from "lucide-react";

export const ModalHeader = memo(({ 
  title, 
  isFullscreen, 
  onToggleFullscreen, 
  onClose,
  showComparisonButton = false,
  isInComparison = false,
  onToggleComparison
}) => {
  return (
    <div className="modal-header">
      <div className="modal-header-row">
        <h3 className="modal-header-title">{title}</h3>
        <div className="modal-header-buttons">
          {showComparisonButton && (
            <button
              onClick={onToggleComparison}
              className="modal-header-button"
              title={isInComparison ? "Remove from comparison list" : "Add to comparison list"}
              aria-label={isInComparison ? "Remove from comparison" : "Add to comparison"}
            >
              {isInComparison ? (
                <CircleMinus className="modal-header-icon" />
              ) : (
                <CirclePlus className="modal-header-icon" />
              )}
            </button>
          )}
          <button
            onClick={onToggleFullscreen}
            className="modal-header-button"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="modal-header-icon" />
            ) : (
              <Maximize2 className="modal-header-icon" />
            )}
          </button>
          <button
            onClick={onClose}
            className="modal-header-button"
            title="Close (ESC)"
            aria-label="Close"
          >
            <XIcon className="modal-header-icon" />
          </button>
        </div>
      </div>
    </div>
  );
});

ModalHeader.displayName = "ModalHeader";
