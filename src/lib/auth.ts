import { supabase } from "./supabase"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  email_confirmed_at?: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: Error | null
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!supabase) {
      return { user: null, error: new Error("Supabase no está configurado") }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error("No se pudo autenticar al usuario") }
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: data.user.user_metadata?.full_name,
      email_confirmed_at: data.user.email_confirmed_at
    }

    console.log('User signed in successfully:', user)
    return { user, error: null }
  } catch (error: any) {
    console.error('Error in signIn:', error)
    return { user: null, error }
  }
}

/**
 * Sign up with email, password and metadata
 */
export async function signUp(
  email: string, 
  password: string, 
  metadata?: { full_name?: string }
): Promise<AuthResponse> {
  try {
    if (!supabase) {
      return { user: null, error: new Error("Supabase no está configurado") }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: metadata || {}
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      return { user: null, error }
    }

    if (!data.user) {
      return { user: null, error: new Error("No se pudo crear la cuenta") }
    }

    // Create user record in users table
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: metadata?.full_name || '',
          phone_number: '', // Empty as requested
          is_active: true,
          role: 1, // Default role
          document_number: '', // Empty as requested
          document_type: '', // Empty as requested
          assigned_restaurants: [], // Empty array as requested
          cart_items: [] // Empty array as requested
        })

      if (insertError) {
        console.error('Error creating user record:', insertError)
        // Don't fail the signup if user record creation fails
        // The auth user was created successfully
      } else {
        console.log('User record created successfully in users table')
      }
    } catch (userRecordError) {
      console.error('Unexpected error creating user record:', userRecordError)
      // Continue with successful auth signup
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: data.user.user_metadata?.full_name,
      email_confirmed_at: data.user.email_confirmed_at
    }

    console.log('User signed up successfully:', user)
    return { user, error: null }
  } catch (error: any) {
    console.error('Error in signUp:', error)
    return { user: null, error }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    if (!supabase) {
      return { error: new Error("Supabase no está configurado") }
    }

    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Supabase signout error:', error)
      return { error }
    }

    console.log('User signed out successfully')
    return { error: null }
  } catch (error: any) {
    console.error('Error in signOut:', error)
    return { error }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    if (!supabase) {
      console.log('getCurrentUser: Supabase not configured')
      return null
    }

    // First check if we have a session in localStorage
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('getCurrentUser: Session check:', session ? `session exists for ${session.user?.email}` : 'no session')
    
    if (sessionError) {
      console.error('getCurrentUser: Session error:', sessionError)
      return null
    }

    // If we have a session, use that user directly
    if (session?.user) {
      console.log('getCurrentUser: Using session user:', session.user.email)
      return {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name,
        email_confirmed_at: session.user.email_confirmed_at
      }
    }

    // Fallback to getUser if no session (shouldn't normally happen)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('getCurrentUser: Error getting user:', error)
      return null
    }
    
    if (!user) {
      console.log('getCurrentUser: No user found')
      return null
    }

    console.log('getCurrentUser: User found via getUser:', user.email)
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      email_confirmed_at: user.email_confirmed_at
    }
  } catch (error: any) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    if (!supabase) {
      return { error: new Error("Supabase no está configurado") }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      console.error('Password reset error:', error)
      return { error }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error in resetPassword:', error)
    return { error }
  }
}

/**
 * Sign in with Google (OAuth)
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    if (!supabase) {
      return { error: new Error("Supabase no está configurado") }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    })
    
    if (error) {
      console.error('Google auth error:', error)
      return { error }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Error in signInWithGoogle:', error)
    return { error }
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  if (!supabase) {
    return () => {}
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name,
        email_confirmed_at: session.user.email_confirmed_at
      }
      callback(user)
    } else {
      callback(null)
    }
  })

  return () => subscription?.unsubscribe()
}