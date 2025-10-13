import { useState, useEffect } from 'react'
import { fetchMonthlyData, fetchDailyData } from '../utils/dataFetching.js'

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
