'use client'

import {
  House,
  Search,
  ClipboardList,
  User
} from 'lucide-react'

export type TabType = 'house' | 'search' | 'orders' | 'profile'

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onHomeClick?: () => void
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange,
  onHomeClick 
}: BottomNavigationProps) {
  
  const handleTabClick = (tab: TabType) => {
    onTabChange(tab)
    if (tab === 'house' && onHomeClick) {
      onHomeClick()
    }
  }

  const getIconColor = (tab: TabType) => {
    return activeTab === tab ? '#000' : '#99A1AF'
  }

  const getTextColor = (tab: TabType) => {
    return activeTab === tab ? 'text-black' : 'text-gray-400'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
      <div className="flex justify-around items-center">
        {/* Inicio */}
        <button 
          onClick={() => handleTabClick('house')}
          className={`flex flex-col items-center py-2 transition-colors duration-200 ${getTextColor('house')}`}
        >
          <House className="w-6 h-6 mb-1" style={{ color: getIconColor('house') }} />
          <span className="text-xs">Inicio</span>
        </button>

        {/* Buscar */}
        <button 
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center py-2 transition-colors duration-200 ${getTextColor('search')}`}
        >
          <Search className="w-6 h-6 mb-1" style={{ color: getIconColor('search') }} />
          <span className="text-xs">Buscar</span>
        </button>

        {/* Pedidos */}
        <button 
          onClick={() => handleTabClick('orders')}
          className={`flex flex-col items-center py-2 transition-colors duration-200 ${getTextColor('orders')}`}
        >
          <ClipboardList className="w-6 h-6 mb-1" style={{ color: getIconColor('orders') }} />
          <span className="text-xs">Pedidos</span>
        </button>

        {/* Perfil */}
        <button 
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center py-2 transition-colors duration-200 ${getTextColor('profile')}`}
        >
          <User className="w-6 h-6 mb-1" style={{ color: getIconColor('profile') }} />
          <span className="text-xs">Perfil</span>
        </button>
      </div>
    </nav>
  )
}