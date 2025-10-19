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
    houseIds,
    columns = '*',
    startDate,
    endDate,
    limit = 500,
    orderBy = 'timestamp',
    ascending = true,
    filters = {}
  } = options;

  // Use House_id for towndatamarch_1_2 table, house_id for others
  const houseIdColumn = tableName === 'towndatamarch_1_2' ? 'House_id' : 'house_id';
  
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

  return fetchData(query, `${tableName} time series data`);
};


// Fetch multiple house data in batch
export const fetchMultipleHousesData = async (tableName, houseIds, metric = null) => {
  if (!houseIds?.length) return { data: [], error: null };

  // Use House_id for towndatamarch_1_2 table, house_id for others
  const houseIdColumn = tableName === 'towndatamarch_1_2' ? 'House_id' : 'house_id';

  let query = supabase
    .from(tableName)
    .select('*')
    .in(houseIdColumn, houseIds);

  if (metric) {
    query = query.eq('metric', metric);
  }

  return fetchData(query, `multiple houses data from ${tableName}`);
};

