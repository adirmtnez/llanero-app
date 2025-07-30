"use client"

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

interface Session {
  user: User
  access_token: string
}

interface AuthError {
  message: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock authentication - auto login after delay
    const timer = setTimeout(() => {
      const mockUser: User = {
        id: "mock-user-id",
        email: "admin@llanero.app",
        user_metadata: {
          full_name: "Admin Usuario",
          name: "Admin Usuario"
        }
      }
      
      const mockSession: Session = {
        user: mockUser,
        access_token: "mock-access-token"
      }
      
      setUser(mockUser)
      setSession(mockSession)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: Math.random().toString(),
        email: email,
        user_metadata: {
          full_name: name,
          name: name
        }
      }

      const mockSession: Session = {
        user: mockUser,
        access_token: "mock-access-token"
      }

      setUser(mockUser)
      setSession(mockSession)

      return { user: mockUser, error: null }
    } catch (error) {
      return { user: null, error: { message: 'Error en registro mock' } as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "mock-user-id",
        email: email,
        user_metadata: {
          full_name: "Admin Usuario",
          name: "Admin Usuario"
        }
      }

      const mockSession: Session = {
        user: mockUser,
        access_token: "mock-access-token"
      }

      setUser(mockUser)
      setSession(mockSession)

      return { user: mockUser, error: null }
    } catch (error) {
      return { user: null, error: { message: 'Error en login mock' } as AuthError }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "mock-google-user-id",
        email: "user@gmail.com",
        user_metadata: {
          full_name: "Usuario Google",
          name: "Usuario Google"
        }
      }

      const mockSession: Session = {
        user: mockUser,
        access_token: "mock-google-access-token"
      }

      setUser(mockUser) 
      setSession(mockSession)

      return { error: null }
    } catch (error) {
      return { error: { message: 'Error en login con Google mock' } as AuthError }
    }
  }

  const signOut = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUser(null)
      setSession(null)

      return { error: null }
    } catch (error) {
      return { error: { message: 'Error en logout mock' } as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Mock: Reset password for email:', email)

      return { error: null }
    } catch (error) {
      return { error: { message: 'Error en reset password mock' } as AuthError }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}