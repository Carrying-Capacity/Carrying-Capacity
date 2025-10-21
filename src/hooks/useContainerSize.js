import { useState, useEffect, useRef } from 'react';

export const useContainerSize = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({     
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return [containerRef, dimensions];
};
