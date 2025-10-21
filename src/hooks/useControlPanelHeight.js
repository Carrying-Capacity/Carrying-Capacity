import { useState, useEffect } from 'react';

const OBSERVER_CONFIG = {
  childList: true,
  subtree: true,
  attributes: true,
};

const setupControlPanelObserver = (callback) => {
  const controlPanel = document.querySelector('.modern-control-panel');
  if (!controlPanel) return null;

  const observer = new MutationObserver(callback);
  observer.observe(controlPanel, OBSERVER_CONFIG);
  return observer;
};

export const useControlPanelHeight = () => {
  const [height, setHeight] = useState(132);

  useEffect(() => {
    const updateHeight = () => {
      const controlPanel = document.querySelector('.modern-control-panel');
      if (controlPanel) {
        setHeight(controlPanel.getBoundingClientRect().bottom);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    const observer = setupControlPanelObserver(updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer?.disconnect();
    };
  }, []);

  return height;
};

export const useModalPosition = () => {
  useEffect(() => {
    const updatePosition = () => {
      const controlPanel = document.querySelector('.modern-control-panel');
      if (controlPanel) {
        const offset = controlPanel.getBoundingClientRect().bottom + 20;
        document.documentElement.style.setProperty('--modal-top', `${offset}px`);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    const observer = setupControlPanelObserver(updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      observer?.disconnect();
      document.documentElement.style.removeProperty('--modal-top');
    };
  }, []);
};
