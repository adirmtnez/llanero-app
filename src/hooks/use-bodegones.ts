"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface Bodegon {
  id: string
  name: string
  address: string | null
  phone_number: string
  is_active: boolean
  logo_url: string | null
}

const mockBodegones: Bodegon[] = [
  {
    id: "1",
    name: "Bodegón Central",
    address: "Av. Principal #123",
    phone_number: "+1234567890",
    is_active: true,
    logo_url: null
  },
  {
    id: "2", 
    name: "Minimarket El Arepazo",
    address: "Calle Segunda #456",
    phone_number: "+1234567891",
    is_active: true,
    logo_url: null
  },
  {
    id: "3",
    name: "Bodegón Los Hermanos",
    address: "Carrera 10 #789",
    phone_number: "+1234567892",
    is_active: false,
    logo_url: null
  },
  {
    id: "4",
    name: "Supermercado La Esquina",
    address: "Plaza Central #101",
    phone_number: "+1234567893",
    is_active: true,
    logo_url: null
  }
]

export function useBodegones() {
  const [bodegones, setBodegones] = useState<Bodegon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBodegones = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Use mock data if Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 500))
        setBodegones(mockBodegones)
        return
      }

      // Fetch from Supabase
      const { data, error: supabaseError } = await supabase
        .from('bodegons')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map Supabase data to our interface
      const mappedBodegones: Bodegon[] = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name || '',
        address: item.address || null,
        phone_number: item.phone_number || '',
        is_active: item.is_active !== false,
        logo_url: item.logo_url || null
      }))

      setBodegones(mappedBodegones)
    } catch (err: any) {
      console.error('Error fetching bodegones:', err)
      setError(err.message || 'Error al cargar bodegones')
      
      // Fallback to mock data on error
      setBodegones(mockBodegones)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load bodegones on component mount
  useEffect(() => {
    fetchBodegones()
  }, [fetchBodegones])

  const refreshBodegones = () => {
    fetchBodegones()
  }

  return {
    bodegones,
    loading,
    error,
    refreshBodegones,
    isConfigured: isSupabaseConfigured()
  }
}