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

  return {
    restaurants,
    loading,
    error,
    refreshRestaurants,
    isConfigured: isSupabaseConfigured()
  }
}