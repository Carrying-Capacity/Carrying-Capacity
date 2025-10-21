import { useState, useEffect, memo, lazy, Suspense } from "react";
import { useModalPosition } from "../hooks/useControlPanelHeight.js";
import { useComparison } from "../context/ComparisonContext.jsx";
import { MODAL_STYLES } from "../constants/index.js";
import { isHouse, isTransformer } from "../utils/nodeUtils.js";
import { ModalHeader } from "./modal/ModalHeader.jsx";
import { NodeInfoSection } from "./modal/NodeInfoSection.jsx";
import { ComparisonSection } from "./modal/ComparisonSection.jsx";
const HouseEnergyViz = lazy(() => import('./modal/HouseEnergyViz.jsx').then(m => ({ default: m.HouseEnergyViz })));
const TransformerViz = lazy(() => import('./modal/TransformerViz.jsx').then(m => ({ default: m.TransformerViz })));
import { ComparisonTimeSeriesViz } from "./modal/ComparisonTimeSeriesViz.jsx";
import "./InfoModal.css";

const InfoModal = memo(({ node, onClose, isComparison = false, onFullscreenChange }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const toggleFullscreen = () => setIsFullscreen(prev => !prev);
    
    const handleClose = () => {
        setIsFullscreen(false);
        onClose();
    };

    useEffect(() => {
        onFullscreenChange?.(isFullscreen);
    }, [isFullscreen, onFullscreenChange]);
    
    useModalPosition();
    
    useEffect(() => {
        const handleKeydown = (event) => {
            const target = event.target;
            const isTyping = ['input', 'textarea'].includes(target?.tagName?.toLowerCase()) || target?.isContentEditable;
            if (isTyping) return;

            if (event.key === 'Escape') {
                handleClose();
            } else if ((event.key === 'f' || event.key === 'F') && !event.ctrlKey && !event.metaKey && !event.altKey) {
                toggleFullscreen();
            }
        };
        
        document.body.classList.add('modal-open');
        document.addEventListener('keydown', handleKeydown);
        
        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.body.classList.remove('modal-open');
        };
    }, [onClose]);
    
    const { comparisonList, removeFromComparison, toggleHouseInComparison } = useComparison();
    
    const nodeIsHouse = isHouse(node);
    const nodeIsTransformer = isTransformer(node);
    const isInComparison = comparisonList?.some(h => h.id === node?.id);

    
    // Show modal if we have a single node or if we're in comparison mode with houses to compare
    if (!node && (!isComparison || comparisonList.length === 0)) return null;
    
    return (
        <>
            {isFullscreen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        transition: "opacity 300ms ease-in-out",
                        zIndex: 999
                    }}
                    onClick={() => setIsFullscreen(false)}
                />
            )}
            <div
                className="modal-content-modern"
                style={isFullscreen ? MODAL_STYLES.fullscreen : MODAL_STYLES.normal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-modal-title"
            >
                <ModalHeader
                    title={isComparison ? `House Comparison (${comparisonList.length} houses)` : node?.label}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onClose={handleClose}
                    showComparisonButton={!isComparison && nodeIsHouse}
                    isInComparison={isInComparison}
                    onToggleComparison={() =>
                        isInComparison
                            ? removeFromComparison(node.id)
                            : toggleHouseInComparison(node)
                    }

                />
                
                {isComparison ? (
                    <div>
                        <ComparisonSection 
                            comparisonList={comparisonList}
                            onRemoveFromComparison={removeFromComparison}
                        />
                        {comparisonList.length > 0 && (
                            <ComparisonTimeSeriesViz 
                                comparisonList={comparisonList}
                                isFullscreen={isFullscreen}
                            />
                        )}
                    </div>
                ) : null}
                
                {/* Basic Node Information (Single Node Mode) */}
                {!isComparison && node && (
                <div>
                    <NodeInfoSection node={node} />
                    <Suspense fallback={<div>Loading visualizations…</div>}>
                        {nodeIsTransformer && <TransformerViz node={node} />}
                        {nodeIsHouse && <HouseEnergyViz node={node} />}
                    </Suspense>
                </div>
                )}
            </div>
        </>
    );
});

InfoModal.displayName = "InfoModal";

export default InfoModal;
