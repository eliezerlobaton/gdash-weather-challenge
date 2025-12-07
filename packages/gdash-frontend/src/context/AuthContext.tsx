import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi, type User, type LoginResponse } from '@/lib/api/auth.api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<User>
  deleteAccount: () => Promise<void>
  logout: () => void
  isLoading: boolean
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsInitializing(false)
  }, [])

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      return await authApi.login(email, password)
    },
    onSuccess: (data: LoginResponse) => {
      setToken(data.access_token)
      setUser(data.user)
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    },
  })

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register: authApi.register,
        deleteAccount: async () => {
          if (user?.id) {
            await authApi.deleteAccount(user.id)
            logout()
          }
        },
        logout,
        isLoading: loginMutation.isPending || isInitializing,
        loading: loginMutation.isPending || isInitializing,
        error: loginMutation.error ? (loginMutation.error as Error).message : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
