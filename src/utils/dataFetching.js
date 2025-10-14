import { supabase } from '../lib/supabase';

// Base data fetching function with common error handling
export const fetchData = async (query, errorContext = 'data') => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err.message || `Failed to fetch ${errorContext}` 
    };
  }
};

// Fetch monthly data for a house
export const fetchMonthlyData = async (houseId) => {
  if (!houseId) return { data: null, error: null };
  
  return fetchData(
    supabase
      .from('house_monthly_metric_avg_compact')
      .select('*')
      .eq('house_id', houseId),
    'monthly data'
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
    'daily data'
  );
};

// Fetch time series data with date range and limits
export const fetchTimeSeriesData = async (tableName, options = {}) => {
  const {
    houseId,
    columns = '*',
    startDate,
    endDate,
    limit = 500,
    orderBy = 'timestamp',
    ascending = true
  } = options;

  let query = supabase
    .from(tableName)
    .select(columns)
    .order(orderBy, { ascending });

  if (houseId) {
    query = query.eq('house_id', houseId);
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

  return fetchData(query, `${tableName} time series data`);
};

// Fetch first timestamp from a table (for date range calculations)
export const fetchFirstTimestamp = async (tableName) => {
  return fetchData(
    supabase
      .from(tableName)
      .select('timestamp')
      .order('timestamp', { ascending: true })
      .limit(1)
      .single(),
    'first timestamp'
  );
};

// Fetch multiple house data in batch
export const fetchMultipleHousesData = async (tableName, houseIds, metric = null) => {
  if (!houseIds?.length) return { data: [], error: null };

  let query = supabase
    .from(tableName)
    .select('*')
    .in('house_id', houseIds);

  if (metric) {
    query = query.eq('metric', metric);
  }

  return fetchData(query, `multiple houses data from ${tableName}`);
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