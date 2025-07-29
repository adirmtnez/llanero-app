"use client"

import { useState, useEffect } from "react"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { createClient } from "@supabase/supabase-js"

export interface Restaurant {
  id: string
  name: string
  phone_number: string
  logo_url: string | null
  cover_image: string | null
  delivery_available?: boolean
  pickup_available?: boolean
  opening_hours?: string
  is_active?: boolean
}

export function useRestaurants() {
  const { config, isConfigValid } = useSupabaseConfig()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = async () => {
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

      console.log('Intentando obtener restaurantes...')
      
      // Intentar diferentes enfoques para verificar la tabla
      console.log('Probando acceso a tabla restaurants...')
      
      // Opción 1: Consulta básica
      let { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')

      console.log('Opción 1 - select *:', { data, error: fetchError })

      // Si falla, intentar con esquema explícito
      if (fetchError) {
        console.log('Probando con esquema public explícito...')
        const result2 = await supabase
          .from('public.restaurants')
          .select('*')
        
        console.log('Opción 2 - public.restaurants:', result2)
        
        // Si sigue fallando, intentar solo contar
        if (result2.error) {
          console.log('Probando solo contar registros...')
          const result3 = await supabase
            .from('restaurants')
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

      setRestaurants(data || [])
    } catch (err: any) {
      console.error('Error fetching restaurants:', err)
      setError(err.message || 'Error al cargar restaurantes')
    } finally {
      setLoading(false)
    }
  }

  // Cargar restaurantes al montar el componente
  useEffect(() => {
    fetchRestaurants()
  }, [isConfigValid, config.serviceKey])

  const refreshRestaurants = () => {
    fetchRestaurants()
  }

  return {
    restaurants,
    loading,
    error,
    refreshRestaurants,
    isConfigured: isConfigValid && !!config.serviceKey
  }
}