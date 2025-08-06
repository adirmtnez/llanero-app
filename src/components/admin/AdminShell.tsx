"use client"

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { useEffect, useState } from 'react'
import { Loader2 } from "lucide-react"

// Import views (we'll create these next)
import { DashboardView } from './views/DashboardView'
import { BodegonesView } from './views/BodegonesView'
import { RestaurantesView } from './views/RestaurantesView'
import { ConfiguracionesView } from './views/ConfiguracionesView'
import { PedidosView } from './views/PedidosView'
import { EquipoView } from './views/EquipoView'
import { MetodosPagoView } from './views/MetodosPagoView'
import { RepartidoresView } from './views/RepartidoresView'

export function AdminShell() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          <span className="text-gray-600 font-medium">Iniciando administración...</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter basename="/admin">
      <SidebarProvider>
        <AdminSidebar />
        <AdminTopbar />
        <SidebarInset className="bg-[#F8F9FA] pt-20 md:pt-0">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardView />} />
            
            {/* Bodegones - handles all sub-routes internally */}
            <Route path="/bodegones/*" element={<BodegonesView />} />
            
            {/* Restaurantes - handles all sub-routes internally */}
            <Route path="/restaurantes/*" element={<RestaurantesView />} />
            
            {/* Configuraciones - handles all sub-routes internally */}
            <Route path="/configuraciones/*" element={<ConfiguracionesView />} />
            
            {/* Simple views */}
            <Route path="/pedidos" element={<PedidosView />} />
            <Route path="/equipo" element={<EquipoView />} />
            <Route path="/metodos-pago" element={<MetodosPagoView />} />
            <Route path="/repartidores" element={<RepartidoresView />} />
            <Route path="/marketing" element={<div className="p-4"><h1>Marketing</h1><p>Vista en desarrollo</p></div>} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </BrowserRouter>
  )
}