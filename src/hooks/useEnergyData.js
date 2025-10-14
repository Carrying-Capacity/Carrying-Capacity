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
          ascending: true,
          limit: houseIds.length * 288 // 5-min intervals for 24 hours = 288 per house
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

// Utility to convert UTC to AEST (UTC+10, or UTC+11 during daylight saving)
export const convertToAEST = (utcTimestamp) => {
  const utcDate = new Date(utcTimestamp)
  // AEST is UTC+10, AEDT is UTC+11 during daylight saving (Oct-Apr)
  const aestOffset = 10 * 60 // 10 hours in minutes
  const aestTime = new Date(utcDate.getTime() + (aestOffset * 60 * 1000))
  return aestTime
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
  
  // Convert all timestamps to AEST and find the target date
  const aestData = rawData.map(row => {
    const aestTime = convertToAEST(row.timestamp)
    return {
      ...row,
      aestTime,
      aestDate: aestTime.toDateString()
    }
  })
  
  // Find the most common date in AEST (should be our target date)
  const dateCounts = aestData.reduce((acc, row) => {
    acc[row.aestDate] = (acc[row.aestDate] || 0) + 1
    return acc
  }, {})
  
  const targetDate = Object.keys(dateCounts).reduce((a, b) => 
    dateCounts[a] > dateCounts[b] ? a : b
  )
  
  // Filter to only include data from the target date in AEST
  const filteredData = aestData.filter(row => row.aestDate === targetDate)
  
  // Group data by timestamp for the target date
  const dataByTimestamp = filteredData.reduce((acc, row) => {
    const aestTime = row.aestTime
    
    // Create a consistent time key using just hours and minutes (HH:MM)
    const hours = aestTime.getHours().toString().padStart(2, '0')
    const minutes = aestTime.getMinutes().toString().padStart(2, '0')
    const timeKey = `${hours}:${minutes}`
    
    if (!acc[timeKey]) {
      acc[timeKey] = { 
        timestamp: aestTime.toISOString(),
        time: timeKey,
        fullDateTime: aestTime,
        sortOrder: aestTime.getHours() * 60 + aestTime.getMinutes(), // For consistent sorting
        targetDate: targetDate // Store the target date for reference
      }
    }
    
    // Add data for each property in the category for this house
    propertiesToInclude.forEach(property => {
      const key = `${row.House_id}_${property}`
      acc[timeKey][key] = row[property] || 0
    })
    
    return acc
  }, {})
  
  // Convert to array and sort by time (starting from 00:00 AEST)
  const result = Object.values(dataByTimestamp).sort((a, b) => a.sortOrder - b.sortOrder)
  
  // Add the target date to the result for reference
  if (result.length > 0) {
    result.targetDate = targetDate
  }
  
  return result
}
