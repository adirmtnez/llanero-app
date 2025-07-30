"use client"

import { useState, useEffect, useCallback } from "react"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBodegones = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setBodegones(mockBodegones)
    } catch (err: any) {
      console.error('Error fetching bodegones:', err)
      setError(err.message || 'Error al cargar bodegones')
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
    isConfigured: true // Always configured in mock mode
  }
}