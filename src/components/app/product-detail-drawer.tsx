'use client'

import { useState, useEffect } from "react"
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { ArrowLeft, Star, Truck, Clock } from "lucide-react"

interface ProductDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  product?: {
    emoji: string
    title: string
    description: string
    price: string
    originalPrice?: string
    discount?: string
    quantity: number
    imageUrl?: string
  }
  onAddToCart?: () => void
  onIncrement?: () => void
  onDecrement?: () => void
}

export default function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onIncrement,
  onDecrement
}: ProductDetailDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  useEffect(() => {
    setInternalOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setInternalOpen(false)
    // Delay calling onClose to allow animation to complete
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!product) return null

  const isProductInCart = product.quantity > 0

  return (
    <Sheet open={internalOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
      }
    }}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[30px] [&>button]:hidden [&[id^='radix-']]:!gap-0">
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={handleClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <SheetTitle className="text-lg font-semibold">Detalles del Producto</SheetTitle>
          <div className="w-9" /> {/* Spacer for centering */}
        </SheetHeader>
        
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Imagen del producto */}
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 rounded-[20px] flex items-center justify-center">
                <span className="text-white text-4xl">{product.emoji}</span>
              </div>
            )}
            
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                Discount {product.discount}
              </div>
            )}
          </div>

          {/* Título y precio */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{product.title}</h2>
            <div className="flex items-center space-x-2 mb-3">
              {product.originalPrice && product.discount ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                  <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{product.price}</span>
              )}
            </div>
          </div>


          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 bg-white">
          <div className="flex items-center space-x-4">
            {/* Controles de cantidad */}
            <div className="flex items-center">
              <button 
                className="w-14 h-14 border border-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50" 
                onClick={onDecrement}
              >
                <span className="text-lg">-</span>
              </button>
              <span className="text-xl font-bold text-gray-900 px-4">{product.quantity || 1}</span>
              <button 
                className="w-14 h-14 border border-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50" 
                onClick={onIncrement}
              >
                <span className="text-lg">+</span>
              </button>
            </div>
            
            {/* Botón Add to Cart */}
            <button 
              className="flex-1 min-h-[56px] rounded-full flex items-center justify-center text-white transition-colors hover:opacity-90" 
              style={{
                backgroundColor: '#ED702E',
                fontSize: '16px',
                fontWeight: '500'
              }}
              onClick={onAddToCart}
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}