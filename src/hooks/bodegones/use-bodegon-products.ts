"use client"

import { useState, useCallback } from "react"
import { 
  BodegonProduct, 
  CreateBodegonProductData, 
  UpdateBodegonProductData,
  ProductsFilters,
  ProductsPagination,
  ProductsResponse
} from "@/types/products"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export function useBodegonProducts() {
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

  // Validar que SKU sea único
  const validateUniqueSKU = async (sku: string, excludeId?: string): Promise<boolean> => {
    if (!sku.trim()) return true // SKU es opcional

    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        return true // Skip validation if no database
      }

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
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        return true // Skip validation if no database
      }

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
        console.error('Error fetching bodegon products:', queryError)
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
        quantity_in_pack: 1,
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
      console.error('Error getting bodegon products:', err)
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

      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        throw new Error('Base de datos no configurada')
      }

      console.log('🔍 Searching for bodegon product in Supabase with ID:', id)

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
          quantity_in_pack: 1,
          is_active_product: bodegonProduct.is_active_product !== false,
          is_discount: bodegonProduct.is_discount !== false,
          is_promo: bodegonProduct.is_promo !== false,
          created_by: bodegonProduct.created_by,
          created_at: bodegonProduct.created_date,
          updated_at: bodegonProduct.modified_date
        }
        return mappedProduct
      }

      console.log('❌ Bodegon product not found')
      return null

    } catch (err: any) {
      console.error('Error getting bodegon product:', err)
      setError(err.message || 'Error al obtener producto')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Crear producto con inventario
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
    console.log('🚀 createBodegonProductWithInventory called with:', { productData, selectedBodegones })
    
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
        console.error('Error creating bodegon product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Bodegon product created successfully:', productResult)

      // 2. Create inventory entries for selected bodegones
      if (selectedBodegones.length > 0) {
        const inventoryEntries = selectedBodegones.map(bodegonId => ({
          product_id: productResult.id,
          bodegon_id: bodegonId,
          is_available_at_bodegon: true,
          created_by: user.id,
          modified_date: now
        }))

        console.log('🔄 Creating bodegon inventory entries:', inventoryEntries)

        const { data: inventoryData, error: inventoryError } = await supabase
          .from('bodegon_inventories')
          .insert(inventoryEntries)
          .select()

        if (inventoryError) {
          console.error('❌ Error creating bodegon inventory entries:', inventoryError)
          
          // Try to rollback the product creation
          try {
            await supabase
              .from('bodegon_products')
              .delete()
              .eq('id', productResult.id)
            console.log('✅ Bodegon product rollback successful')
          } catch (rollbackError) {
            console.error('❌ Rollback failed:', rollbackError)
          }
          
          throw new Error(`Error al crear el inventario del producto: ${inventoryError.message}`)
        }

        console.log('✅ Bodegon inventory entries created successfully:', inventoryData)
      }

      console.log('✅ createBodegonProductWithInventory completed successfully')
      return productResult
    } catch (err: any) {
      console.error('❌ Error in createBodegonProductWithInventory:', err)
      setError(err.message || 'Error al crear producto')
      throw err
    } finally {
      console.log('🔄 Finally block: Setting loading to false')
      setLoading(false)
    }
  }

  // Actualizar producto con inventario
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
        console.error('Error updating bodegon product:', productError)
        throw new Error(productError.message)
      }

      console.log('✅ Bodegon product updated successfully:', productResult)

      // 2. Update inventory entries for selected bodegones
      console.log('🗑️ Deleting existing bodegon inventory entries for product:', productId)
      
      // First, delete existing inventory entries for this product
      const { error: deleteError } = await supabase
        .from('bodegon_inventories')
        .delete()
        .eq('product_id', productId)

      if (deleteError) {
        console.error('❌ Error deleting existing bodegon inventory entries:', deleteError)
        throw new Error(`Error al actualizar inventario: ${deleteError.message}`)
      }

      console.log('✅ Successfully deleted existing bodegon inventory entries')

      // Then, create new inventory entries for selected bodegones
      if (selectedBodegones.length > 0) {
        const inventoryEntries = selectedBodegones.map(bodegonId => ({
          product_id: productId,
          bodegon_id: bodegonId,
          is_available_at_bodegon: true,
          created_by: user.id,
          modified_date: now
        }))

        console.log('🔄 Creating new bodegon inventory entries:', inventoryEntries)

        const { data: inventoryData, error: inventoryError } = await supabase
          .from('bodegon_inventories')
          .insert(inventoryEntries)
          .select()

        if (inventoryError) {
          console.error('❌ Error creating bodegon inventory entries:', inventoryError)
          throw new Error(`Error al actualizar el inventario del producto: ${inventoryError.message}`)
        }

        console.log('✅ Bodegon inventory entries created successfully:', inventoryData)
      } else {
        console.log('⚠️ No bodegones selected, inventory will be empty for this product')
      }

      return productResult
    } catch (err: any) {
      console.error('Error updating bodegon product with inventory:', err)
      setError(err.message || 'Error al actualizar producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto de bodegón
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

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
      console.log('🔄 Step 1: Deleting bodegon inventory entries for product:', id)
      const { error: inventoryError } = await supabase
        .from('bodegon_inventories')
        .delete()
        .eq('product_id', id)

      if (inventoryError) {
        console.log('⚠️ Bodegon inventory deletion failed:', inventoryError.message)
        // Don't throw error, continue with product deletion
      } else {
        console.log('✅ Bodegon inventory entries deleted successfully')
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

  // Obtener inventario de bodegones para un producto específico
  const getProductInventory = async (productId: string): Promise<string[]> => {
    try {
      const configured = isSupabaseConfigured()
      
      if (!configured || !supabase) {
        console.log('Using empty inventory for getProductInventory (Supabase not configured)')
        return []
      }

      console.log('🔍 Searching for bodegon product inventory in Supabase with productId:', productId)

      // Query bodegon_inventories table for this product
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('bodegon_inventories')
        .select('bodegon_id, is_available_at_bodegon')
        .eq('product_id', productId)
        .eq('is_available_at_bodegon', true) // Only get active inventory entries

      if (inventoryError) {
        console.error('Error fetching bodegon product inventory:', inventoryError)
        // Return empty array instead of throwing error to prevent UI crashes
        return []
      }

      // Extract bodegon IDs where the product is available
      const availableBodegones = (inventoryData || []).map(item => item.bodegon_id)
      
      console.log('✅ Found bodegon product inventory:', availableBodegones)
      return availableBodegones

    } catch (err: any) {
      console.error('Error getting bodegon product inventory:', err)
      // Don't throw error, just return empty array as fallback
      return []
    }
  }

  return {
    loading,
    error,
    formatPrice,
    getProducts,
    getProductById,
    getProductInventory,
    createProductWithInventory,
    updateProductWithInventory,
    deleteProduct,
    validateUniqueSKU,
    validateUniqueBarCode
  }
}