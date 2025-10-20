import { useEffect } from 'react';

export const useClickOutside = (refs, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = refs.every(
        ref => ref.current && !ref.current.contains(event.target)
      );

      if (clickedOutside) {
        handler();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [refs, handler]);
};
