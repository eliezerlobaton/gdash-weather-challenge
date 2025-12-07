import { isAxiosError } from 'axios'
import { handleApiError, apiClient } from './client'
import type { LoginResponse, AuthResponse } from '@/types/api.types'

export interface User {
  id: string
  name: string
  email: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', {
        email,
        password,
      })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>('/users', {
        name,
        email,
        password,
      })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  deleteAccount: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}`)
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Falha ao deletar conta')
      }
      throw new Error('Erro inesperado ao tentar deletar conta')
    }
  },
}
