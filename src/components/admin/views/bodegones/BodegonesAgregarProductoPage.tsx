"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SPABodegonProductForm } from "../../shared/SPABodegonProductForm"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

export function BodegonesAgregarProductoPage() {
  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Bodegones', path: '/bodegones' },
    { label: 'Productos', path: '/bodegones/productos' },
    { label: 'Agregar Producto', path: '/bodegones/productos/agregar', isActive: true }
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

      <SPABodegonProductForm mode="create" />
    </>
  )
}