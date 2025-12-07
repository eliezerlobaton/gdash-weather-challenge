import axios from 'axios'
import { apiClient } from './client'

const API_URL = import.meta.env.VITE_API_URL

export interface User {
  id: string
  name: string
  email: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<any>(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const data = response.data.data || response.data
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Falha no login')
      }
      throw new Error('Erro inesperado ao tentar fazer login')
    }
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post<any>(`${API_URL}/users`, {
        name,
        email,
        password,
      })
      const data = response.data.data || response.data
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message
        if (Array.isArray(message)) {
          throw new Error(message.join(', '))
        }
        throw new Error(message || 'Falha no cadastro')
      }
      throw new Error('Erro inesperado ao tentar cadastrar')
    }
  },

  deleteAccount: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Falha ao deletar conta')
      }
      throw new Error('Erro inesperado ao tentar deletar conta')
    }
  },
}
