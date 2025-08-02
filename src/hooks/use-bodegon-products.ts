"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  BodegonProduct, 
  CreateBodegonProductData, 
  UpdateBodegonProductData,
  ProductsFilters,
  ProductsPagination,
  ProductsResponse
} from "@/types/products"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

// Mock data removed - using only real Supabase data

export function useBodegonProducts() {
  const [loading, setLoading] = useState(false) // Changed to false - only true during operations
  const [error, setError] = useState<string | null>(null)

  // Utility function para formatear precios
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(price)
  }

  // Validar que SKU sea único
  const validateUniqueSKU = async (sku: string, excludeId?: string): Promise<boolean> => {
    if (!sku.trim()) return true // SKU es opcional

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        return true // Skip validation if no database
      }

      // Check if SKU exists in bodegon_products
      const { data, error } = await supabase
        .from('bodegon_products')
        .select('id')
        .eq('sku', sku.trim())
        .neq('id', excludeId || '')

      if (error) {
        console.error('Error validating SKU:', error)
        return true // Allow if validation fails
      }

      return !data || data.length === 0
    } catch (err) {
      console.error('Error validating SKU:', err)
      return true
    }
  }

  // Validar que código de barras sea único
  const validateUniqueBarCode = async (barCode: string, excludeId?: string): Promise<boolean> => {
    if (!barCode.trim()) return true // Código de barras es opcional

    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        return true // Skip validation if no database
      }

      // Check if bar code exists in bodegon_products
      const { data, error } = await supabase
        .from('bodegon_products')
        .select('id')
        .eq('bar_code', barCode.trim())
        .neq('id', excludeId || '')

      if (error) {
        console.error('Error validating bar code:', error)
        return true // Allow if validation fails
      }

      return !data || data.length === 0
    } catch (err) {
      console.error('Error validating bar code:', err)
      return true
    }
  }

  // Obtener productos con paginación y filtros
  const getProducts = useCallback(async (
    filters: ProductsFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<ProductsResponse> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      // Build Supabase query
      let query = supabase
        .from('bodegon_products')
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,bar_code.ilike.%${filters.search}%`)
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters.subcategory_id) {
        query = query.eq('subcategory_id', filters.subcategory_id)
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active_product', filters.is_active)
      }

      if (filters.is_discount !== undefined) {
        query = query.eq('is_discount', filters.is_discount)
      }

      if (filters.is_promo !== undefined) {
        query = query.eq('is_promo', filters.is_promo)
      }

      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min)
      }

      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max)
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      query = query
        .order('created_date', { ascending: false })
        .range(from, to)

      const { data, error: queryError, count } = await query

      if (queryError) {
        console.error('Error fetching products:', queryError)
        throw new Error(queryError.message)
      }

      // Map Supabase data to our interface
      const mappedProducts: BodegonProduct[] = (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || undefined,
        image_gallery_urls: item.image_gallery_urls || [],
        bar_code: item.bar_code || undefined,
        sku: item.sku || undefined,
        category_id: item.category_id || undefined,
        subcategory_id: item.subcategory_id || undefined,
        price: item.price || 0,
        purchase_price: item.purchase_price || undefined,
        quantity_in_pack: 1, // Default since we removed this field
        is_active_product: item.is_active_product !== false,
        is_discount: item.is_discount !== false,
        is_promo: item.is_promo !== false,
        created_by: item.created_by,
        created_at: item.created_date,
        updated_at: item.modified_date
      }))

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('bodegon_products')
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
      console.error('Error getting products:', err)
      setError(err.message || 'Error al obtener productos')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener un producto por ID
  const getProductById = async (id: string): Promise<BodegonProduct | null> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🔍 Searching for product in Supabase with ID:', id)

      // First try to find in bodegon_products
      const { data: bodegonProduct, error: bodegonError } = await supabase
        .from('bodegon_products')
        .select('*')
        .eq('id', id)
        .single()

      if (bodegonProduct && !bodegonError) {
        console.log('✅ Found bodegon product:', bodegonProduct)
        // Map Supabase data to our interface
        const mappedProduct: BodegonProduct = {
          id: bodegonProduct.id,
          name: bodegonProduct.name || '',
          description: bodegonProduct.description || undefined,
          image_gallery_urls: bodegonProduct.image_gallery_urls || [],
          bar_code: bodegonProduct.bar_code || undefined,
          sku: bodegonProduct.sku || undefined,
          category_id: bodegonProduct.category_id || undefined,
          subcategory_id: bodegonProduct.subcategory_id || undefined,
          price: bodegonProduct.price || 0,
          purchase_price: bodegonProduct.purchase_price || undefined,
          quantity_in_pack: 1, // Default since we removed this field
          is_active_product: bodegonProduct.is_active_product !== false,
          is_discount: bodegonProduct.is_discount !== false,
          is_promo: bodegonProduct.is_promo !== false,
          created_by: bodegonProduct.created_by,
          created_at: bodegonProduct.created_date,
          updated_at: bodegonProduct.modified_date
        }
        return mappedProduct
      }

      // If not found in bodegon_products, try restaurant_products
      console.log('🔍 Product not found in bodegon_products, searching in restaurant_products...')
      const { data: restaurantProduct, error: restaurantError } = await supabase
        .from('restaurant_products')
        .select('*')
        .eq('id', id)
        .single()

      if (restaurantProduct && !restaurantError) {
        console.log('✅ Found restaurant product:', restaurantProduct)
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

      console.log('❌ Product not found in any table')
      return null

    } catch (err: any) {
      console.error('Error getting product:', err)
      setError(err.message || 'Error al obtener producto')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Crear producto con inventario (nueva implementación para bodegon_products y bodegon_inventories)
  const createProductWithInventory = async (
    productData: {
      name: string
      description?: string
      image_gallery_urls?: string[]
      bar_code?: string
      sku?: string
      category_id?: string
      subcategory_id?: string
      price: number
      is_active_product?: boolean
      is_discount?: boolean
      is_promo?: boolean
      discounted_price?: number | null
    },
    selectedBodegones: string[]
  ): Promise<any | null> => {
    console.log('🚀 createProductWithInventory called with:', { productData, selectedBodegones })
    
    try {
      console.log('🔄 Setting loading to true')
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
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

      // 1. Create product in bodegon_products table
      const { data: productResult, error: productError } = await supabase
        .from('bodegon_products')
        .insert({
          name: productData.name.trim(),
          description: productData.description?.trim() || null,
          image_gallery_urls: productData.image_gallery_urls || [],
          bar_code: productData.bar_code?.trim() || null,
          sku: productData.sku?.trim() || null,
          category_id: productData.category_id || null,
          subcategory_id: productData.subcategory_id || null,
          price: productData.price,
          is_active_product: productData.is_active_product ?? true,
          is_discount: productData.is_discount ?? false,
          is_promo: productData.is_promo ?? false,
          discounted_price: productData.discounted_price || null,
          created_by: user.id,
          created_date: now,
          modified_date: now
        })
        .select()
        .single()

      if (productError) {
        console.error('Error creating product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Product created successfully:', productResult)

      // 2. Create inventory entries for selected bodegones
      if (selectedBodegones.length > 0) {
        const inventoryEntries = selectedBodegones.map(bodegonId => ({
          product_id: productResult.id,
          bodegon_id: bodegonId,
          is_available_at_bodegon: true,
          created_by: user.id,
          modified_date: now
        }))

        console.log('🔄 Creating inventory entries:', inventoryEntries)

        const { data: inventoryData, error: inventoryError } = await supabase
          .from('bodegon_inventories')
          .insert(inventoryEntries)
          .select()

        if (inventoryError) {
          console.error('❌ Error creating inventory entries:', inventoryError)
          console.error('❌ Inventory error details:', {
            message: inventoryError.message,
            details: inventoryError.details,
            hint: inventoryError.hint,
            code: inventoryError.code
          })
          
          // Try to rollback the product creation
          try {
            await supabase
              .from('bodegon_products')
              .delete()
              .eq('id', productResult.id)
            console.log('✅ Product rollback successful')
          } catch (rollbackError) {
            console.error('❌ Rollback failed:', rollbackError)
          }
          
          throw new Error(`Error al crear el inventario del producto: ${inventoryError.message}`)
        }

        console.log('✅ Inventory entries created successfully:', inventoryData)

        console.log('✅ Inventory entries created successfully for', selectedBodegones.length, 'bodegones')
      }

      console.log('✅ createProductWithInventory completed successfully')
      return productResult
    } catch (err: any) {
      console.error('❌ Error in createProductWithInventory:', err)
      console.error('❌ Error message:', err.message)
      console.error('❌ Error stack:', err.stack)
      setError(err.message || 'Error al crear producto')
      console.log('🔄 About to throw error, loading should be reset in finally')
      throw err
    } finally {
      console.log('🔄 Finally block: Setting loading to false')
      setLoading(false)
    }
  }

  // Legacy createProduct function removed - use createProductWithInventory or createRestaurantProduct instead

  // Legacy updateProduct function removed - use updateProductWithInventory or updateRestaurantProduct instead

  // Eliminar producto de restaurante específicamente
  const deleteRestaurantProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
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
  }

  // Eliminar producto de bodegón específicamente
  const deleteBodegonProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🏪 Deleting BODEGON product with ID:', id)

      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('👤 Current user:', { 
        userId: user?.id, 
        email: user?.email, 
        authError: authError?.message 
      })

      // First, verify the bodegon product exists
      console.log('🔍 Verifying bodegon product exists...')
      const { data: testProduct, error: testError } = await supabase
        .from('bodegon_products')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      console.log('🔍 Bodegon product verification:', { testProduct, testError })
      
      if (testProduct) {
        console.log('✅ Bodegon product found:', {
          id: testProduct.id,
          name: testProduct.name,
          keys: Object.keys(testProduct)
        })
      } else {
        console.log('❌ Bodegon product not found - may already be deleted')
        return true // Consider it successful if already deleted
      }

      // Step 1: Delete inventory entries first (foreign key constraint)
      console.log('🔄 Step 1: Deleting inventory entries for product:', id)
      const { error: inventoryError } = await supabase
        .from('bodegon_inventories')
        .delete()
        .eq('product_id', id)

      if (inventoryError) {
        console.log('⚠️ Inventory deletion failed:', inventoryError.message)
        // Don't throw error, continue with product deletion
      } else {
        console.log('✅ Inventory entries deleted successfully')
      }

      // Step 2: Delete the bodegon product
      console.log('🔄 Step 2: Deleting bodegon product from database:', id)
      const { data: deletedData, error: deleteError } = await supabase
        .from('bodegon_products')
        .delete()
        .eq('id', id)
        .select()

      console.log('🔄 Bodegon delete response:', { deletedData, deleteError })

      if (deleteError) {
        console.error('❌ Error deleting bodegon product:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        })
        throw new Error(deleteError.message)
      }

      console.log('✅ Bodegon product deleted successfully, records affected:', deletedData?.length || 0)
      if (deletedData && deletedData.length > 0) {
        console.log('✅ Deleted bodegon product data:', deletedData[0])
      }

      return true

    } catch (err: any) {
      console.error('❌ Error deleting bodegon product:', err)
      setError(err.message || 'Error al eliminar producto de bodegón')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Test function to debug restaurant product deletion
  const testDeleteRestaurantProduct = async (id: string) => {
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

  // Función inteligente que determina el tipo de producto y usa la función correcta
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🔍 Determining product type for ID:', id)

      // First check if it's a restaurant product
      const { data: restaurantCheck } = await supabase
        .from('restaurant_products')
        .select('id')
        .eq('id', id)
        .maybeSingle()

      if (restaurantCheck) {
        console.log('🍽️ Product identified as RESTAURANT product, using deleteRestaurantProduct')
        setLoading(false) // Reset loading as the specific function will handle it
        return await deleteRestaurantProduct(id)
      }

      // Otherwise assume it's a bodegon product
      console.log('🏪 Product assumed to be BODEGON product, using deleteBodegonProduct')
      setLoading(false) // Reset loading as the specific function will handle it
      return await deleteBodegonProduct(id)

    } catch (err: any) {
      console.error('❌ Error in deleteProduct router:', err)
      setError(err.message || 'Error al eliminar producto')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Legacy toggleProductActive function removed - use updateProductWithInventory or updateRestaurantProduct to change status

  // Crear producto de restaurante (implementación para restaurant_products)
  const createRestaurantProduct = async (
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

      // Check if Supabase is configured
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
      console.error('❌ Error message:', err.message)
      console.error('❌ Error stack:', err.stack)
      setError(err.message || 'Error al crear producto de restaurante')
      console.log('🔄 About to throw error, loading should be reset in finally')
      throw err
    } finally {
      console.log('🔄 Finally block: Setting loading to false')
      setLoading(false)
    }
  }

  // Obtener productos de restaurante con paginación y filtros
  const getRestaurantProducts = useCallback(async (
    filters: { search?: string; restaurant_id?: string; category_id?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<ProductsResponse> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        // Use mock data if Supabase is not configured
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          products: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0
          }
        }
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
      
      // Fallback to empty data on error
      return {
        products: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Actualizar producto con inventario (nueva implementación para bodegon_products y bodegon_inventories)
  const updateProductWithInventory = async (
    productId: string,
    productData: {
      name: string
      description?: string
      image_gallery_urls?: string[]
      bar_code?: string
      sku?: string
      category_id?: string
      subcategory_id?: string
      price: number
      is_active_product?: boolean
      is_discount?: boolean
      is_promo?: boolean
      discounted_price?: number | null
    },
    selectedBodegones: string[]
  ): Promise<any | null> => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
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

      // 1. Update product in bodegon_products table
      const { data: productResult, error: productError } = await supabase
        .from('bodegon_products')
        .update({
          name: productData.name.trim(),
          description: productData.description?.trim() || null,
          image_gallery_urls: productData.image_gallery_urls || [],
          bar_code: productData.bar_code?.trim() || null,
          sku: productData.sku?.trim() || null,
          category_id: productData.category_id || null,
          subcategory_id: productData.subcategory_id || null,
          price: productData.price,
          is_active_product: productData.is_active_product ?? true,
          is_discount: productData.is_discount ?? false,
          is_promo: productData.is_promo ?? false,
          discounted_price: productData.discounted_price || null,
          modified_date: now
        })
        .eq('id', productId)
        .select()
        .single()

      if (productError) {
        console.error('Error updating product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Product updated successfully:', productResult)

      // 2. Update inventory entries for selected bodegones
      console.log('🗑️ Deleting existing inventory entries for product:', productId)
      
      // First, delete existing inventory entries for this product
      const { error: deleteError } = await supabase
        .from('bodegon_inventories')
        .delete()
        .eq('product_id', productId)

      if (deleteError) {
        console.error('❌ Error deleting existing inventory entries:', deleteError)
        throw new Error(`Error al actualizar inventario: ${deleteError.message}`)
      }

      console.log('✅ Successfully deleted existing inventory entries')

      // Then, create new inventory entries for selected bodegones
      if (selectedBodegones.length > 0) {
        const inventoryEntries = selectedBodegones.map(bodegonId => ({
          product_id: productId,
          bodegon_id: bodegonId,
          is_available_at_bodegon: true,
          created_by: user.id,
          modified_date: now
        }))

        console.log('🔄 Creating new inventory entries:', inventoryEntries)
        console.log('📊 Selected bodegones count:', selectedBodegones.length)
        console.log('🏪 Selected bodegones IDs:', selectedBodegones)

        const { data: inventoryData, error: inventoryError } = await supabase
          .from('bodegon_inventories')
          .insert(inventoryEntries)
          .select()

        if (inventoryError) {
          console.error('❌ Error creating inventory entries:', inventoryError)
          throw new Error(`Error al actualizar el inventario del producto: ${inventoryError.message}`)
        }

        console.log('✅ Inventory entries created successfully:', inventoryData)
        console.log('📈 Created', inventoryData?.length || 0, 'new inventory entries')
      } else {
        console.log('⚠️ No bodegones selected, inventory will be empty for this product')
      }

      return productResult
    } catch (err: any) {
      console.error('Error updating product with inventory:', err)
      setError(err.message || 'Error al actualizar producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actualizar producto de restaurante
  const updateRestaurantProduct = async (
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

      // Check if Supabase is configured
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
  }

  // Obtener inventario de bodegones para un producto específico
  const getProductInventory = async (productId: string): Promise<string[]> => {
    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        console.log('Using empty inventory for getProductInventory (Supabase not configured)')
        return []
      }

      console.log('🔍 Searching for product inventory in Supabase with productId:', productId)

      // Query bodegon_inventories table for this product
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('bodegon_inventories')
        .select('bodegon_id, is_available_at_bodegon')
        .eq('product_id', productId)
        .eq('is_available_at_bodegon', true) // Only get active inventory entries

      if (inventoryError) {
        console.error('Error fetching product inventory:', inventoryError)
        throw new Error(inventoryError.message)
      }

      // Extract bodegon IDs where the product is available
      const availableBodegones = (inventoryData || []).map(item => item.bodegon_id)
      
      console.log('✅ Found product inventory:', availableBodegones)
      return availableBodegones

    } catch (err: any) {
      console.error('Error getting product inventory:', err)
      // Don't throw error, just return empty array as fallback
      return []
    }
  }

  return {
    loading,
    error,
    formatPrice,
    getProducts,
    getRestaurantProducts,
    getProductById,
    getProductInventory,
    createProductWithInventory,
    createRestaurantProduct,
    updateProductWithInventory,
    updateRestaurantProduct,
    deleteProduct, // Smart router function
    deleteRestaurantProduct, // Specific for restaurant products
    deleteBodegonProduct, // Specific for bodegon products
    testDeleteRestaurantProduct, // Test function for debugging
    validateUniqueSKU,
    validateUniqueBarCode
  }
}