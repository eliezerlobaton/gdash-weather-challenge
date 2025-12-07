import axios, { AxiosError, type AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Interceptor para adicionar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // console.log('Attaching token to request:', `Bearer ${token.substring(0, 10)}...`)
    } else {
      console.warn('No token found in localStorage for request:', config.url)
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Ignore mock token
      if (localStorage.getItem('auth_token') === 'mock-jwt-token') {
        return Promise.reject(error)
      }

      // Token expirado - limpar e redirecionar
      console.warn('401 Unauthorized detected. Redirecting to login.')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    return message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Erro desconhecido'
}
