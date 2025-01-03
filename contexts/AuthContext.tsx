"use client"

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

// Tip tanımlamaları
interface User {
  id: number
  email: string
  username: string
  role: string
  total_play_count?: number
  total_score?: number
  created_at?: string
}

interface AuthResponse {
  user: User | null
}

interface AuthError {
  message: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

// Context oluşturma
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth verilerini getiren fonksiyon
const fetchAuthData = async (url: string): Promise<AuthResponse> => {
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
}

// Auth Provider bileşeni
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  
  // SWR ile auth durumunu yönetme
  const { data, error, isLoading, mutate } = useSWR('/api/auth', fetchAuthData)

  // Giriş işlemi
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Giriş yapılamadı')
      }

      // Token'ın yerleşmesini ve kullanıcı verilerinin güncellenmesini bekle
      await mutate()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Ana sayfaya yönlendir
      router.push('/')
      router.refresh()
    } catch (error) {
      const authError = error as Error
      throw new Error(authError.message)
    }
  }, [router, mutate])

  // Kayıt işlemi
  const register = useCallback(async (username: string, email: string, password: string) => {
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

      // Token'ın yerleşmesini ve kullanıcı verilerinin güncellenmesini bekle
      await mutate()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Ana sayfaya yönlendir
      router.push('/')
      router.refresh()
    } catch (error) {
      const authError = error as Error
      throw new Error(authError.message)
    }
  }, [router, mutate])

  // Çıkış işlemi
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      
      if (!response.ok) {
        throw new Error('Çıkış yapılırken bir hata oluştu')
      }

      // Kullanıcı verilerini temizle ve ana sayfaya yönlendir
      await mutate({ user: null }, false) 
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router, mutate])

  // Kullanıcı verilerini yenileme
  const refreshUser = useCallback(async () => {
    await mutate()
  }, [mutate])

  // Context değerlerini hazırla
  const contextValue: AuthContextType = {
    user: data?.user ?? null,
    isLoading,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}