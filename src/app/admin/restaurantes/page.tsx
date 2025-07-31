"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  UtensilsCrossed,
  Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { AddRestaurantModal } from "@/components/modals/add-restaurant-modal"
import { EditRestaurantModal } from "@/components/modals/edit-restaurant-modal"
import { DeleteRestaurantModal } from "@/components/modals/delete-restaurant-modal"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useRouter } from "next/navigation"
import { TableSkeleton } from "@/components/ui/table-skeleton"

const demoRestaurantes = [
  {
    id: "1",
    name: "Pizza Express",
    productCount: 25,
    status: "Activo",
  },
  {
    id: "2", 
    name: "Burger Palace",
    productCount: 18,
    status: "Activo",
  },
  {
    id: "3",
    name: "Tacos El Rincón",
    productCount: 22,
    status: "Inactivo",
  },
  {
    id: "4",
    name: "Sushi House",
    productCount: 35,
    status: "Activo",
  },
  {
    id: "5",
    name: "Pollo Dorado",
    productCount: 12,
    status: "Pendiente",
  },
  {
    id: "6",
    name: "Café Central",
    productCount: 28,
    status: "Activo",
  },
]

export default function RestaurantesPage() {
  const { restaurants: mockRestaurants, loading, error, refreshRestaurants, isConfigured } = useRestaurants()
  const router = useRouter()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const [deletingRestaurant, setDeletingRestaurant] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  
  // Usar datos mock
  const allRestaurantes = mockRestaurants.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    productCount: 0, // Por ahora 0, después podemos contar productos
    status: restaurant.is_active === false ? "Inactivo" : "Activo"
  }))

  // Filtrar restaurantes basado en la tab activa
  const restaurantes = allRestaurantes.filter(restaurant => {
    switch (activeFilter) {
      case "active":
        return restaurant.status === "Activo"
      case "inactive":
        return restaurant.status === "Inactivo"
      default:
        return true // "all" muestra todos
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

  return (
    <>
      <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Restaurantes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Restaurantes</h1>
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
              <span className="hidden xs:inline">Agregar restaurante</span>
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
                  placeholder="Buscar restaurantes..."
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
                <p className="text-sm font-medium text-red-800">Error al cargar restaurantes</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7"
                  onClick={refreshRestaurants}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurantes table */}
        {loading ? (
          <TableSkeleton 
            rows={5} 
            columns={5} 
            showCheckbox={true} 
            showActions={true}
          />
        ) : restaurantes.length > 0 ? (
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
                  {restaurantes.map((restaurante) => (
                    <TableRow key={restaurante.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                          <span className="truncate">{restaurante.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{restaurante.productCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className={getStatusColor(restaurante.status)}
                        >
                          {restaurante.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                const fullRestaurant = mockRestaurants.find(r => r.id === restaurante.id)
                                if (fullRestaurant) {
                                  setEditingRestaurant(fullRestaurant)
                                  setIsEditModalOpen(true)
                                }
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                const fullRestaurant = mockRestaurants.find(r => r.id === restaurante.id)
                                if (fullRestaurant) {
                                  setDeletingRestaurant(fullRestaurant)
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
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                {!isConfigured
                  ? "Los restaurantes se muestran desde datos mock"
                  : activeFilter === "active"
                    ? "No hay restaurantes activos"
                    : activeFilter === "inactive"
                      ? "No hay restaurantes inactivos"
                      : "No tienes restaurantes aún"
                }
              </p>
              {!isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Los restaurantes se muestran desde datos mock para demostración
                </p>
              )}
              {isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Agrega restaurantes para ampliar tu oferta gastronómica y atraer más clientes
                </p>
              )}
            </div>
            {isConfigured && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar restaurante
              </Button>
            )}
          </div>
        )}

        <AddRestaurantModal 
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={() => {
            refreshRestaurants()
          }}
        />

        <EditRestaurantModal 
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) {
              setEditingRestaurant(null)
            }
          }}
          restaurant={editingRestaurant}
          onSuccess={() => {
            refreshRestaurants()
            setIsEditModalOpen(false)
            setEditingRestaurant(null)
          }}
        />

        <DeleteRestaurantModal 
          open={!!deletingRestaurant}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingRestaurant(null)
            }
          }}
          restaurant={deletingRestaurant}
          onSuccess={() => {
            refreshRestaurants()
            router.push('/admin/restaurantes')
          }}
        />
      </div>
    </>
  )
}