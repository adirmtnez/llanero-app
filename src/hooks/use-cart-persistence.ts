'use client'

import { useEffect, useCallback } from 'react'
import { Cart, CartItem } from '@/types/products'

const CART_STORAGE_KEY = 'llanero_cart_backup'
const CART_TIMESTAMP_KEY = 'llanero_cart_timestamp'

/**
 * Hook para persistir el carrito en localStorage como backup
 * Se ejecuta automáticamente cuando el carrito cambia
 */
export function useCartPersistence(cart: Cart | null, userId?: string) {
  
  // Guardar carrito en localStorage
  const saveCartToStorage = useCallback(() => {
    if (!cart || !userId) return

    try {
      const cartData = {
        cart,
        userId,
        timestamp: Date.now()
      }
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
      localStorage.setItem(CART_TIMESTAMP_KEY, cartData.timestamp.toString())
      
      console.log('Cart saved to localStorage as backup')
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart, userId])

  // Cargar carrito desde localStorage
  const loadCartFromStorage = useCallback((): Cart | null => {
    if (!userId || typeof window === 'undefined') return null

    try {
      const savedData = localStorage.getItem(CART_STORAGE_KEY)
      if (!savedData) return null

      const { cart: savedCart, userId: savedUserId, timestamp } = JSON.parse(savedData)
      
      // Verificar que sea del mismo usuario
      if (savedUserId !== userId) {
        clearCartStorage()
        return null
      }

      // Verificar que no sea muy antiguo (máximo 24 horas)
      const maxAge = 24 * 60 * 60 * 1000 // 24 horas en ms
      if (Date.now() - timestamp > maxAge) {
        clearCartStorage()
        return null
      }

      console.log('Cart loaded from localStorage backup')
      return savedCart
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      clearCartStorage()
      return null
    }
  }, [userId])

  // Limpiar localStorage
  const clearCartStorage = useCallback(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
      localStorage.removeItem(CART_TIMESTAMP_KEY)
      console.log('Cart storage cleared')
    } catch (error) {
      console.error('Error clearing cart storage:', error)
    }
  }, [])

  // Verificar si hay datos obsoletos al cargar la app
  const cleanupOldData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const timestampStr = localStorage.getItem(CART_TIMESTAMP_KEY)
      if (!timestampStr) return

      const timestamp = parseInt(timestampStr)
      const maxAge = 24 * 60 * 60 * 1000 // 24 horas
      
      if (Date.now() - timestamp > maxAge) {
        clearCartStorage()
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
      clearCartStorage()
    }
  }, [clearCartStorage])

  // Mergar items del carrito (utilidad para sincronización)
  const mergeCartItems = useCallback((serverCart: Cart, localCart: Cart): CartItem[] => {
    const mergedItems: CartItem[] = [...serverCart.items]
    
    // Agregar items que solo existen en localStorage
    localCart.items.forEach(localItem => {
      const exists = mergedItems.find(item => {
        // Comparar por producto
        if (localItem.bodegon_product_item && item.bodegon_product_item) {
          return localItem.bodegon_product_item === item.bodegon_product_item
        }
        if (localItem.restaurant_product_item && item.restaurant_product_item) {
          return localItem.restaurant_product_item === item.restaurant_product_item
        }
        return false
      })

      if (!exists) {
        mergedItems.push(localItem)
      }
    })

    return mergedItems
  }, [])

  // Efecto para guardar automáticamente
  useEffect(() => {
    if (cart && userId) {
      saveCartToStorage()
    }
  }, [cart, userId, saveCartToStorage])

  // Cleanup al desmontar
  useEffect(() => {
    cleanupOldData()
  }, [cleanupOldData])

  return {
    saveCartToStorage,
    loadCartFromStorage,
    clearCartStorage,
    mergeCartItems,
    cleanupOldData
  }
}

/**
 * Utilidad para obtener información del carrito guardado sin React hooks
 */
export function getStoredCartInfo() {
  if (typeof window === 'undefined') return null

  try {
    const savedData = localStorage.getItem(CART_STORAGE_KEY)
    const timestampStr = localStorage.getItem(CART_TIMESTAMP_KEY)
    
    if (!savedData || !timestampStr) return null

    const timestamp = parseInt(timestampStr)
    const { cart, userId } = JSON.parse(savedData)
    
    return {
      cart,
      userId,
      timestamp,
      age: Date.now() - timestamp,
      isExpired: Date.now() - timestamp > 24 * 60 * 60 * 1000
    }
  } catch (error) {
    console.error('Error getting stored cart info:', error)
    return null
  }
}