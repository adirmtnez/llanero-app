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

const mockProducts: BodegonProduct[] = [
  {
    id: "1",
    name: "Coca-Cola 350ml",
    description: "Refresco de cola",
    price: 2500,
    quantity_in_pack: 50,
    sku: "COKE350",
    bar_code: "123456789",
    category_id: "1",
    subcategory_id: "1",
    is_active_product: true,
    is_discount: false,
    is_promo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "user1"
  },
  {
    id: "2",
    name: "Papas Fritas Margarita",
    description: "Papas fritas sabor natural",
    price: 1800,
    quantity_in_pack: 30,
    sku: "PAPAS001",
    bar_code: "987654321",
    category_id: "2",
    subcategory_id: undefined,
    is_active_product: true,
    is_discount: true,
    is_promo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "user1"
  }
]

export function useBodegonProducts() {
  const [loading, setLoading] = useState(true)
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
      // Mock validation - check if SKU exists in mock data
      const existingProduct = mockProducts.find(p => 
        p.sku === sku.trim() && p.id !== excludeId
      )
      return !existingProduct
    } catch (err) {
      console.error('Error validating SKU:', err)
      return true
    }
  }

  // Validar que código de barras sea único
  const validateUniqueBarCode = async (barCode: string, excludeId?: string): Promise<boolean> => {
    if (!barCode.trim()) return true // Código de barras es opcional

    try {
      // Mock validation - check if bar code exists in mock data
      const existingProduct = mockProducts.find(p => 
        p.bar_code === barCode.trim() && p.id !== excludeId
      )
      return !existingProduct
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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      let filteredProducts = [...mockProducts]

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower) ||
          p.bar_code?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.category_id) {
        filteredProducts = filteredProducts.filter(p => p.category_id === filters.category_id)
      }

      if (filters.subcategory_id) {
        filteredProducts = filteredProducts.filter(p => p.subcategory_id === filters.subcategory_id)
      }

      if (filters.is_active !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.is_active_product === filters.is_active)
      }

      if (filters.is_discount !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.is_discount === filters.is_discount)
      }

      if (filters.is_promo !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.is_promo === filters.is_promo)
      }

      if (filters.price_min !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.price_min!)
      }

      if (filters.price_max !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.price_max!)
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      const paginatedProducts = filteredProducts.slice(offset, offset + pagination.limit)
      const totalPages = Math.ceil(filteredProducts.length / pagination.limit)

      return {
        products: paginatedProducts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: filteredProducts.length,
          totalPages
        }
      }
    } catch (err: any) {
      console.error('Error getting products:', err)
      setError(err.message || 'Error al obtener productos')
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

  // Obtener un producto por ID
  const getProductById = async (id: string): Promise<BodegonProduct | null> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))

      const product = mockProducts.find(p => p.id === id)
      return product || null
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

      return productResult
    } catch (err: any) {
      console.error('Error creating product with inventory:', err)
      setError(err.message || 'Error al crear producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Crear producto (implementación original para compatibilidad)
  const createProduct = async (productData: CreateBodegonProductData): Promise<BodegonProduct | null> => {
    try {
      setLoading(true)
      setError(null)

      // Validaciones de unicidad
      if (productData.sku && !(await validateUniqueSKU(productData.sku))) {
        throw new Error('El SKU ya existe en el sistema')
      }

      if (productData.bar_code && !(await validateUniqueBarCode(productData.bar_code))) {
        throw new Error('El código de barras ya existe en el sistema')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const newProduct: BodegonProduct = {
        ...productData,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "mock-user",
        is_active_product: productData.is_active_product ?? true,
        is_discount: productData.is_discount ?? false,
        is_promo: productData.is_promo ?? false
      }

      mockProducts.push(newProduct)
      return newProduct
    } catch (err: any) {
      console.error('Error creating product:', err)
      setError(err.message || 'Error al crear producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actualizar producto
  const updateProduct = async (productData: UpdateBodegonProductData): Promise<BodegonProduct | null> => {
    try {
      setLoading(true)
      setError(null)

      const { id, ...updateData } = productData

      // Validaciones de unicidad (excluyendo el producto actual)
      if (updateData.sku && !(await validateUniqueSKU(updateData.sku, id))) {
        throw new Error('El SKU ya existe en el sistema')
      }

      if (updateData.bar_code && !(await validateUniqueBarCode(updateData.bar_code, id))) {
        throw new Error('El código de barras ya existe en el sistema')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const productIndex = mockProducts.findIndex(p => p.id === id)
      if (productIndex === -1) {
        throw new Error('Producto no encontrado')
      }

      const updatedProduct = {
        ...mockProducts[productIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      }

      mockProducts[productIndex] = updatedProduct
      return updatedProduct
    } catch (err: any) {
      console.error('Error updating product:', err)
      setError(err.message || 'Error al actualizar producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const productIndex = mockProducts.findIndex(p => p.id === id)
      if (productIndex === -1) {
        throw new Error('Producto no encontrado')
      }

      mockProducts.splice(productIndex, 1)
      return true
    } catch (err: any) {
      console.error('Error deleting product:', err)
      setError(err.message || 'Error al eliminar producto')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Alternar estado activo del producto
  const toggleProductActive = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))

      const productIndex = mockProducts.findIndex(p => p.id === id)
      if (productIndex === -1) {
        throw new Error('Producto no encontrado')
      }

      mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        is_active_product: isActive,
        updated_at: new Date().toISOString()
      }

      return true
    } catch (err: any) {
      console.error('Error toggling product active:', err)
      setError(err.message || 'Error al cambiar estado del producto')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Auto-load initial data
  useEffect(() => {
    // Start with loading true, then load mock data after delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return {
    loading,
    error,
    formatPrice,
    getProducts,
    getProductById,
    createProduct,
    createProductWithInventory,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    validateUniqueSKU,
    validateUniqueBarCode
  }
}