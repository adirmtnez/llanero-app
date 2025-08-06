'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrimaryButton } from '@/components/ui/primary-button'
import { useCart } from '@/hooks/use-cart'
import CartItem from './cart-item'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
  userId?: string
}

export default function CartDrawer({ isOpen, onClose, onCheckout, userId }: CartDrawerProps) {
  const { 
    cart, 
    isLoading, 
    error,
    updateQuantity: updateCartQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    totalItems,
    totalAmount
  } = useCart(userId)

  const [promoCode, setPromoCode] = useState('')

  const handleIncrement = async (orderItemId: string) => {
    const item = cart?.items.find(item => item.id === orderItemId)
    if (item) {
      await updateCartQuantity(orderItemId, item.quantity + 1)
    }
  }

  const handleDecrement = async (orderItemId: string) => {
    const item = cart?.items.find(item => item.id === orderItemId)
    if (item) {
      if (item.quantity <= 1) {
        await removeFromCart(orderItemId)
      } else {
        await updateCartQuantity(orderItemId, item.quantity - 1)
      }
    }
  }

  const handleRemove = async (orderItemId: string) => {
    await removeFromCart(orderItemId)
  }

  const handleClearCart = async () => {
    await clearCart()
  }

  const shipping = cart && cart.items.length > 0 ? 4.00 : 0
  const total = totalAmount + shipping

  // Refrescar carrito cuando se abre el drawer
  useEffect(() => {
    if (isOpen && userId) {
      refreshCart()
    }
  }, [isOpen, userId, refreshCart])


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl [&>button]:hidden [&[id^='radix-']]:!gap-0" style={{ backgroundColor: '#F2F3F6' }}>
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <Button variant="ghost" size="icon" onClick={handleClearCart} disabled={!cart?.items.length}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
          <SheetTitle className="text-lg font-semibold">
            Carrito {cart?.items.length ? `(${totalItems})` : ''}
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 px-4 max-h-[50vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Empty Cart */}
          {!isLoading && !error && (!cart?.items.length) && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-sm">Agrega algunos productos para comenzar</p>
            </div>
          )}

          {/* Cart Items */}
          {!isLoading && cart?.items.map((item, index) => (
            <div key={item.id} className={`flex items-start space-x-4 p-4 bg-white rounded-2xl ${index === cart.items.length - 1 ? 'mb-6' : ''}`}>
              {/* Product Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  {item.product_data?.image_gallery_urls?.[0] ? (
                    <img 
                      src={item.product_data.image_gallery_urls[0]} 
                      alt={item.name_snapshot}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span>{item.product_type === 'bodegon' ? '🛒' : '🍽️'}</span>
                  )}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{item.name_snapshot}</h3>
                <p className="text-xs text-gray-500 mt-1">${item.price.toFixed(2)} c/u</p>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3 mt-2">
                  <button 
                    onClick={() => handleDecrement(item.id)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => handleIncrement(item.id)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
              </div>
              
              {/* Price and Delete */}
              <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                <span className="text-lg font-bold">${(item.quantity * item.price).toFixed(2)}</span>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="space-y-3 bg-white p-4 border-t rounded-t-[30px]">
          {/* Promo Code */}
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-2xl bg-white w-full">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <Input 
              type="text"
              placeholder="Ingresa tu código promocional"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none text-gray-600 focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Price Summary */}
          {cart?.items.length ? (
            <>
              <div className="space-y-2 w-full">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Monto total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <PrimaryButton disabled={isLoading} onClick={onCheckout}>
                {isLoading ? 'Procesando...' : 'PAGAR'}
              </PrimaryButton>
            </>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}