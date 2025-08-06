'use client'

import Image from 'next/image'

interface ProductCardProps {
  emoji: string
  title: string
  description: string
  price: string
  originalPrice?: string
  discount?: string
  hasHeart?: boolean
  isInCart?: boolean
  quantity?: number
  variant?: 'default' | 'horizontal'
  imageUrl?: string
  isLoading?: boolean
  isDecrementing?: boolean
  onAddToCart?: () => void
  onIncrement?: () => void
  onDecrement?: () => void
  onRemoveFromCart?: () => void
  onCardClick?: () => void
}

export default function ProductCard({
  emoji,
  title,
  description,
  price,
  originalPrice,
  discount,
  hasHeart = false,
  isInCart = false,
  quantity = 0,
  variant = 'default',
  imageUrl,
  isLoading = false,
  isDecrementing = false,
  onAddToCart,
  onIncrement,
  onDecrement,
  onRemoveFromCart,
  onCardClick
}: ProductCardProps) {
  const isProductInCart = isInCart || quantity > 0
  
  if (variant === 'horizontal') {
    return (
      <div className="flex-shrink-0 w-40 bg-white rounded-[30px] p-4 flex flex-col">
        <div 
          className="w-full aspect-square bg-gray-100 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden cursor-pointer"
          onClick={onCardClick}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              style={{borderRadius: '16px'}}
            />
          ) : (
            <>
              <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-gray-400 text-xs">Imagen</span>
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center m-auto">
                <span className="text-white text-lg">{emoji}</span>
              </div>
            </>
          )}

          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discount}
            </div>
          )}
        </div>
        <h3 className="text-xs font-semibold text-gray-900 mb-1 leading-tight cursor-pointer line-clamp-2" onClick={onCardClick}>
          {title.length > 25 ? `${title.substring(0, 25)}...` : title}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-grow cursor-pointer" onClick={onCardClick}>{description}</p>
        <div className="mt-auto">
          {originalPrice && discount ? (
            <div className="flex flex-col mb-2">
              <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
              <span className="text-lg font-bold text-gray-900">{price}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900 block mb-2">{price}</span>
          )}
          
          {isProductInCart ? (
            <div className="w-full h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#ED702D'}}>
              <div className="flex items-center justify-between w-full px-2">
                <button 
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold disabled:opacity-50" 
                  style={{color: '#ED702D'}}
                  onClick={onDecrement}
                  disabled={isDecrementing && quantity === 1}
                >
                  {isDecrementing && quantity === 1 ? (
                    <div className="w-3 h-3 border-2 border-[#ED702D] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-lg">-</span>
                  )}
                </button>
                <span className="text-white text-lg font-bold">{quantity}</span>
                <button 
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold" 
                  style={{color: '#ED702D'}}
                  onClick={onIncrement}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="w-full h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50" 
              style={{backgroundColor: '#F6EBE3'}}
              onClick={onAddToCart}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#ED702D] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg font-bold" style={{color: '#ED702D'}}>+</span>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-[30px] p-4 shadow-sm relative">
      {hasHeart && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">❤️</span>
        </div>
      )}
      {discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {discount}
        </div>
      )}
      {imageUrl ? (
        <div className="w-full h-32 mb-3 relative rounded-2xl overflow-hidden cursor-pointer" onClick={onCardClick}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="text-4xl mb-3 cursor-pointer" onClick={onCardClick}>{emoji}</div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 mb-2 cursor-pointer line-clamp-2" onClick={onCardClick}>
        {title.length > 30 ? `${title.substring(0, 30)}...` : title}
      </h3>
      <p className="text-sm text-gray-600 mb-4 cursor-pointer" onClick={onCardClick}>{description}</p>
      
      <div className="mt-auto">
        {originalPrice && discount ? (
          <div className="flex flex-col mb-2">
            <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
            <span className="text-lg font-bold text-gray-900">{price}</span>
          </div>
        ) : (
          <span className="text-lg font-bold text-gray-900 block mb-2">{price}</span>
        )}
        
        {isProductInCart ? (
          <div className="w-full h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#ED702D'}}>
            <div className="flex items-center justify-between w-full px-2">
              <button 
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold disabled:opacity-50" 
                style={{color: '#ED702D'}}
                onClick={onDecrement}
                disabled={isDecrementing && quantity === 1}
              >
                {isDecrementing && quantity === 1 ? (
                  <div className="w-3 h-3 border-2 border-[#ED702D] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg">-</span>
                )}
              </button>
              <span className="text-white text-lg font-bold">{quantity}</span>
              <button 
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold" 
                style={{color: '#ED702D'}}
                onClick={onIncrement}
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="w-full h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50" 
            style={{backgroundColor: '#F6EBE3'}}
            onClick={onAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#ED702D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg font-bold" style={{color: '#ED702D'}}>+</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}