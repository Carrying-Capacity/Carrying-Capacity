import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const comparisonIdSet = useMemo(
    () => new Set(comparisonList.map(h => h.id)),
    [comparisonList]
  );

  const toggleHouseInComparison = useCallback((node) => {
    if (node.type === "house") {
      setComparisonList(prev => {
        const isInList = prev.some(house => house.id === node.id);
        return isInList
          ? prev.filter(house => house.id !== node.id)
          : [...prev, node];
      });
    }
  }, []);

  const removeFromComparison = useCallback((nodeId) => {
    setComparisonList(prev => prev.filter(house => house.id !== nodeId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonList([]);
    setShowComparison(false);
  }, []);

  const toggleComparisonModal = useCallback(() => {
    if (comparisonList.length > 0) {
      setShowComparison(prev => !prev);
    }
  }, [comparisonList.length]);

  const value = useMemo(() => ({
    comparisonList,
    comparisonIdSet,
    showComparison,
    toggleHouseInComparison,
    removeFromComparison,
    clearComparison,
    toggleComparisonModal,
    setShowComparison,
  }), [
    comparisonList,
    comparisonIdSet,
    showComparison,
    toggleHouseInComparison,
    removeFromComparison,
    clearComparison,
    toggleComparisonModal,
  ]);

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};
