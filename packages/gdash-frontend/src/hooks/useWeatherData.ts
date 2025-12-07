import { useState, useEffect, useCallback } from 'react'
import { weatherApi } from '@/lib/api/weather.api'
import type {
  WeatherLog,
  WeatherFiltersParams,
} from '@/types/weather.types'

interface UseWeatherDataReturn {
  data: WeatherLog[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useWeatherData(
  filters: WeatherFiltersParams = {}
): UseWeatherDataReturn {
  const [data, setData] = useState<WeatherLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const currentPage = filters.page || page
      const response = await weatherApi.getLogs({ ...filters, page: currentPage })

      setData(response.data)
      setTotal(response.total)
      setPage(response.page)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('useWeatherData Error:', err)
      if (import.meta.env.DEV) {
        console.warn('Weather API unavailable. Using mock data.')
        const mockData: WeatherLog[] = Array.from({ length: 10 }).map((_, i) => ({
          _id: `mock-${i}`,
          city: 'Recife',
          country: 'Brazil',
          temperature: 25 + Math.random() * 5,
          humidity: 60 + Math.random() * 20,
          windSpeed: 10 + Math.random() * 10,
          condition: 'Sunny',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }))
        setData(mockData)
        setTotal(100)
        setPage(1)
        setTotalPages(10)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      }
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    total,
    page,
    totalPages,
    loading,
    error,
    refetch: fetchData,
  }
}
