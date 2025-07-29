"use client"

import { useState, useEffect } from "react"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { createClient } from "@supabase/supabase-js"

export interface Bodegon {
  id: string
  name: string
  address: string | null
  phone_number: string
  is_active: boolean
  logo_url: string | null
}

export function useBodegones() {
  const { config, isConfigValid } = useSupabaseConfig()
  const [bodegones, setBodegones] = useState<Bodegon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBodegones = async () => {
    if (!isConfigValid || !config.serviceKey) {
      setError("Configuración de Supabase incompleta")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'apikey': config.serviceKey,
            'Authorization': `Bearer ${config.serviceKey}`
          }
        }
      })

      console.log('Intentando obtener bodegones...')
      
      // Intentar diferentes enfoques para verificar la tabla
      console.log('Probando acceso a tabla bodegons...')
      
      // Opción 1: Consulta básica
      let { data, error: fetchError } = await supabase
        .from('bodegons')
        .select('*')

      console.log('Opción 1 - select *:', { data, error: fetchError })

      // Si falla, intentar con esquema explícito
      if (fetchError) {
        console.log('Probando con esquema public explícito...')
        const result2 = await supabase
          .from('public.bodegons')
          .select('*')
        
        console.log('Opción 2 - public.bodegons:', result2)
        
        // Si sigue fallando, intentar solo contar
        if (result2.error) {
          console.log('Probando solo contar registros...')
          const result3 = await supabase
            .from('bodegons')
            .select('id', { count: 'exact' })
          
          console.log('Opción 3 - count:', result3)
        } else {
          data = result2.data
          fetchError = result2.error
        }
      }

      if (fetchError) {
        console.error('Error específico:', JSON.stringify(fetchError, null, 2))
        throw fetchError
      }

      setBodegones(data || [])
    } catch (err: any) {
      console.error('Error fetching bodegones:', err)
      setError(err.message || 'Error al cargar bodegones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar bodegones al montar el componente
  useEffect(() => {
    fetchBodegones()
  }, [isConfigValid, config.serviceKey])

  const refreshBodegones = () => {
    fetchBodegones()
  }

  return {
    bodegones,
    loading,
    error,
    refreshBodegones,
    isConfigured: isConfigValid && !!config.serviceKey
  }
}