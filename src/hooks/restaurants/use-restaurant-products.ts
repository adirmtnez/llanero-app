"use client"

import { useState, useCallback } from "react"
import { 
  BodegonProduct, 
  ProductsFilters,
  ProductsPagination,
  ProductsResponse
} from "@/types/products"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export function useRestaurantProducts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Utility function para formatear precios
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(price)
  }

  // Obtener productos de restaurante con paginación y filtros
  const getProducts = useCallback(async (
    filters: { search?: string; restaurant_id?: string; category_id?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<ProductsResponse> => {
    try {
      setLoading(true)
      setError(null)

      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      // Build Supabase query for restaurant products
      let query = supabase
        .from('restaurant_products')
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.restaurant_id) {
        query = query.eq('restaurant_id', filters.restaurant_id)
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      query = query
        .order('created_date', { ascending: false })
        .range(from, to)

      const { data, error: queryError, count } = await query

      if (queryError) {
        console.error('Error fetching restaurant products:', queryError)
        throw new Error(queryError.message)
      }

      // Map Supabase data to our interface (adapt restaurant products to BodegonProduct interface)
      const mappedProducts: BodegonProduct[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || undefined,
        image_gallery_urls: item.image_gallery_urls || [],
        bar_code: undefined, // Restaurant products don't have bar_code
        sku: undefined, // Restaurant products don't have SKU
        category_id: item.category_id || undefined,
        subcategory_id: item.subcategory_id || undefined,
        price: item.price || 0,
        purchase_price: undefined,
        quantity_in_pack: 1,
        is_active_product: item.is_available !== false,
        is_discount: false,
        is_promo: false,
        created_by: item.created_by,
        created_at: item.created_date,
        updated_at: item.modified_date,
        // Add restaurant-specific fields
        restaurant_id: item.restaurant_id,
        product_type: 'restaurant' as const
      }))

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('restaurant_products')
        .select('*', { count: 'exact', head: true })

      const total = totalCount || 0
      const totalPages = Math.ceil(total / pagination.limit)

      return {
        products: mappedProducts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      }
    } catch (err: any) {
      console.error('Error getting restaurant products:', err)
      setError(err.message || 'Error al obtener productos de restaurante')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener un producto de restaurante por ID
  const getProductById = useCallback(async (id: string): Promise<BodegonProduct | null> => {
    try {
      setLoading(true)
      setError(null)

      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🔍 Searching for restaurant product in Supabase with ID:', id)

      const { data: restaurantProduct, error: restaurantError } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('id', id)
        .single()

      if (restaurantProduct && !restaurantError) {
        console.log('✅ Found restaurant product:', restaurantProduct)
        console.log('🔍 Restaurant product category details:', {
          category_id: restaurantProduct.category_id,
          category_id_type: typeof restaurantProduct.category_id,
          subcategory_id: restaurantProduct.subcategory_id,
          subcategory_id_type: typeof restaurantProduct.subcategory_id,
          restaurant_id: restaurantProduct.restaurant_id,
          restaurant_id_type: typeof restaurantProduct.restaurant_id
        })
        // Map restaurant product to BodegonProduct interface (for compatibility)
        const mappedProduct: BodegonProduct = {
          id: restaurantProduct.id,
          name: restaurantProduct.name || '',
          description: restaurantProduct.description || undefined,
          image_gallery_urls: restaurantProduct.image_gallery_urls || [],
          bar_code: undefined, // Restaurant products don't have bar_code
          sku: undefined, // Restaurant products don't have SKU
          category_id: restaurantProduct.category_id || undefined,
          subcategory_id: restaurantProduct.subcategory_id || undefined,
          price: restaurantProduct.price || 0,
          purchase_price: undefined,
          quantity_in_pack: 1,
          is_active_product: restaurantProduct.is_available !== false,
          is_discount: false,
          is_promo: false,
          created_by: restaurantProduct.created_by,
          created_at: restaurantProduct.created_date,
          updated_at: restaurantProduct.modified_date,
          // Add restaurant-specific fields
          restaurant_id: restaurantProduct.restaurant_id,
          product_type: 'restaurant' as const
        }
        return mappedProduct
      }

      console.log('❌ Restaurant product not found')
      return null

    } catch (err: any) {
      console.error('Error getting restaurant product:', err)
      setError(err.message || 'Error al obtener producto')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear producto de restaurante
  const createProduct = async (
    productData: {
      name: string
      description?: string
      image_gallery_urls?: string[]
      price: number
      restaurant_id: string
      category_id?: string
      subcategory_id?: string
      is_available?: boolean
    }
  ): Promise<any | null> => {
    console.log('🚀 createRestaurantProduct called with:', { productData })
    
    try {
      console.log('🔄 Setting loading to true')
      setLoading(true)
      setError(null)

      const configured = isSupabaseConfigured()
      console.log('🔧 Supabase configured:', configured)
      console.log('🔧 Supabase instance:', !!supabase)
      
      if (!configured || !supabase) {
        console.log('❌ Supabase not configured, throwing error')
        throw new Error('Base de datos no configurada')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const now = new Date()

      // Create product in restaurant_products table
      const { data: productResult, error: productError } = await supabase
        .from('restaurant_products')
        .insert({
          name: productData.name.trim(),
          description: productData.description?.trim() || null,
          image_gallery_urls: productData.image_gallery_urls || [],
          price: productData.price,
          restaurant_id: productData.restaurant_id,
          category_id: productData.category_id || null,
          subcategory_id: productData.subcategory_id || null,
          is_available: productData.is_available ?? true,
          created_by: user.id,
          created_date: now,
          modified_date: now
        })
        .select()
        .single()

      if (productError) {
        console.error('Error creating restaurant product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Restaurant product created successfully:', productResult)

      console.log('✅ createRestaurantProduct completed successfully')
      return productResult
    } catch (err: any) {
      console.error('❌ Error in createRestaurantProduct:', err)
      setError(err.message || 'Error al crear producto de restaurante')
      throw err
    } finally {
      console.log('🔄 Finally block: Setting loading to false')
      setLoading(false)
    }
  }

  // Actualizar producto de restaurante  
  const updateProduct = useCallback(async (
    productId: string,
    productData: {
      name: string
      description?: string
      image_gallery_urls?: string[]
      price: number
      restaurant_id: string
      category_id?: string
      subcategory_id?: string
      is_available?: boolean
    }
  ): Promise<any | null> => {
    try {
      setLoading(true)
      setError(null)

      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const now = new Date()

      // Update product in restaurant_products table
      const { data: productResult, error: productError } = await supabase
        .from('restaurant_products')
        .update({
          name: productData.name.trim(),
          description: productData.description?.trim() || null,
          image_gallery_urls: productData.image_gallery_urls || [],
          price: productData.price,
          restaurant_id: productData.restaurant_id,
          category_id: productData.category_id || null,
          subcategory_id: productData.subcategory_id || null,
          is_available: productData.is_available ?? true,
          modified_date: now
        })
        .eq('id', productId)
        .select()
        .single()

      if (productError) {
        console.error('Error updating restaurant product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Restaurant product updated successfully:', productResult)

      return productResult
    } catch (err: any) {
      console.error('Error updating restaurant product:', err)
      setError(err.message || 'Error al actualizar producto de restaurante')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Eliminar producto de restaurante  
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🍽️ Deleting RESTAURANT product with ID:', id)

      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('👤 Current user:', { 
        userId: user?.id, 
        email: user?.email, 
        authError: authError?.message 
      })

      // First, verify the restaurant product exists
      console.log('🔍 Verifying restaurant product exists...')
      const { data: testRestaurant, error: testRestaurantError } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      console.log('🔍 Restaurant product verification:', { testRestaurant, testRestaurantError })
      
      if (testRestaurant) {
        console.log('✅ Restaurant product found:', {
          id: testRestaurant.id,
          name: testRestaurant.name,
          restaurant_id: testRestaurant.restaurant_id,
          keys: Object.keys(testRestaurant)
        })
      } else {
        console.log('❌ Restaurant product not found - may already be deleted')
        return true // Consider it successful if already deleted
      }

      // Delete the restaurant product
      console.log('🔄 Deleting restaurant product from database:', id)
      const { data: deletedData, error: deleteError } = await supabase
        .from('restaurant_products')
        .delete()
        .eq('id', id)
        .select()

      console.log('🔄 Restaurant delete response:', { deletedData, deleteError })

      if (deleteError) {
        console.error('❌ Error deleting restaurant product:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        })
        throw new Error(deleteError.message)
      }

      console.log('✅ Restaurant product deleted successfully, records affected:', deletedData?.length || 0)
      if (deletedData && deletedData.length > 0) {
        console.log('✅ Deleted restaurant product data:', deletedData[0])
      }

      return true

    } catch (err: any) {
      console.error('❌ Error deleting restaurant product:', err)
      setError(err.message || 'Error al eliminar producto de restaurante')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Test function to debug restaurant product deletion
  const testDeleteProduct = async (id: string) => {
    console.log('🧪 TESTING restaurant product deletion with ID:', id)
    
    try {
      // Test 1: Check Supabase connection
      console.log('🧪 Test 1: Checking Supabase connection...')
      const configured = isSupabaseConfigured()
      console.log('🧪 Supabase configured:', configured)
      console.log('🧪 Supabase instance exists:', !!supabase)
      
      if (!configured || !supabase) {
        console.log('❌ Test failed: Supabase not configured')
        return false
      }

      // Test 2: Check authentication
      console.log('🧪 Test 2: Checking authentication...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('🧪 Auth result:', { userId: user?.id, email: user?.email, authError })
      
      // Test 3: Try to find the product
      console.log('🧪 Test 3: Looking for restaurant product...')
      const { data: product, error: findError } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      console.log('🧪 Find result:', { product, findError })
      
      if (!product) {
        console.log('❌ Test result: Product not found in restaurant_products')
        return false
      }

      // Test 4: Try a simple delete operation
      console.log('🧪 Test 4: Attempting delete operation...')
      const { data: deleteResult, error: deleteError } = await supabase
        .from('restaurant_products')
        .delete()
        .eq('id', id)
        .select()
      
      console.log('🧪 Delete result:', { deleteResult, deleteError })
      
      if (deleteError) {
        console.log('❌ Test failed with error:', deleteError)
        return false
      }
      
      console.log('✅ Test successful! Product should be deleted')
      return true
      
    } catch (error) {
      console.error('❌ Test exception:', error)
      return false
    }
  }

  return {
    loading,
    error,
    formatPrice,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    testDeleteProduct
  }
}