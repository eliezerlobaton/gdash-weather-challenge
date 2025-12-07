import { createContext } from 'react'
import { type User, type AuthResponse } from '@/types/api.types'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<AuthResponse>
  deleteAccount: () => Promise<void>
  logout: () => void
  isLoading: boolean
  loading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
