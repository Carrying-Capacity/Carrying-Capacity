import { supabase } from '../lib/supabase';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Base data fetching function with common error handling and caching
export const fetchData = async (query, errorContext = 'data', cacheKey = null) => {
  // Check cache if key is provided
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return { data: cached.data, error: null };
    }
  }

  try {
    const { data, error } = await query;
    if (error) throw error;

    // Update cache if key is provided
    if (cacheKey) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || `Failed to fetch ${errorContext}`,
        code: err.code || 'UNKNOWN_ERROR',
        status: err.status
      }
    };
  }
};

// Central helper to determine house id column by table
export const getHouseIdColumnForTable = (tableName) => {
  return tableName === 'towndatamarch_1_2' ? 'House_id' : 'house_id';
};

// Fetch monthly data for a house
export const fetchMonthlyData = async (houseId) => {
  if (!houseId) return { data: null, error: null };

  return fetchData(
    supabase
      .from('house_monthly_metric_avg_compact')
      .select('*')
      .eq('house_id', houseId),
    'monthly data',
    `monthly_${houseId}`
  );
};

// Fetch daily/30-minute data for a house  
export const fetchDailyData = async (houseId) => {
  if (!houseId) return { data: null, error: null };

  return fetchData(
    supabase
      .from('house_30min_metric_avg_compact')
      .select('*')
      .eq('house_id', houseId),
    'daily data',
    `daily_${houseId}`
  );
};

// Fetch time series data with date range and limits
export const fetchTimeSeriesData = async (tableName, options = {}) => {
  const {
    houseId,
    houseIds,
    columns = '*',
    startDate,
    endDate,
    limit = 500,
    orderBy = 'timestamp',
    ascending = true,
    filters = {}
  } = options;

  // Determine correct house id column per table
  const houseIdColumn = getHouseIdColumnForTable(tableName);

  let query = supabase
    .from(tableName)
    .select(columns)
    .order(orderBy, { ascending });

  // Handle single house ID
  if (houseId) {
    query = query.eq(houseIdColumn, houseId);
  }

  // Handle multiple house IDs
  if (houseIds && houseIds.length > 0) {
    query = query.in(houseIdColumn, houseIds);
  }

  // Handle additional filters
  if (filters.house_id?.in) {
    query = query.in(houseIdColumn, filters.house_id.in);
  }

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }

  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  if (limit) {
    query = query.limit(limit);
  }

  // Generate a unique cache key based on options
  const cacheKey = `timeseries_${tableName}_${JSON.stringify(options)}`;
  return fetchData(query, `${tableName} time series data`, cacheKey);
};


// Fetch multiple house data in batch
export const fetchMultipleHousesData = async (tableName, houseIds, metric = null) => {
  if (!houseIds?.length) return { data: [], error: null };

  // Determine correct house id column per table
  const houseIdColumn = getHouseIdColumnForTable(tableName);

  let query = supabase
    .from(tableName)
    .select('*')
    .in(houseIdColumn, houseIds);

  if (metric) {
    query = query.eq('metric', metric);
  }

  const cacheKey = `multiple_${tableName}_${houseIds.join(',')}_${metric || 'all'}`;
  return fetchData(query, `multiple houses data from ${tableName}`, cacheKey);
};

// Fetch house IDs by transformer ID
export const fetchHousesByTransformer = async (transformerId) => {
  if (!transformerId) return { data: [], error: null };

  return fetchData(
    supabase
      .from('towndatamarch_1_2')
      .select('House_id')
      .eq('Transformer_id', transformerId),
    'houses by transformer',
    `houses_transformer_${transformerId}`
  );
};

// Generic query builder for complex queries
export const buildQuery = (tableName) => {
  return {
    select: (columns = '*') => supabase.from(tableName).select(columns),
    filters: {
      eq: (column, value) => (query) => query.eq(column, value),
      in: (column, values) => (query) => query.in(column, values),
      gte: (column, value) => (query) => query.gte(column, value),
      lte: (column, value) => (query) => query.lte(column, value),
      range: (column, start, end) => (query) => query.gte(column, start).lte(column, end)
    },
    order: (column, ascending = true) => (query) => query.order(column, { ascending }),
    limit: (count) => (query) => query.limit(count)
  };
};