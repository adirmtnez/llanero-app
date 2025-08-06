'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Cart, 
  CartItem, 
  OrderItem, 
  CreateOrderItemData, 
  BodegonProduct, 
  RestaurantProduct 
} from '@/types/products'
import { useCartPersistence } from './use-cart-persistence'

interface UseCartReturn {
  cart: Cart | null
  isLoading: boolean
  isAddingToCart: boolean
  error: string | null
  addToCart: (productId: string, productType: 'bodegon' | 'restaurant') => Promise<void>
  removeFromCart: (orderItemId: string) => Promise<void>
  updateQuantity: (orderItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  totalItems: number
  totalAmount: number
}

export function useCart(userId?: string): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hook de persistencia
  const { 
    loadCartFromStorage, 
    clearCartStorage 
  } = useCartPersistence(cart, userId)

  // Función para cargar el carrito desde Supabase
  const loadCart = useCallback(async () => {
    if (!userId || !supabase) {
      setCart(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Obtener los order_items del usuario que no están asignados a un pedido
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_item')
        .select('*')
        .eq('user_id', userId)
        .is('"order"', null)

      if (orderItemsError) {
        console.error('Error loading cart items:', orderItemsError)
        setError('Error al cargar el carrito')
        return
      }

      if (!orderItems || orderItems.length === 0) {
        setCart({
          items: [],
          total_items: 0,
          total_amount: 0,
          user_id: userId
        })
        return
      }

      // Enriquecer los items con información del producto
      const enrichedItems: CartItem[] = []

      for (const item of orderItems) {
        let productData: BodegonProduct | RestaurantProduct | undefined
        let productType: 'bodegon' | 'restaurant'

        // Determinar tipo de producto y cargar datos
        if (item.bodegon_product_item) {
          productType = 'bodegon'
          const { data: product } = await supabase
            .from('bodegon_products')
            .select('*')
            .eq('id', item.bodegon_product_item)
            .single()
          
          productData = product
        } else if (item.restaurant_product_item) {
          productType = 'restaurant'
          const { data: product } = await supabase
            .from('restaurant_products')
            .select('*')
            .eq('id', item.restaurant_product_item)
            .single()
          
          productData = product
        } else {
          continue // Skip items sin producto asociado
        }

        enrichedItems.push({
          ...item,
          product_type: productType!,
          product_data: productData
        })
      }

      // Calcular totales
      const totalItems = enrichedItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = enrichedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)


      setCart({
        items: enrichedItems,
        total_items: totalItems,
        total_amount: totalAmount,
        user_id: userId
      })

    } catch (err) {
      console.error('Error loading cart:', err)
      setError('Error inesperado al cargar el carrito')
      
      // En caso de error, intentar cargar desde localStorage
      const localCart = loadCartFromStorage()
      if (localCart) {
        setCart(localCart)
        setError('Carrito cargado desde caché local')
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, loadCartFromStorage])

  // Función para agregar producto al carrito
  const addToCart = useCallback(async (productId: string, productType: 'bodegon' | 'restaurant') => {
    if (!userId || !supabase) return

    try {
      setIsAddingToCart(true)
      setError(null)

      // Obtener información del producto
      const tableName = productType === 'bodegon' ? 'bodegon_products' : 'restaurant_products'
      const { data: product, error: productError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        setError('Producto no encontrado')
        return
      }

      // Verificar si el producto ya está en el carrito
      const { data: existingItem, error: existingError } = await supabase
        .from('order_item')
        .select('*')
        .eq('user_id', userId)
        .eq(productType === 'bodegon' ? 'bodegon_product_item' : 'restaurant_product_item', productId)
        .is('"order"', null)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing item:', existingError)
        setError('Error al verificar el carrito')
        return
      }

      if (existingItem) {
        // Incrementar cantidad del producto existente en BD
        const { error: updateError } = await supabase
          .from('order_item')
          .update({ 
            quantity: existingItem.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)

        if (updateError) {
          console.error('Error updating cart item:', updateError)
          setError('Error al actualizar el carrito')
          return
        }
      } else {
        // Crear nuevo item en el carrito
        const newItemData: CreateOrderItemData = {
          quantity: 1,
          price: product.price,
          name_snapshot: product.name,
          [productType === 'bodegon' ? 'bodegon_product_item' : 'restaurant_product_item']: productId
        }

        // Insertar en BD
        const { error: insertError } = await supabase
          .from('order_item')
          .insert({
            ...newItemData,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating cart item:', insertError)
          setError('Error al agregar al carrito')
          return
        }
      }

      // Actualizar lista de cart_items en users  
      await updateUserCartItems()

    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('Error inesperado al agregar al carrito')
    } finally {
      setIsAddingToCart(false)
    }
  }, [userId])

  // Función para remover producto del carrito
  const removeFromCart = useCallback(async (orderItemId: string) => {
    if (!userId || !supabase) return

    try {
      setError(null)

      // Actualización optimista primero
      if (cart) {
        const updatedItems = cart.items.filter(item => item.id !== orderItemId)
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        
        setCart({
          ...cart,
          items: updatedItems,
          total_items: newTotalItems,
          total_amount: newTotalAmount
        })
      }

      const { error } = await supabase
        .from('order_item')
        .delete()
        .eq('id', orderItemId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing cart item:', error)
        setError('Error al remover del carrito')
        // Revertir cambio optimista
        await loadCart()
        return
      }

      // Actualizar lista de cart_items en users  
      await updateUserCartItems()

    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('Error inesperado al remover del carrito')
      // Revertir cambio optimista
      await loadCart()
    }
  }, [userId])

  // Función para actualizar cantidad
  const updateQuantity = useCallback(async (orderItemId: string, quantity: number) => {
    if (!userId || !supabase) return

    try {
      setError(null)

      if (quantity <= 0) {
        await removeFromCart(orderItemId)
        return
      }


      const { error } = await supabase
        .from('order_item')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderItemId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating quantity:', error)
        setError('Error al actualizar cantidad')
        return
      }

      // Actualizar lista de cart_items en users  
      await updateUserCartItems()

    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Error inesperado al actualizar cantidad')
    }
  }, [userId, removeFromCart])

  // Función para vaciar carrito
  const clearCart = useCallback(async () => {
    if (!userId || !supabase) return

    try {
      setError(null)

      const { error } = await supabase
        .from('order_item')
        .delete()
        .eq('user_id', userId)
        .is('"order"', null)

      if (error) {
        console.error('Error clearing cart:', error)
        setError('Error al vaciar el carrito')
        return
      }

      // Actualizar lista de cart_items en users  
      await updateUserCartItems()

    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Error inesperado al vaciar el carrito')
    }
  }, [userId])

  // Función auxiliar para actualizar cart_items en users
  const updateUserCartItems = useCallback(async () => {
    if (!userId || !supabase) return

    try {
      // Obtener IDs de los order_items actuales del carrito
      const { data: cartItemIds } = await supabase
        .from('order_item')
        .select('id')
        .eq('user_id', userId)
        .is('"order"', null)

      // Actualizar campo cart_items en users
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          cart_items: cartItemIds?.map(item => item.id) || []
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user cart_items:', updateError)
      }

    } catch (err) {
      console.error('Error updating user cart_items:', err)
    }
  }, [userId])

  // Cargar carrito inicial
  useEffect(() => {
    if (userId) {
      loadCart()
    }
  }, [userId])

  // Suscripción en tiempo real a cambios en order_item
  useEffect(() => {
    if (!userId || !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return
    }

    
    // Suscribirse a cambios en la tabla order_item para este usuario
    const subscription = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'order_item',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Recargar el carrito cuando hay cambios con un pequeño delay
          setTimeout(() => loadCart(), 100)
        }
      )
      .subscribe()

    // Cleanup de la suscripción
    return () => {
      subscription.unsubscribe()
    }
  }, [userId, loadCart])

  return {
    cart,
    isLoading,
    isAddingToCart,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: loadCart,
    totalItems: cart?.total_items || 0,
    totalAmount: cart?.total_amount || 0
  }
}