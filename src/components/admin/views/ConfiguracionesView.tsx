"use client"

import { useState } from 'react'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminBreadcrumb } from "../shared/AdminBreadcrumb"
import { ConfiguracionesGeneralesPage } from './configuraciones/ConfiguracionesGeneralesPage'
import { ConfiguracionesNotificacionesPage } from './configuraciones/ConfiguracionesNotificacionesPage'
import { ConfiguracionesIntegracionesPage } from './configuraciones/ConfiguracionesIntegracionesPage'
import { ConfiguracionesSeguridad } from './configuraciones/ConfiguracionesSeguridad'

export function ConfiguracionesView() {
  const [activeTab, setActiveTab] = useState('estatus')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'integraciones':
        return <ConfiguracionesIntegracionesPage />
      case 'notificaciones':
        return <ConfiguracionesNotificacionesPage />
      case 'seguridad':
        return <ConfiguracionesSeguridad />
      default:
        return <ConfiguracionesGeneralesPage />
    }
  }

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Configuraciones', path: '/configuraciones', isActive: true }
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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Configuraciones</h1>
          <p className="text-muted-foreground">Gestiona la configuración de tu aplicación</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:flex">
            <TabsTrigger value="estatus">Estatus de App</TabsTrigger>
            <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {renderContent()}
      </div>
    </>
  )
}