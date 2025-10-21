import { useState, useEffect, useMemo } from 'react'
import { fetchMonthlyData, fetchDailyData, fetchTimeSeriesData } from '../utils/dataFetching.js'

/**
 * Generic hook for data fetching with loading and error states
 * @param {Function} fetchFn - Async function to fetch data (should be memoized or stable)
 * @param {any} dependency - Dependency to trigger refetch
 * @param {string} dataKey - Key name for returned data
 * @returns {Object} Data, loading, and error states
 */
const useDataFetch = (fetchFn, dependency, dataKey = 'data') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dependency) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await fetchFn(dependency)
        
        if (!cancelled) {
          setData(result.data)
          setError(result.error)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setData(null)
          setError(err.message || 'Failed to fetch data')
          setLoading(false)
        }
      }
    }

    loadData()
    return () => { cancelled = true }
    // Note: fetchFn must be a stable reference (module-level function or memoized with useCallback)
    // to avoid infinite re-renders. Current usage with fetchMonthlyData and fetchDailyData is safe.
  }, [dependency, fetchFn])

  return { [dataKey]: data, loading, error }
}

// Hook to fetch monthly data for a specific house
export const useMonthlyData = (houseId) => {
  return useDataFetch(fetchMonthlyData, houseId, 'monthlyData')
}

// Hook to fetch 30-minute daily data for a specific house
export const useDailyData = (houseId) => {
  return useDataFetch(fetchDailyData, houseId, 'dailyData')
}

// Utility functions to transform data for charts
export const transformMonthlyData = (rawData, metrics) => {
  if (!rawData || !metrics?.length) return []

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1
    const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
    
    const dataPoint = { month: monthName, monthIndex }
    
    metrics.forEach(metric => {
      const metricData = rawData.find(d => d.metric === metric)
      const columnName = `month_${monthIndex.toString().padStart(2, '0')}`
      dataPoint[metric] = metricData?.[columnName] || 0
    })
    
    return dataPoint
  })

  return months
}

export const transformDailyData = (rawData, metrics) => {
  if (!rawData || !metrics?.length) return []

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    const columnName = `slot_${hour.toString().padStart(2, '0')}_${minute.toString().padStart(2, '0')}`
    
    const dataPoint = { time: timeLabel, slotIndex: i }
    
    metrics.forEach(metric => {
      const metricData = rawData.find(d => d.metric === metric)
      dataPoint[metric] = metricData?.[columnName] || 0
    })
    
    return dataPoint
  })

  return timeSlots
}

// Hook to fetch time series data from towndatamarch_1_2 table for specific houses only
export const useTimeSeriesData = (houseIds = []) => {
  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Create stable reference for houseIds array
  const houseIdsKey = useMemo(() => 
    houseIds?.length ? houseIds.slice().sort().join(',') : '',
    [houseIds]
  );

  useEffect(() => {
    const loadTimeSeriesData = async () => {
      if (!houseIds?.length) {
        setTimeSeriesData([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await fetchTimeSeriesData('towndatamarch_1_2', {
          columns: 'timestamp, House_id, "Voltage.PhA", "Voltage.PhB", "Voltage.PhC", ImportPower, ExportPower, InductivePower, CapacitivePower',
          houseIds: houseIds,
          orderBy: 'timestamp',
          ascending: true
        })

        if (error) {
          setError(error)
        } else {
          setTimeSeriesData(data || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch time series data')
      } finally {
        setLoading(false)
      }
    }

    loadTimeSeriesData()
  }, [houseIdsKey])

  return { timeSeriesData, loading, error }
}


// Property category mappings
const PROPERTY_MAPPINGS = {
  voltage: ['Voltage.PhA', 'Voltage.PhB', 'Voltage.PhC'],
  realPower: ['ImportPower', 'ExportPower'],
  reactivePower: ['InductivePower', 'CapacitivePower']
};

// Transform time series data for comparison charts
export const transformTimeSeriesData = (rawData, selectedCategory, comparisonList = []) => {
  if (!rawData?.length || !selectedCategory) return []

  // Get actual properties from category
  const propertiesToInclude = PROPERTY_MAPPINGS[selectedCategory] || []
  if (!propertiesToInclude.length) return []

  // Create a map of house phases for quick lookup
  const housePhaseMap = comparisonList.reduce((map, house) => {
    if (house.HouseID && house.predicted_phase) {
      map[house.HouseID] = {
        phase: house.predicted_phase,
        isThreePhase: Array.isArray(house.predicted_phase) && house.predicted_phase.length > 1
      }
    }
    return map
  }, {})

  // Group data by timestamp using a +10 hour offset (AEST-like)
  const dataByTimestamp = rawData.reduce((acc, row) => {
    const timestamp = new Date(row.timestamp)
    const offsetTimestamp = new Date(timestamp.getTime() + (10 * 60 * 60 * 1000))
    const timeKey = offsetTimestamp.toISOString()

    if (!acc[timeKey]) {
      acc[timeKey] = {
        timestamp: offsetTimestamp.toISOString(),
        time: offsetTimestamp.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        }),
        fullDateTime: offsetTimestamp,
        sortOrder: offsetTimestamp.getTime() // Use offset timestamp for sorting
      }
    }

    // Add data for each property in the category for this house
    propertiesToInclude.forEach(property => {
      const key = `${row.House_id}_${property}`
      let value = row[property] || 0
      
      // For voltage data, handle phase renaming
      if (selectedCategory === 'voltage') {
        const houseInfo = housePhaseMap[row.House_id]
        
        if (houseInfo) {
          if (houseInfo.isThreePhase) {
            // 3-phase customer - rename all phases according to phase order
            const phaseOrder = houseInfo.phase // e.g., ['B', 'C', 'A']
            const phaseMap = {
              'Voltage.PhA': `Voltage.Ph${phaseOrder[0]}`,
              'Voltage.PhB': `Voltage.Ph${phaseOrder[1]}`,
              'Voltage.PhC': `Voltage.Ph${phaseOrder[2]}`
            }
            
            if (phaseMap[property]) {
              const renamedKey = `${row.House_id}_${phaseMap[property]}`
              acc[timeKey][renamedKey] = value
              return // Skip adding the original key
            }
          } else {
            // Single-phase customer
            const singlePhase = Array.isArray(houseInfo.phase) ? houseInfo.phase[0] : houseInfo.phase
            
            if (property === 'Voltage.PhA') {
              // Check if this is a single-phase customer (only PhA has data, PhB and PhC are zero)
              const phBValue = row['Voltage.PhB'] || 0
              const phCValue = row['Voltage.PhC'] || 0
              
              if (phBValue === 0 && phCValue === 0) {
                // Single-phase customer - rename PhA to match assigned phase
                const renamedKey = `${row.House_id}_Voltage.Ph${singlePhase}`
                acc[timeKey][renamedKey] = value
                return // Skip adding the original PhA key
              }
            }
            
            // For single-phase, skip PhB and PhC (they will be zero)
            if (property === 'Voltage.PhB' || property === 'Voltage.PhC') {
              return
            }
          }
        }
      }
      
      acc[timeKey][key] = value
    })

    return acc
  }, {})

  // Convert to array and sort by timestamp
  const result = Object.values(dataByTimestamp).sort((a, b) => a.sortOrder - b.sortOrder)


  return result
}
