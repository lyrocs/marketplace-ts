'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client/react'
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
  refetch: () => Promise<any>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)
  const [fetchMe, { data: meData }] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me)
    }
  }, [meData])

  // On mount, check if token exists and fetch user
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nextrade_token') : null
    if (token) {
      fetchMe().catch(() => {
        // Token might be invalid, clear it
        localStorage.removeItem('nextrade_token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [fetchMe])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginMutation({ variables: { email, password } })
    if (data?.login) {
      localStorage.setItem('nextrade_token', data.login.accessToken)
      setUser(data.login.user)
      setLoading(false)
    }
  }, [loginMutation])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await registerMutation({ variables: { name, email, password } })
    if (data?.register) {
      localStorage.setItem('nextrade_token', data.register.accessToken)
      setUser(data.register.user)
      setLoading(false)
    }
  }, [registerMutation])

  const logout = useCallback(() => {
    localStorage.removeItem('nextrade_token')
    setUser(null)
  }, [])

  const refetch = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nextrade_token') : null
    if (token) {
      const result = await fetchMe()
      setLoading(false)
      return result
    }
  }, [fetchMe])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refetch,
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
