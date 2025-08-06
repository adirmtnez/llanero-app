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
  MapPin,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { TableLoading } from "@/components/ui/table-loading"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

// Mock data for localities
const mockLocalidades = [
  {
    id: '1',
    name: 'Centro Histórico',
    zone: 'Zona Norte',
    deliveryTime: '20-30 min',
    isActive: true,
    createdAt: '2024-01-15',
    restaurantCount: 12
  },
  {
    id: '2',
    name: 'Altamira',
    zone: 'Zona Este',
    deliveryTime: '25-40 min',
    isActive: true,
    createdAt: '2024-01-20',
    restaurantCount: 8
  },
  {
    id: '3',
    name: 'Las Mercedes',
    zone: 'Zona Sur',
    deliveryTime: '15-25 min',
    isActive: false,
    createdAt: '2024-02-01',
    restaurantCount: 5
  },
  {
    id: '4',
    name: 'Chacao',
    zone: 'Zona Este',
    deliveryTime: '30-45 min',
    isActive: true,
    createdAt: '2024-02-10',
    restaurantCount: 15
  }
]

export function RestaurantesLocalidadesPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingLocalidad, setEditingLocalidad] = useState<any>(null)
  const [deletingLocalidad, setDeletingLocalidad] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Filter localities based on active tab
  const filteredLocalidades = mockLocalidades.filter(localidad => {
    const matchesSearch = searchQuery.trim() === "" || 
      localidad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localidad.zone.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      activeFilter === 'all' ||
      (activeFilter === 'active' && localidad.isActive) ||
      (activeFilter === 'inactive' && !localidad.isActive)
    
    return matchesSearch && matchesTab
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100"
  }

  const handleEditLocalidad = (localidad: any) => {
    setEditingLocalidad(localidad)
    setIsEditModalOpen(true)
  }

  const handleDeleteLocalidad = (localidad: any) => {
    setDeletingLocalidad(localidad)
    setIsDeleteModalOpen(true)
  }

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Restaurantes', path: '/restaurantes' },
    { label: 'Localidades', path: '/restaurantes/localidades', isActive: true }
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
            <h1 className="text-2xl font-bold">Localidades de Restaurantes</h1>
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
              <span className="hidden xs:inline">Agregar localidad</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:flex">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Activas</TabsTrigger>
                <TabsTrigger value="inactive">Inactivas</TabsTrigger>
                <TabsTrigger value="add" className="text-muted-foreground">
                  <Plus className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Search and Filter Actions */}
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background w-full sm:min-w-[300px]">
                <Search className={`h-4 w-4 ${loading ? 'animate-pulse' : ''} text-muted-foreground`} />
                <Input
                  placeholder="Buscar localidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                  disabled={loading}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsSearchExpanded(false)
                    setSearchQuery("")
                  }}
                  className="h-auto p-1"
                  disabled={loading}
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

        {/* Localities Table */}
        {loading ? (
          <TableLoading />
        ) : filteredLocalidades.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Localidad</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Tiempo de entrega</TableHead>
                  <TableHead>Restaurantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocalidades.map((localidad) => (
                  <TableRow key={localidad.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{localidad.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Creado: {new Date(localidad.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{localidad.zone}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{localidad.deliveryTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{localidad.restaurantCount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(localidad.isActive)}>
                        {localidad.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLocalidad(localidad)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {localidad.isActive ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteLocalidad(localidad)}
                            className="text-destructive"
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
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                {searchQuery ? "No se encontraron localidades" : "No tienes localidades aún"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Comienza agregando tu primera localidad para restaurantes
                </p>
              )}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o agrega nuevas localidades
                </p>
              )}
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar localidad
            </Button>
          </div>
        )}
      </div>
    </>
  )
}