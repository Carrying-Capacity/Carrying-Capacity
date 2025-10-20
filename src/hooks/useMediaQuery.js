import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport matches a breakpoint using the matchMedia API
 * @param {number} breakpoint - Maximum width in pixels (default: 768)
 * @returns {boolean} True if viewport width is less than or equal to breakpoint
 */
export const useMediaQuery = (breakpoint = 768) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Handler for media query changes
    const handleChange = (e) => {
      setMatches(e.matches);
    };
    
    // Use addEventListener for modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return matches;
};
