"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signIn as supabaseSignIn, 
  signUp as supabaseSignUp, 
  signOut as supabaseSignOut,
  getCurrentUser,
  resetPassword as supabaseResetPassword,
  signInWithGoogle as supabaseSignInWithGoogle,
  onAuthStateChange,
  AuthUser
} from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'

interface AuthError {
  message: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ user: AuthUser | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured] = useState(() => isSupabaseConfigured())

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      if (isConfigured) {
        // Supabase mode
        try {
          // Get current user
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          
          // Listen to auth changes
          unsubscribe = onAuthStateChange((user) => {
            setUser(user)
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      } else {
        // Mock mode
        setTimeout(() => {
          const mockUser: AuthUser = {
            id: "mock-user-id",
            email: "admin@llanero.app",
            full_name: "Admin Usuario"
          }
          setUser(mockUser)
        }, 1000)
      }
      
      setLoading(false)
    }

    initAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [isConfigured])

  const signUp = async (email: string, password: string, name: string) => {
    if (isConfigured) {
      // Supabase mode
      const result = await supabaseSignUp(email, password, { full_name: name })
      if (result.user) {
        setUser(result.user)
      }
      return {
        user: result.user,
        error: result.error ? { message: result.error.message } : null
      }
    } else {
      // Mock mode
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockUser: AuthUser = {
          id: Math.random().toString(),
          email: email,
          full_name: name
        }
        setUser(mockUser)
        return { user: mockUser, error: null }
      } catch (error) {
        return { user: null, error: { message: 'Error en registro mock' } }
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isConfigured) {
      // Supabase mode
      const result = await supabaseSignIn(email, password)
      if (result.user) {
        setUser(result.user)
      }
      return {
        user: result.user,
        error: result.error ? { message: result.error.message } : null
      }
    } else {
      // Mock mode
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockUser: AuthUser = {
          id: "mock-user-id",
          email: email,
          full_name: "Admin Usuario"
        }
        setUser(mockUser)
        return { user: mockUser, error: null }
      } catch (error) {
        return { user: null, error: { message: 'Error en login mock' } }
      }
    }
  }

  const signInWithGoogle = async () => {
    if (isConfigured) {
      // Supabase mode
      const result = await supabaseSignInWithGoogle()
      return {
        error: result.error ? { message: result.error.message } : null
      }
    } else {
      // Mock mode
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockUser: AuthUser = {
          id: "mock-google-user-id",
          email: "user@gmail.com",
          full_name: "Usuario Google"
        }
        setUser(mockUser)
        return { error: null }
      } catch (error) {
        return { error: { message: 'Error en login con Google mock' } }
      }
    }
  }

  const signOut = async () => {
    if (isConfigured) {
      // Supabase mode
      const result = await supabaseSignOut()
      if (!result.error) {
        setUser(null)
      }
      return {
        error: result.error ? { message: result.error.message } : null
      }
    } else {
      // Mock mode
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setUser(null)
        return { error: null }
      } catch (error) {
        return { error: { message: 'Error en logout mock' } }
      }
    }
  }

  const resetPassword = async (email: string) => {
    if (isConfigured) {
      // Supabase mode
      const result = await supabaseResetPassword(email)
      return {
        error: result.error ? { message: result.error.message } : null
      }
    } else {
      // Mock mode
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Mock: Reset password for email:', email)
        return { error: null }
      } catch (error) {
        return { error: { message: 'Error en reset password mock' } }
      }
    }
  }

  const value = {
    user,
    loading,
    isConfigured,
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