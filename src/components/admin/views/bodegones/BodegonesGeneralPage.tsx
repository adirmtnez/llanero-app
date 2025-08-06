"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ChevronDown, 
  Download, 
  Upload, 
  MoreHorizontal, 
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Store,
  Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { AddBodegonModal } from "@/components/modals/add-bodegon-modal"
import { EditBodegonModal } from "@/components/modals/edit-bodegon-modal"
import { DeleteBodegonModal } from "@/components/modals/delete-bodegon-modal"
import { useBodegones } from "@/hooks/use-bodegones"
import { TableLoading } from "@/components/ui/table-loading"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

export function BodegonesGeneralPage() {
  const { bodegones: mockBodegones, loading, error, refreshBodegones, isConfigured } = useBodegones()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBodegon, setEditingBodegon] = useState<any>(null)
  const [deletingBodegon, setDeletingBodegon] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  
  // Map bodegones data for table display
  const allBodegones = mockBodegones.map(bodegon => ({
        id: bodegon.id,
        name: bodegon.name,
        productCount: 0, // Por ahora 0, después podemos contar productos
        status: bodegon.is_active === false ? "Inactivo" : "Activo"
      }))

  // Filter bodegones based on active tab
  const bodegones = allBodegones.filter(bodegon => {
    switch (activeFilter) {
      case "active":
        return bodegon.status === "Activo"
      case "inactive":
        return bodegon.status === "Inactivo"
      default:
        return true // "all" shows all
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Inactivo":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Bodegones', path: '/bodegones', isActive: true }
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
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Bodegones</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="hidden sm:inline">Más acciones</span>
                  <span className="sm:hidden">Acciones</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="sm:hidden">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </DropdownMenuItem>
                <DropdownMenuItem>Exportar seleccionados</DropdownMenuItem>
                <DropdownMenuItem>Edición masiva</DropdownMenuItem>
                <DropdownMenuItem>Desactivar seleccionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none justify-center"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Agregar bodegón</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs defaultValue="all" className="w-auto overflow-x-auto" onValueChange={(value) => setActiveFilter(value)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:flex">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs sm:text-sm">Inactivos</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background w-full sm:min-w-[300px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar bodegones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsSearchExpanded(false)
                    setSearchQuery("")
                  }}
                  className="h-auto p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSearchExpanded(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error al cargar bodegones</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7"
                  onClick={refreshBodegones}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bodegones table */}
        {loading ? (
          <TableLoading rows={5} columns={4} showCheckbox={true} showActions={true} />
        ) : bodegones.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Nombre</TableHead>
                    <TableHead className="min-w-[120px]">Productos</TableHead>
                    <TableHead className="min-w-[100px]">Estatus</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bodegones.map((bodegon) => (
                    <TableRow key={bodegon.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                          <span className="truncate">{bodegon.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{bodegon.productCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className={getStatusColor(bodegon.status)}
                        >
                          {bodegon.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                const fullBodegon = mockBodegones.find(b => b.id === bodegon.id)
                                if (fullBodegon) {
                                  setEditingBodegon(fullBodegon)
                                  setIsEditModalOpen(true)
                                }
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                const fullBodegon = mockBodegones.find(b => b.id === bodegon.id)
                                if (fullBodegon) {
                                  setDeletingBodegon(fullBodegon)
                                }
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Store className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                {!isConfigured
                    ? "Los bodegones se muestran desde datos mock"
                    : activeFilter === "active"
                      ? "No hay bodegones activos"
                      : activeFilter === "inactive"
                        ? "No hay bodegones inactivos"
                        : "No tienes bodegones aún"
                }
              </p>
              {!isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Los bodegones se muestran desde datos mock para demostración
                </p>
              )}
              {isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Agrega bodegones para expandir tu red de distribución y llegar a más clientes
                </p>
              )}
            </div>
            {isConfigured && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar bodegón
              </Button>
            )}
          </div>
        ) : null}

        <AddBodegonModal 
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={() => {
            refreshBodegones()
          }}
        />

        <EditBodegonModal 
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) {
              setEditingBodegon(null)
            }
          }}
          bodegon={editingBodegon}
          onSuccess={() => {
            refreshBodegones()
            setIsEditModalOpen(false)
            setEditingBodegon(null)
          }}
        />

        <DeleteBodegonModal 
          open={!!deletingBodegon}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingBodegon(null)
            }
          }}
          bodegon={deletingBodegon}
          onSuccess={() => {
            refreshBodegones()
          }}
        />
      </div>
    </>
  )
}