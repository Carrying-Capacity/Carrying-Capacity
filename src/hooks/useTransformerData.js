import { useMemo } from 'react';
import { loadTransformerData } from '../utils/loadTransformer.js';

// Global cache to prevent reprocessing data
let cachedData = null;

export function useTransformerData() {
  return useMemo(() => {
    if (!cachedData) {
      cachedData = loadTransformerData();
    }
    return cachedData;
  }, []);
}