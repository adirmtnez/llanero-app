"use client"

import { useState, useEffect, useCallback } from "react"
import { Category, Subcategory, ProductType } from "@/types/products"

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Bebidas",
    description: "Refrescos, jugos y bebidas en general",
    type: "bodegon",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Snacks",
    description: "Papas, galletas y aperitivos",
    type: "bodegon",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Lácteos",
    description: "Leche, quesos y derivados",
    type: "bodegon",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockSubcategories: Subcategory[] = [
  {
    id: "1",
    name: "Refrescos",
    description: "Coca-Cola, Pepsi, etc.",
    parent_category_id: "1",
    type: "bodegon",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Jugos Naturales",
    description: "Jugos de frutas naturales",
    parent_category_id: "1",
    type: "bodegon",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function useCategories(productType: ProductType) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      setCategories(mockCategories)
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setError(err.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [productType])

  const loadSubcategories = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Filter subcategories by category if provided
      const filteredSubcategories = categoryId 
        ? mockSubcategories.filter(sub => sub.parent_category_id === categoryId)
        : mockSubcategories
      
      setSubcategories(filteredSubcategories)
    } catch (err: any) {
      console.error('Error loading subcategories:', err)
      setError(err.message || 'Error al cargar subcategorías')
    } finally {
      setLoading(false)
    }
  }, [productType])

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock creation - just add to local state
      const newCategory: Category = {
        ...categoryData,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err: any) {
      console.error('Error creating category:', err)
      setError(err.message || 'Error al crear categoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createSubcategory = async (subcategoryData: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock creation - just add to local state
      const newSubcategory: Subcategory = {
        ...subcategoryData,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setSubcategories(prev => [...prev, newSubcategory])
      return newSubcategory
    } catch (err: any) {
      console.error('Error creating subcategory:', err)
      setError(err.message || 'Error al crear subcategoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [productType, loadCategories])

  return {
    categories,
    subcategories,
    loading,
    error,
    loadCategories,
    loadSubcategories,
    createCategory,
    createSubcategory
  }
}