import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/graphUtils.js';
import { ANIMATION_CONFIG } from '../constants/index.js';

export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useCallback(
    debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, ANIMATION_CONFIG.debounceDelay),
    []
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return dimensions;
}