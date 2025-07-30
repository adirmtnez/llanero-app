"use client"

import { useState, useEffect, useCallback } from "react"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setRestaurants(mockRestaurants)
    } catch (err: any) {
      console.error('Error fetching restaurants:', err)
      setError(err.message || 'Error al cargar restaurantes')
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
    isConfigured: true // Always configured in mock mode
  }
}