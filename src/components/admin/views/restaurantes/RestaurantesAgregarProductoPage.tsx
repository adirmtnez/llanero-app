"use client"

import { useEffect } from 'react'
import { useAdminStore } from '@/store/admin/admin-store'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AdminBreadcrumb } from '../../shared/AdminBreadcrumb'

// Import the existing form component but we'll adapt it for SPA
import { SPARestaurantProductForm } from '../../shared/SPARestaurantProductForm'

export function RestaurantesAgregarProductoPage() {
  const { setBreadcrumb } = useAdminStore()

  useEffect(() => {
    // Only set breadcrumb on client side to avoid hydration issues
    if (typeof window !== 'undefined') {
      const breadcrumbItems = [
        { label: 'Admin', path: '/' },
        { label: 'Restaurantes', path: '/restaurantes' },
        { label: 'Productos', path: '/restaurantes/productos' },
        { label: 'Agregar Producto', path: '/restaurantes/productos/agregar', isActive: true }
      ]
      setBreadcrumb(breadcrumbItems)
    }
  }, [setBreadcrumb])

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Restaurantes', path: '/restaurantes' },
    { label: 'Productos', path: '/restaurantes/productos' },
    { label: 'Agregar Producto', path: '/restaurantes/productos/agregar', isActive: true }
  ]

  return (
    <>
      <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <AdminBreadcrumb items={breadcrumbItems} />
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        <SPARestaurantProductForm mode="create" />
      </div>
    </>
  )
}