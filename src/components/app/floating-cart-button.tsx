'use client'

interface FloatingCartButtonProps {
  totalItems: number
  onClick: () => void
  isVisible?: boolean
}

export default function FloatingCartButton({ 
  totalItems, 
  onClick, 
  isVisible = true 
}: FloatingCartButtonProps) {
  if (!isVisible || totalItems === 0) return null

  return (
    <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-in-out ${
      totalItems > 0 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
    }`}>
      <button 
        onClick={onClick}
        className="bg-black text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors duration-200 active:scale-95 transform"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        <span className="text-sm font-medium">
          {totalItems} producto{totalItems !== 1 ? 's' : ''}
        </span>
      </button>
    </div>
  )
}