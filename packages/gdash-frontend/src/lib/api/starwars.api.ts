import axios from 'axios'
import type { StarWarsEntity, StarWarsSearchResponse, StarWarsCategory } from '@/types/starwars.types'

const SWAPI_URL = import.meta.env.VITE_STARWARS_API_URL

const swapiClient = axios.create({
  baseURL: SWAPI_URL,
  timeout: 10000,
})

export const starWarsApi = {

  async searchEntities(category: StarWarsCategory, query: string): Promise<StarWarsEntity[]> {
    try {
      const response = await swapiClient.get<StarWarsSearchResponse>(`/${category}`, {
        params: { limit: 1000 },
      })
      const allItems = response.data.data
      return allItems.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    } catch (error) {
      console.error(`Error searching Star Wars ${category}:`, error)
      throw new Error(`Falha ao buscar ${category}`)
    }
  },

  async getEntities(category: StarWarsCategory, page: number = 1, limit: number = 10): Promise<StarWarsSearchResponse> {
    try {
      const response = await swapiClient.get<StarWarsSearchResponse>(`/${category}`, {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching Star Wars ${category}:`, error)
      throw new Error(`Falha ao buscar lista de ${category}`)
    }
  },

  async getEntity(category: StarWarsCategory, id: string): Promise<StarWarsEntity> {
    try {
      const response = await swapiClient.get<StarWarsEntity>(`/${category}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching Star Wars ${category} entity:`, error)
      throw new Error('Falha ao buscar item')
    }
  },
}
