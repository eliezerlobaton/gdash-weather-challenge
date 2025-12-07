import { useState, useCallback } from 'react'
import type { WeatherFiltersParams } from '@/types/weather.types'

interface UseWeatherFiltersReturn {
  filters: WeatherFiltersParams
  setFilter: <K extends keyof WeatherFiltersParams>(
    key: K,
    value: WeatherFiltersParams[K]
  ) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

const initialFilters: WeatherFiltersParams = {
  city: undefined,
  country: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  limit: 10,
}

export function useWeatherFilters(): UseWeatherFiltersReturn {
  const [filters, setFilters] = useState<WeatherFiltersParams>(initialFilters)

  const setFilter = useCallback(
    <K extends keyof WeatherFiltersParams>(
      key: K,
      value: WeatherFiltersParams[K]
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? (value as number) : 1,
      }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const hasActiveFilters =
    !!filters.city ||
    !!filters.country ||
    !!filters.startDate ||
    !!filters.endDate

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  }
}
