export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
  }
}