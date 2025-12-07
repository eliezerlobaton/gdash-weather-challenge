export interface WeatherLog {
  _id: string
  city: string
  country: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  timestamp: string
  createdAt: string
}

export interface WeatherFiltersParams {
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface WeatherInsights {
  summary: string
  temperatureTrends: string
  recommendations: string[]

  statistics: {
    totalLogs: number
    averageTemperature: number
    maxTemperature: number
    minTemperature: number
    averageHumidity: number
    mostCommonCondition: string
    citiesCount: number
  }

  generatedAt: string
  modelUsed: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RawWeatherLog {
  _id: string
  location: string | { city?: string; country?: string }
  temperature?: number
  humidity?: number
  windSpeed?: number
  condition?: string
  condition_classification?: string
  timestamp: string
  createdAt: string
  current?: {
    temperature?: number
    humidity?: number
    wind_speed?: number
  }
}

export interface RawWeatherInsights {
  ai?: {
    textualSummary?: string
    forecast?: string
    recommendations?: string[]
    model?: string
  }
  averageTemperature: number
  maxTemperature?: { value: number }
  minTemperature?: { value: number }
  averageHumidity: number
  mostFrequentCondition: string
  citiesCount: number
  totalRecords: number
  generatedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}
