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
  const [initialized, setInitialized] = useState(false)

  // Only log during development and reduce noise
  if (process.env.NODE_ENV === 'development' && !initialized) {
    console.log('AuthProvider initializing:', { user: user?.email, loading, isConfigured })
  }

  useEffect(() => {
    // Prevent re-initialization if already initialized
    if (initialized) return

    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      if (isConfigured) {
        // Supabase mode
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('AuthProvider: Initializing Supabase auth...')
          }
          
          // Get current session first to avoid delays
          const currentUser = await getCurrentUser()
          if (process.env.NODE_ENV === 'development') {
            console.log('AuthProvider: Initial user check:', currentUser ? currentUser.email : 'no user')
          }
          
          // Set initial state
          setUser(currentUser)
          setLoading(false)
          setInitialized(true)
          
          // Set up auth state listener for ongoing changes
          unsubscribe = onAuthStateChange((user) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Auth state changed:', user ? user.email : 'logged out')
            }
            setUser(user)
          })
          
        } catch (error) {
          console.error('Error initializing auth:', error)
          setUser(null)
          setLoading(false)
          setInitialized(true)
        }
      } else {
        // Mock mode
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider: Using mock mode')
        }
        setTimeout(() => {
          const mockUser: AuthUser = {
            id: "mock-user-id",
            email: "admin@llanero.app",
            full_name: "Admin Usuario"
          }
          setUser(mockUser)
          setLoading(false)
          setInitialized(true)
        }, 500) // Reduced from 1000ms to 500ms for faster mock auth
      }
    }

    initAuth()

    return () => {
      if (unsubscribe) {
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider: Cleaning up auth state listener')
        }
        unsubscribe()
      }
    }
  }, [isConfigured, initialized])

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