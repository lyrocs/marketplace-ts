'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { LOGIN_MUTATION, REGISTER_MUTATION, ME_QUERY } from '../graphql/queries'

interface AuthUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)
  const { data: meData, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: typeof window !== 'undefined' && !localStorage.getItem('nextrade_token'),
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me)
    }
    setLoading(false)
  }, [meData])

  // On mount, check if token exists
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nextrade_token') : null
    if (!token) {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginMutation({ variables: { email, password } })
    if (data?.login) {
      localStorage.setItem('nextrade_token', data.login.accessToken)
      setUser(data.login.user)
      await refetchMe()
    }
  }, [loginMutation, refetchMe])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await registerMutation({ variables: { name, email, password } })
    if (data?.register) {
      localStorage.setItem('nextrade_token', data.register.accessToken)
      setUser(data.register.user)
      await refetchMe()
    }
  }, [registerMutation, refetchMe])

  const logout = useCallback(() => {
    localStorage.removeItem('nextrade_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
