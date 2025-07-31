"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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
  created_by?: string
  created_at?: string
  updated_at?: string
}

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Pizza Express",
    phone_number: "+1234567890",
    logo_url: null,
    cover_image: null,
    delivery_available: true,
    pickup_available: true,
    opening_hours: "10:00-22:00",
    is_active: true
  },
  {
    id: "2", 
    name: "Burger Palace",
    phone_number: "+1234567891",
    logo_url: null,
    cover_image: null,
    delivery_available: true,
    pickup_available: false,
    opening_hours: "11:00-23:00",
    is_active: true
  },
  {
    id: "3",
    name: "Tacos El Rincón",
    phone_number: "+1234567892",
    logo_url: null,
    cover_image: null,
    delivery_available: false,
    pickup_available: true,
    opening_hours: "12:00-20:00",
    is_active: false
  }
]

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Use mock data if Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 500))
        setRestaurants(mockRestaurants)
        return
      }

      // Fetch from Supabase
      const { data, error: supabaseError } = await supabase
        .from('restaurants')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map Supabase data to our interface
      const mappedRestaurants: Restaurant[] = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name || '',
        phone_number: item.phone_number || '',
        logo_url: item.logo_url || null,
        cover_image: item.cover_image || null,
        delivery_available: item.delivery_available !== false,
        pickup_available: item.pickup_available !== false,
        opening_hours: item.opening_hours || null,
        is_active: item.is_active !== false
      }))

      setRestaurants(mappedRestaurants)
    } catch (err: any) {
      console.error('Error fetching restaurants:', err)
      setError(err.message || 'Error al cargar restaurantes')
      
      // Fallback to mock data on error
      setRestaurants(mockRestaurants)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load restaurants on component mount
  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const refreshRestaurants = () => {
    fetchRestaurants()
  }

  const createRestaurant = async (restaurantData: {
    name: string
    phone_number: string
    logo_url?: string | null
    cover_image?: string | null
    delivery_available?: boolean
    pickup_available?: boolean
    opening_hours?: string
    is_active?: boolean
  }) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock creation
        const newRestaurant: Restaurant = {
          ...restaurantData,
          id: Math.random().toString(),
          created_by: "mock-user-id",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setRestaurants(prev => [...prev, newRestaurant])
        return { data: newRestaurant, error: null }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Create in Supabase with created_by field
      const { data, error: supabaseError } = await supabase
        .from('restaurants')
        .insert({
          ...restaurantData,
          created_by: user.id
        })
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Map to our interface
      const newRestaurant: Restaurant = {
        id: data.id.toString(),
        name: data.name || '',
        phone_number: data.phone_number || '',
        logo_url: data.logo_url || null,
        cover_image: data.cover_image || null,
        delivery_available: data.delivery_available !== false,
        pickup_available: data.pickup_available !== false,
        opening_hours: data.opening_hours || null,
        is_active: data.is_active !== false,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      // Update local state
      setRestaurants(prev => [...prev, newRestaurant])
      
      return { data: newRestaurant, error: null }
    } catch (err: any) {
      console.error('Error creating restaurant:', err)
      const errorMessage = err.message || 'Error al crear restaurante'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteRestaurant = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Mock deletion
        setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id))
        return { success: true, error: null }
      }

      const { error: supabaseError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Update local state
      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id))
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error deleting restaurant:', err)
      const errorMessage = err.message || 'Error al eliminar restaurante'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    restaurants,
    loading,
    error,
    refreshRestaurants,
    createRestaurant,
    deleteRestaurant,
    isConfigured: isSupabaseConfigured()
  }
}