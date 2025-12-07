import { apiClient } from './client'
import type { StarWarsEntity, StarWarsSearchResponse, StarWarsCategory } from '@/types/starwars.types'

export const starWarsApi = {

  async searchEntities(category: StarWarsCategory, query: string): Promise<StarWarsEntity[]> {
    try {
      const response = await apiClient.get<{ data: StarWarsSearchResponse }>(`/starwars/${category}`, {
        params: { limit: 1000 },
      })
      const allItems = response.data.data.data
      return allItems.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    } catch (error) {
      console.error(`Error searching Star Wars ${category}:`, error)
      throw new Error(`Falha ao buscar ${category}`)
    }
  },

  async getEntities(category: StarWarsCategory, page: number = 1, limit: number = 10): Promise<StarWarsSearchResponse> {
    try {
      const response = await apiClient.get<{ data: StarWarsSearchResponse }>(`/starwars/${category}`, {
        params: { page, limit },
      })
      return response.data.data
    } catch (error) {
      console.error(`Error fetching Star Wars ${category}:`, error)
      throw new Error(`Falha ao buscar lista de ${category}`)
    }
  },

  async getEntity(category: StarWarsCategory, id: string): Promise<StarWarsEntity> {
    try {
      const response = await apiClient.get<{ data: StarWarsEntity }>(`/starwars/${category}/${id}`)
      return response.data.data
    } catch (error) {
      console.error(`Error fetching Star Wars ${category} entity:`, error)
      throw new Error('Falha ao buscar item')
    }
  },
}

