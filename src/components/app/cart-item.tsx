'use client'

import Image from 'next/image'
import { CartItem as CartItemType } from '@/types/products'

interface CartItemProps {
  item: CartItemType
  onIncrement: (orderItemId: string) => void
  onDecrement: (orderItemId: string) => void
  onRemove: (orderItemId: string) => void
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  const productData = item.product_data
  const imageUrl = productData?.image_gallery_urls?.[0]
  const itemTotal = item.quantity * item.price

  return (
    <div className="flex items-center space-x-3 py-4 border-b border-gray-100 last:border-b-0">
      {/* Imagen del producto */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name_snapshot}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">
            <span className="text-2xl">
              {item.product_type === 'bodegon' ? '🛒' : '🍽️'}
            </span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name_snapshot}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          ${item.price.toFixed(2)} c/u
        </p>
        {item.product_type === 'restaurant' && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
            Restaurante
          </span>
        )}
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center space-x-2">
        {/* Botón decrementar */}
        <button
          onClick={() => onDecrement(item.id)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          disabled={item.quantity <= 1}
        >
          {item.quantity <= 1 ? (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          )}
        </button>

        {/* Cantidad */}
        <span className="w-8 text-center text-sm font-medium text-gray-900">
          {item.quantity}
        </span>

        {/* Botón incrementar */}
        <button
          onClick={() => onIncrement(item.id)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Precio total y botón eliminar */}
      <div className="flex flex-col items-end space-y-2">
        <span className="text-sm font-semibold text-gray-900">
          ${itemTotal.toFixed(2)}
        </span>
        
        {/* Botón eliminar */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Eliminar del carrito"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}