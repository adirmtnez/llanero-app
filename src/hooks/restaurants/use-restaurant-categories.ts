"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface RestaurantCategory {
  id: string
  name: string
  restaurant_id: string
  image: string | null
  is_active: boolean
  created_by?: string
  created_date?: string
  modified_date?: string
}

const mockCategories: RestaurantCategory[] = [
  {
    id: "1",
    name: "Pizzas",
    restaurant_id: "1",
    image: null,
    is_active: true,
  },
  {
    id: "2", 
    name: "Hamburguesas",
    restaurant_id: "1",
    image: null,
    is_active: true,
  },
  {
    id: "3",
    name: "Postres",
    restaurant_id: "2",
    image: null,
    is_active: true,
  },
]

export function useRestaurantCategories() {
  const [categories, setCategories] = useState<RestaurantCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Use mock data if Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 500))
        setCategories(mockCategories)
        return
      }

      // Fetch from Supabase
      const { data, error: supabaseError } = await supabase
        .from('restaurant_categories')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map Supabase data to our interface
      console.log('📂 Raw restaurant categories from Supabase:', data)
      const mappedCategories: RestaurantCategory[] = (data || []).map(item => ({
        id: item.id, // Keep as-is, don't convert
        name: item.name || '',
        restaurant_id: item.restaurant_id || '',
        image: item.image || null,
        is_active: item.is_active !== false,
        created_by: item.created_by,
        created_date: item.created_date,
        modified_date: item.modified_date
      }))
      
      console.log('📂 Mapped restaurant categories:', mappedCategories.map(cat => ({
        id: cat.id,
        id_type: typeof cat.id,
        name: cat.name,
        restaurant_id: cat.restaurant_id,
        restaurant_id_type: typeof cat.restaurant_id
      })))

      setCategories(mappedCategories)
    } catch (err: any) {
      console.error('Error fetching restaurant categories:', err)
      setError(err.message || 'Error al cargar categorías')
      
      // Fallback to mock data on error
      setCategories(mockCategories)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const refreshCategories = async () => {
    console.log('🔄 Restaurant Categories - Manual refresh triggered')
    await fetchCategories()
  }

  const createCategory = async (categoryData: {
    name: string
    restaurant_id: string
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
        const newCategory: RestaurantCategory = {
          ...categoryData,
          id: Math.random().toString(),
          is_active: categoryData.is_active !== false,
          created_by: "mock-user-id",
          created_date: now,
          modified_date: now
        }
        setCategories(prev => [...prev, newCategory])
        return { data: newCategory, error: null }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Create in Supabase with created_by and timestamps
      const now = new Date()
      const { data, error: supabaseError } = await supabase
        .from('restaurant_categories')
        .insert({
          ...categoryData,
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
      console.log('📝 Raw restaurant category data from Supabase:', data)
      console.log('📝 restaurant category data.id:', data.id, 'Type:', typeof data.id)
      
      const newCategory: RestaurantCategory = {
        id: data.id, // Keep as-is, don't convert
        name: data.name || '',
        restaurant_id: data.restaurant_id || '',
        image: data.image || null,
        is_active: data.is_active !== false,
        created_by: data.created_by,
        created_date: data.created_date,
        modified_date: data.modified_date
      }
      
      console.log('📝 Mapped restaurant category:', newCategory)

      // Update local state
      setCategories(prev => [...prev, newCategory])
      
      return { data: newCategory, error: null }
    } catch (err: any) {
      console.error('Error creating restaurant category:', err)
      const errorMessage = err.message || 'Error al crear categoría'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, updates: {
    name?: string
    restaurant_id?: string
    image?: string | null
    is_active?: boolean
  }) => {
    console.log('🔄 updateRestaurantCategory called with:', { id, updates })
    
    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        console.log('📝 Using mock update for restaurant category')
        // Mock update
        setCategories(prev => prev.map(category => 
          category.id === id 
            ? { ...category, ...updates, modified_date: new Date().toISOString() }
            : category
        ))
        return { success: true, error: null }
      }

      console.log('🔄 Updating restaurant category in Supabase with ID:', id, 'Type:', typeof id)
      const { data, error: supabaseError } = await supabase
        .from('restaurant_categories')
        .update({
          ...updates,
          modified_date: new Date()
        })
        .eq('id', id) // Use as string since it's UUID
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Supabase restaurant category update error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      console.log('✅ Supabase restaurant category update successful:', data)

      // Update local state
      setCategories(prev => prev.map(category => 
        category.id === id 
          ? {
              id: data.id,
              name: data.name || '',
              restaurant_id: data.restaurant_id || '',
              image: data.image || null,
              is_active: data.is_active !== false,
              created_by: data.created_by,
              created_date: data.created_date,
              modified_date: data.modified_date
            }
          : category
      ))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error updating restaurant category:', err)
      const errorMessage = err.message || 'Error al actualizar categoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteCategory = async (id: string) => {
    console.log('🗑️ Restaurant Categories - Starting delete for ID:', id)
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      console.log('🗑️ Restaurant Categories - Supabase configured:', configured)
      
      if (!configured || !supabase) {
        console.log('🗑️ Restaurant Categories - Using mock deletion')
        // Mock deletion
        setCategories(prev => {
          const filtered = prev.filter(category => category.id !== id)
          console.log('🗑️ Restaurant Categories - Mock state updated, new count:', filtered.length)
          return filtered
        })
        return { success: true, error: null }
      }

      console.log('🗑️ Restaurant Categories - Executing Supabase delete')
      const { error: supabaseError } = await supabase
        .from('restaurant_categories')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        console.error('🗑️ Restaurant Categories - Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      console.log('🗑️ Restaurant Categories - Supabase delete successful, updating local state')
      // Update local state
      setCategories(prev => {
        const filtered = prev.filter(category => category.id !== id)
        console.log('🗑️ Restaurant Categories - Local state updated, new count:', filtered.length)
        return filtered
      })
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error deleting restaurant category:', err)
      const errorMessage = err.message || 'Error al eliminar categoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isConfigured: isSupabaseConfigured()
  }
}