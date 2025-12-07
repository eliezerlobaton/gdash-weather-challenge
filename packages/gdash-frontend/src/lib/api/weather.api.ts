import { apiClient, handleApiError } from './client'
import type {
  WeatherLog,
  WeatherFiltersParams,
  WeatherInsights,
  PaginatedResponse,
  RawWeatherLog,
  RawWeatherInsights,
  ApiResponse,
} from '@/types/weather.types'

export const weatherApi = {

  async getLogs(
    params: WeatherFiltersParams = {}
  ): Promise<PaginatedResponse<WeatherLog>> {
    try {
      const response = await apiClient.get<ApiResponse<RawWeatherLog[]>>(
        '/weather/logs',
        { params }
      )

      const rawData = response.data

      // Handle NestJS TransformInterceptor wrapping
      // The response might be { data: { data: [], meta: {} }, statusCode: ... }
      // Or just { data: [], meta: {} } if interceptor is disabled
      const apiResponse = (rawData as { data?: { data?: unknown } }).data?.data ? (rawData as { data: unknown }).data : rawData

      // Type guard or assertion
      const safeApiResponse = apiResponse as { data: RawWeatherLog[], meta?: { total: number, page: number, limit: number, totalPages: number } }
      const logs = (Array.isArray(safeApiResponse.data) ? safeApiResponse.data : []).map((log: RawWeatherLog) => {
        try {
          let city = 'Unknown'
          let country = ''

          if (typeof log.location === 'string') {
            const parts = log.location.split(',').map((s: string) => s.trim())
            city = parts[0] || 'Unknown'
            country = parts[1] || ''
          } else if (log.location && typeof log.location === 'object') {
            city = log.location.city || 'Unknown'
            country = log.location.country || ''
          }

          const current = log.current || {}

          return {
            _id: log._id,
            city: city,
            country: country,
            temperature: parseFloat(String(current.temperature ?? log.temperature ?? 0)),
            humidity: parseFloat(String(current.humidity ?? log.humidity ?? 0)),
            windSpeed: parseFloat(String(current.wind_speed ?? log.windSpeed ?? 0)),
            condition: log.condition_classification ?? log.condition ?? 'Unknown',
            timestamp: log.timestamp,
            createdAt: log.createdAt
          }
        } catch (err) {
          console.error('Error mapping log:', log, err)
          return null
        }
      }).filter((log: WeatherLog | null): log is WeatherLog => log !== null)

      return {
        data: logs,
        total: safeApiResponse.meta?.total || logs.length,
        page: safeApiResponse.meta?.page || params.page || 1,
        limit: safeApiResponse.meta?.limit || params.limit || 10,
        totalPages: safeApiResponse.meta?.totalPages || 1
      }
    } catch (error) {
      console.error('getLogs Error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Busca insights estatísticos
   */
  async getInsights(params?: WeatherFiltersParams): Promise<WeatherInsights> {
    try {
      const response = await apiClient.get<ApiResponse<RawWeatherInsights>>(
        '/weather/insights',
        { params }
      )
      const backendData = response.data.data

      return {
        summary: backendData.ai?.textualSummary || 'Resumo não disponível',
        temperatureTrends: backendData.ai?.forecast || 'Tendência não disponível',
        recommendations: backendData.ai?.recommendations || [],
        statistics: {
          averageTemperature: backendData.averageTemperature,
          maxTemperature: backendData.maxTemperature?.value ?? 0,
          minTemperature: backendData.minTemperature?.value ?? 0,
          averageHumidity: backendData.averageHumidity,
          mostCommonCondition: backendData.mostFrequentCondition,
          citiesCount: backendData.citiesCount,
          totalLogs: backendData.totalRecords
        },
        generatedAt: backendData.generatedAt,
        modelUsed: backendData.ai?.model || 'unknown'
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },


  async exportCSV(params?: WeatherFiltersParams): Promise<Blob> {
    try {
      const response = await apiClient.get('/weather/export.csv', {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error: unknown) { // Use unknown for caught errors
      throw new Error(handleApiError(error))
    }
  },


  async exportXLSX(params?: WeatherFiltersParams): Promise<Blob> {
    try {
      const response = await apiClient.get('/weather/export.xlsx', {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },


  async refreshInsights(): Promise<WeatherInsights> {
    try {
      const response = await apiClient.get<ApiResponse<RawWeatherInsights>>(
        '/weather/insights/refresh'
      )
      const backendData = response.data.data

      return {
        summary: backendData.ai?.textualSummary || 'Resumo não disponível',
        temperatureTrends: backendData.ai?.forecast || 'Tendência não disponível',
        recommendations: backendData.ai?.recommendations || [],
        statistics: {
          averageTemperature: backendData.averageTemperature,
          maxTemperature: backendData.maxTemperature?.value ?? 0,
          minTemperature: backendData.minTemperature?.value ?? 0,
          averageHumidity: backendData.averageHumidity,
          mostCommonCondition: backendData.mostFrequentCondition,
          citiesCount: backendData.citiesCount,
          totalLogs: backendData.totalRecords
        },
        generatedAt: backendData.generatedAt,
        modelUsed: backendData.ai?.model || 'unknown'
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
