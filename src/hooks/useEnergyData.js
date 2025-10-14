import { useState, useEffect } from 'react'
import { fetchMonthlyData, fetchDailyData, fetchTimeSeriesData } from '../utils/dataFetching.js'

// Hook to fetch monthly data for a specific house
export const useMonthlyData = (houseId) => {
  const [monthlyData, setMonthlyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMonthlyData = async () => {
      if (!houseId) return
      
      setLoading(true)
      const { data, error } = await fetchMonthlyData(houseId)
      
      setMonthlyData(data)
      setError(error)
      setLoading(false)
    }

    loadMonthlyData()
  }, [houseId])

  return { monthlyData, loading, error }
}

// Hook to fetch 30-minute daily data for a specific house
export const useDailyData = (houseId) => {
  const [dailyData, setDailyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDailyData = async () => {
      if (!houseId) return
      
      setLoading(true)
      const { data, error } = await fetchDailyData(houseId)
      
      setDailyData(data)
      setError(error)
      setLoading(false)
    }

    loadDailyData()
  }, [houseId])

  return { dailyData, loading, error }
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
        // Only fetch data for the specific houses in the comparison list
        const { data, error } = await fetchTimeSeriesData('towndatamarch_1_2', {
          columns: 'timestamp, House_id, "Voltage.PhA", "Voltage.PhB", "Voltage.PhC", ImportPower, ExportPower, InductivePower, CapacitivePower',
          houseIds: houseIds,
          orderBy: 'timestamp',
          ascending: true
        })

        if (error) {
          setError(error)
          setTimeSeriesData([])
        } else {
          setTimeSeriesData(data || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch time series data')
        setTimeSeriesData([])
      } finally {
        setLoading(false)
      }
    }

    loadTimeSeriesData()
  }, [JSON.stringify(houseIds)]) // Use JSON.stringify to properly detect array changes

  return { timeSeriesData, loading, error }
}


// Property category mappings
const PROPERTY_MAPPINGS = {
  voltage: ['Voltage.PhA', 'Voltage.PhB', 'Voltage.PhC'],
  realPower: ['ImportPower', 'ExportPower'],
  reactivePower: ['InductivePower', 'CapacitivePower']
};

// Transform time series data for comparison charts
export const transformTimeSeriesData = (rawData, selectedCategory) => {
  if (!rawData?.length || !selectedCategory) return []

  // Get actual properties from category
  const propertiesToInclude = PROPERTY_MAPPINGS[selectedCategory] || []
  if (!propertiesToInclude.length) return []

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
      acc[timeKey][key] = row[property] || 0
    })

    return acc
  }, {})

  // Convert to array and sort by timestamp
  const result = Object.values(dataByTimestamp).sort((a, b) => a.sortOrder - b.sortOrder)

  return result
}
