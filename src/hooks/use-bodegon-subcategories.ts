"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface BodegonSubcategory {
  id: string
  name: string
  parent_category: string
  is_active: boolean
  created_by?: string
  created_date?: string
  modified_date?: string
  image?: string | null
}

const mockSubcategories: BodegonSubcategory[] = [
  {
    id: "1",
    name: "Salsas Picantes",
    parent_category: "1", // Salsas category
    is_active: true,
    image: null
  },
  {
    id: "2",
    name: "Salsas Dulces",
    parent_category: "1", // Salsas category
    is_active: true,
    image: null
  },
  {
    id: "3",
    name: "Combo Familiar",
    parent_category: "2", // Familia category
    is_active: true,
    image: null
  },
]

export function useBodegonSubcategories() {
  const [subcategories, setSubcategories] = useState<BodegonSubcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubcategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Use mock data if Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 500))
        setSubcategories(mockSubcategories)
        return
      }

      // Fetch from Supabase
      const { data, error: supabaseError } = await supabase
        .from('bodegon_subcategories')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map Supabase data to our interface
      const mappedSubcategories: BodegonSubcategory[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        parent_category: item.parent_category || '',
        is_active: item.is_active !== false,
        created_by: item.created_by,
        created_date: item.created_date,
        modified_date: item.modified_date,
        image: item.image || null
      }))

      setSubcategories(mappedSubcategories)
    } catch (err: any) {
      console.error('Error fetching bodegon subcategories:', err)
      setError(err.message || 'Error al cargar subcategorías')
      
      // Fallback to mock data on error
      setSubcategories(mockSubcategories)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load subcategories on component mount
  useEffect(() => {
    fetchSubcategories()
  }, [fetchSubcategories])

  const refreshSubcategories = () => {
    fetchSubcategories()
  }

  const createSubcategory = async (subcategoryData: {
    name: string
    parent_category: string
    image?: string | null
    is_active?: boolean
  }) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock creation
        const now = new Date().toISOString()
        const newSubcategory: BodegonSubcategory = {
          ...subcategoryData,
          id: Math.random().toString(),
          is_active: subcategoryData.is_active !== false,
          created_by: "mock-user-id",
          created_date: now,
          modified_date: now
        }
        setSubcategories(prev => [...prev, newSubcategory])
        return { data: newSubcategory, error: null }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Create in Supabase with created_by and timestamps
      const now = new Date()
      const { data, error: supabaseError } = await supabase
        .from('bodegon_subcategories')
        .insert({
          ...subcategoryData,
          created_by: user.id,
          created_date: now,
          modified_date: now
        })
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map to our interface
      console.log('📝 Raw bodegon subcategory data from Supabase:', data)
      
      const newSubcategory: BodegonSubcategory = {
        id: data.id,
        name: data.name || '',
        parent_category: data.parent_category || '',
        is_active: data.is_active !== false,
        created_by: data.created_by,
        created_date: data.created_date,
        modified_date: data.modified_date,
        image: data.image || null
      }
      
      console.log('📝 Mapped bodegon subcategory:', newSubcategory)

      // Update local state
      setSubcategories(prev => [...prev, newSubcategory])
      
      return { data: newSubcategory, error: null }
    } catch (err: any) {
      console.error('Error creating bodegon subcategory:', err)
      const errorMessage = err.message || 'Error al crear subcategoría'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateSubcategory = async (id: string, updates: {
    name?: string
    parent_category?: string
    image?: string | null
    is_active?: boolean
  }) => {
    console.log('🔄 updateBodegonSubcategory called with:', { id, updates })
    
    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        console.log('📝 Using mock update for bodegon subcategory')
        // Mock update
        setSubcategories(prev => prev.map(subcategory => 
          subcategory.id === id 
            ? { ...subcategory, ...updates, modified_date: new Date().toISOString() }
            : subcategory
        ))
        return { success: true, error: null }
      }

      console.log('🔄 Updating bodegon subcategory in Supabase with ID:', id)
      const { data, error: supabaseError } = await supabase
        .from('bodegon_subcategories')
        .update({
          ...updates,
          modified_date: new Date()
        })
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Supabase bodegon subcategory update error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      console.log('✅ Supabase bodegon subcategory update successful:', data)

      // Update local state
      setSubcategories(prev => prev.map(subcategory => 
        subcategory.id === id 
          ? {
              id: data.id,
              name: data.name || '',
              parent_category: data.parent_category || '',
              is_active: data.is_active !== false,
              created_by: data.created_by,
              created_date: data.created_date,
              modified_date: data.modified_date,
              image: data.image || null
            }
          : subcategory
      ))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error updating bodegon subcategory:', err)
      const errorMessage = err.message || 'Error al actualizar subcategoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteSubcategory = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock deletion
        setSubcategories(prev => prev.filter(subcategory => subcategory.id !== id))
        return { success: true, error: null }
      }

      const { error: supabaseError } = await supabase
        .from('bodegon_subcategories')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Update local state
      setSubcategories(prev => prev.filter(subcategory => subcategory.id !== id))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error deleting bodegon subcategory:', err)
      const errorMessage = err.message || 'Error al eliminar subcategoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    subcategories,
    loading,
    error,
    refreshSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    isConfigured: isSupabaseConfigured()
  }
}