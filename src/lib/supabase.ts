import { createClient } from '@supabase/supabase-js'

// Configuración del cliente público (para usar en componentes del cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cliente público (para usar en componentes del cliente)
// Si no están configuradas las variables, se creará un cliente dummy
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Cliente administrativo (solo para usar en API routes y servidor)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error(
      'La variable de entorno SUPABASE_SERVICE_ROLE_KEY es requerida para operaciones administrativas'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Función para verificar si Supabase está configurado (segura para cliente)
export function isSupabaseConfigured(): boolean {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return !!(
      url && 
      key &&
      url !== 'https://placeholder.supabase.co' &&
      key !== 'placeholder-anon-key'
    )
  } catch {
    return false
  }
}

// Función para verificar configuración completa (solo funciona en servidor)
export function isSupabaseFullyConfigured(): boolean {
  try {
    // En el cliente, solo podemos verificar las variables públicas
    if (typeof window !== 'undefined') {
      return isSupabaseConfigured()
    }
    
    // En el servidor, verificamos todas las variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    return !!(
      url && 
      anonKey &&
      serviceKey &&
      url !== 'https://placeholder.supabase.co' &&
      anonKey !== 'placeholder-anon-key' &&
      serviceKey !== 'placeholder-service-key'
    )
  } catch {
    return false
  }
}