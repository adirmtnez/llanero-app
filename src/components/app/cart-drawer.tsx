'use client'

import { useState } from 'react'
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

interface CartItem {
  id: string
  name: string
  size: string
  price: number
  quantity: number
  image: string
  selected: boolean
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Lowbrase Burger',
      size: 'Small',
      price: 22.00,
      quantity: 1,
      image: '🍔',
      selected: true
    },
    {
      id: '2', 
      name: 'Karkenpo Burger',
      size: 'Big',
      price: 26.00,
      quantity: 1,
      image: '🍔',
      selected: true
    },
    {
      id: '3',
      name: 'Chicken Wings',
      size: 'Medium',
      price: 18.00,
      quantity: 2,
      image: '🍗',
      selected: true
    },
    {
      id: '4',
      name: 'Pizza Margherita',
      size: 'Large',
      price: 32.00,
      quantity: 1,
      image: '🍕',
      selected: true
    },
    {
      id: '5',
      name: 'Caesar Salad',
      size: 'Regular',
      price: 14.00,
      quantity: 1,
      image: '🥗',
      selected: true
    },
    {
      id: '6',
      name: 'Fish Tacos',
      size: 'Small',
      price: 16.00,
      quantity: 3,
      image: '🌮',
      selected: true
    },
    {
      id: '7',
      name: 'Pasta Carbonara',
      size: 'Large',
      price: 24.00,
      quantity: 1,
      image: '🍝',
      selected: true
    },
    {
      id: '8',
      name: 'Chocolate Cake',
      size: 'Slice',
      price: 8.00,
      quantity: 2,
      image: '🍰',
      selected: true
    }
  ])

  const [promoCode, setPromoCode] = useState('')

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const toggleItemSelection = (id: string) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const selectedItems = cartItems.filter(item => item.selected)
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 4.00
  const total = subtotal + shipping

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl [&>button]:hidden [&[id^='radix-']]:!gap-0" style={{ backgroundColor: '#F2F3F6' }}>
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <Button variant="ghost" size="icon" onClick={() => setCartItems([])}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
          <SheetTitle className="text-lg font-semibold">Carrito</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 px-4 max-h-[50vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Cart Items */}
          {cartItems.map((item, index) => (
            <div key={item.id} className={`flex items-start space-x-4 p-4 bg-white rounded-2xl ${index === cartItems.length - 1 ? 'mb-6' : ''}`}>
              {/* Product Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  {item.image}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-900">{item.name}</h3>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3 mt-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
              </div>
              
              {/* Price and Delete */}
              <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 0)}
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
          <div className="space-y-2 w-full">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
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
          <PrimaryButton>
            PAGAR
          </PrimaryButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}