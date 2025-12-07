import { useState, useEffect, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth.api'
import { type User, type LoginResponse } from '@/types/api.types'
import { toast } from 'sonner'
import { AuthContext } from './auth-context-refs'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  useEffect(() => {
  }, [])

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await authApi.login(email, password)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao realizar login'
      toast.error(message)
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
        isLoading: loginMutation.isPending,
        loading: loginMutation.isPending,
        error: loginMutation.error ? (loginMutation.error as Error).message : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
