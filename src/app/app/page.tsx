'use client'

import { useScreenSize } from '@/hooks/use-screen-size'
import MobileView from '@/components/app/mobile-view'
import DesktopView from '@/components/app/desktop-view'

export default function AppPage() {
  const { isDesktop, isLoading } = useScreenSize(1024)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return isDesktop ? <DesktopView /> : <MobileView />
}