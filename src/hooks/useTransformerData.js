import { useMemo } from 'react';
import { loadTransformerData } from '../utils/loadTransformer.js';

// Global cache to prevent reprocessing data
let cachedData = null;
let cacheVersion = 0;

export function useTransformerData() {
  return useMemo(() => {
    if (!cachedData) {
      console.log('Loading and caching transformer data...');
      cachedData = loadTransformerData();
      cacheVersion++;
    }
    return cachedData;
  }, []);
}

// Function to clear cache if needed (for development/testing)
export function clearDataCache() {
  cachedData = null;
  cacheVersion++;
}

// Get cache status for debugging
export function getCacheInfo() {
  return {
    isCached: !!cachedData,
    version: cacheVersion,
    nodeCount: cachedData?.nodes?.length || 0,
    linkCount: cachedData?.links?.length || 0
  };
}