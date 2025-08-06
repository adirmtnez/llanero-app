'use client'

import { useState } from 'react'
import {
  User,
  KeyRound,
  Tag,
  Bell,
  MapPin,
  HelpCircle,
  Trash2,
  LogOut,
  FileText,
  Shield,
  LogIn
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import BottomNavigation, { TabType } from '@/components/ui/bottom-navigation'

export default function ProfileView({ onBack }: { onBack: () => void }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const handleAuthRedirect = () => {
    router.push('/auth')
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F2F3F6'}}>
      <main className="p-4 space-y-4 pt-12 pb-24">
        {/* Profile Card */}
        {user ? (
          <div className="bg-white p-4 flex items-center space-x-4" style={{borderRadius: '30px'}}>
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">{user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user.full_name || 'Usuario'}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4" style={{borderRadius: '30px'}}>
            <div className="text-center">
              <h2 className="font-semibold text-lg mb-2">¡Bienvenido!</h2>
              <p className="text-gray-500 mb-4">Inicia sesión para acceder a todas las funciones</p>
            </div>
          </div>
        )}

        {/* Menu Options */}
        <div className="bg-white overflow-hidden" style={{borderRadius: '30px'}}>
          {user ? (
            <>
              <button className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Información personal</span>
                </div>
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>

              <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
                <KeyRound className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Cambiar contraseña</span>
              </button>

              <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Cupones</span>
              </button>

              <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Notificaciones</span>
              </button>

              <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Administrar direcciones</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleAuthRedirect}
              className="w-full px-4 py-4 flex items-center justify-center space-x-3 text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-medium">Registrarme / Iniciar sesión</span>
            </button>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-white overflow-hidden" style={{borderRadius: '30px'}}>
          <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Soporte</span>
          </button>

          <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Términos y Condiciones</span>
          </button>

          <button className={`w-full px-4 py-4 flex items-center space-x-3 ${user ? 'border-b border-gray-100' : ''}`}>
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Políticas de Privacidad</span>
          </button>

          {user && (
            <>
              <button className="w-full px-4 py-4 flex items-center space-x-3 border-b border-gray-100">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-red-500">Cerrar mi cuenta</span>
              </button>

              <button 
                onClick={handleSignOut}
                className="w-full px-4 py-4 flex items-center justify-center space-x-2"
              >
                <span className="text-gray-900 font-medium">Desconectarme</span>
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </main>

      {/* Navegación inferior */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onHomeClick={onBack}
      />
    </div>
  )
}