"use client"

import { createContext, useContext, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

interface User {
  id: number
  email: string
  username: string
  total_play_count?: number
  total_score?: number
  created_at?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const { data, error, isLoading, mutate } = useSWR('/api/auth', async (url) => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        return { user: null }
      }
      
      return { user: data.data.user }
    } catch (error) {
      return { user: null }
    }
  })

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Giriş başarısız')
      }

      await mutate() // Auth durumunu güncelle
      router.push('/')
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Kayıt başarısız')
      }

      await mutate() // Auth durumunu güncelle
      router.push('/')
    } catch (error) {
      throw error
    }
  }

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      
      if (!response.ok) {
        throw new Error('Çıkış yapılırken bir hata oluştu')
      }

      await mutate({ user: null }, false) 
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router, mutate])

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return (
    <AuthContext.Provider value={{ 
      user: data?.user ?? null, 
      isLoading, 
      login, 
      register, 
      logout,
      refreshUser
    }}>
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