import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Hook to fetch monthly data for a specific house
export const useMonthlyData = (houseId) => {
  const [monthlyData, setMonthlyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!houseId) return
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('house_monthly_metric_avg_compact')
          .select('*')
          .eq('house_id', houseId)

        if (error) throw error
        setMonthlyData(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching monthly data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [houseId])

  return { monthlyData, loading, error }
}

// Hook to fetch 30-minute daily data for a specific house
export const useDailyData = (houseId) => {
  const [dailyData, setDailyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDailyData = async () => {
      if (!houseId) return
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('house_30min_metric_avg_compact')
          .select('*')
          .eq('house_id', houseId)

        if (error) throw error
        setDailyData(data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching daily data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyData()
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