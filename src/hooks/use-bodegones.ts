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
  created_by?: string
  created_at?: string
  updated_at?: string
  created_date?: string
  modified_date?: string
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
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Map Supabase data to our interface
      const mappedBodegones: Bodegon[] = (data || []).map(item => ({
        id: item.id, // Keep as-is, don't convert
        name: item.name || '',
        address: item.address ?? null,
        phone_number: item.phone_number || '',
        is_active: item.is_active !== false,
        logo_url: item.logo_url ?? null,
        created_date: item.created_date,
        modified_date: item.modified_date
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

  const createBodegon = async (bodegonData: {
    name: string
    address?: string | null
    phone_number: string
    is_active?: boolean
    logo_url?: string | null
  }) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock creation
        const now = new Date().toISOString()
        const newBodegon: Bodegon = {
          ...bodegonData,
          id: Math.random().toString(),
          is_active: bodegonData.is_active !== false,
          created_by: "mock-user-id",
          created_at: now,
          updated_at: now,
          created_date: now,
          modified_date: now
        }
        setBodegones(prev => [...prev, newBodegon])
        return { data: newBodegon, error: null }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Create in Supabase with created_by and timestamps
      const now = new Date()
      const { data, error: supabaseError } = await supabase
        .from('bodegons')
        .insert({
          ...bodegonData,
          created_by: user.id,
          created_date: now,
          modified_date: now
        })
        .select()
        .single()

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Map to our interface
      console.log('📝 Raw data from Supabase:', data)
      console.log('📝 data.id:', data.id, 'Type:', typeof data.id)
      
      const newBodegon: Bodegon = {
        id: data.id, // Keep as-is, don't convert
        name: data.name || '',
        address: data.address || null,
        phone_number: data.phone_number || '',
        is_active: data.is_active !== false,
        logo_url: data.logo_url || null,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_date: data.created_date,
        modified_date: data.modified_date
      }
      
      console.log('📝 Mapped bodegon:', newBodegon)

      // Update local state
      setBodegones(prev => [...prev, newBodegon])
      
      return { data: newBodegon, error: null }
    } catch (err: any) {
      console.error('Error creating bodegon:', err)
      const errorMessage = err.message || 'Error al crear bodegón'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateBodegon = async (id: string, updates: {
    name?: string
    address?: string | null
    phone_number?: string
    is_active?: boolean
    logo_url?: string | null
  }) => {
    console.log('🔄 updateBodegon called with:', { id, updates })
    
    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        console.log('📝 Using mock update for bodegon')
        // Mock update
        setBodegones(prev => prev.map(bodegon => 
          bodegon.id === id 
            ? { ...bodegon, ...updates, modified_date: new Date().toISOString() }
            : bodegon
        ))
        return { success: true, error: null }
      }

      console.log('🔄 Updating bodegon in Supabase with ID:', id, 'Type:', typeof id)
      const { data, error: supabaseError } = await supabase
        .from('bodegons')
        .update({
          ...updates,
          modified_date: new Date()
        })
        .eq('id', id) // Use as string since it's UUID
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Supabase update error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      console.log('✅ Supabase update successful:', data)

      // Update local state
      setBodegones(prev => prev.map(bodegon => 
        bodegon.id === id 
          ? {
              id: data.id,
              name: data.name || '',
              address: data.address || null,
              phone_number: data.phone_number || '',
              is_active: data.is_active !== false,
              logo_url: data.logo_url || null,
              created_by: data.created_by,
              created_at: data.created_at,
              updated_at: data.updated_at,
              created_date: data.created_date,
              modified_date: data.modified_date
            }
          : bodegon
      ))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error updating bodegon:', err)
      const errorMessage = err.message || 'Error al actualizar bodegón'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteBodegon = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock deletion
        setBodegones(prev => prev.filter(bodegon => bodegon.id !== id))
        return { success: true, error: null }
      }

      const { error: supabaseError } = await supabase
        .from('bodegons')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      // Update local state
      setBodegones(prev => prev.filter(bodegon => bodegon.id !== id))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error deleting bodegon:', err)
      const errorMessage = err.message || 'Error al eliminar bodegón'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    bodegones,
    loading,
    error,
    refreshBodegones,
    createBodegon,
    updateBodegon,
    deleteBodegon,
    isConfigured: isSupabaseConfigured()
  }
}