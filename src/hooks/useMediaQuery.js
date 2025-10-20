import { useState, useEffect } from 'react';

export const useMediaQuery = (breakpoint = 768) => {
  const [matches, setMatches] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => setMatches(window.innerWidth <= breakpoint);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return matches;
};
