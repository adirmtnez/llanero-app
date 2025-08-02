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
  Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { toast } from "sonner"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteCategoryModal } from "@/components/modals/delete-category-modal"
import { useBodegonCategories, BodegonCategory } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories, RestaurantCategory } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

export default function CategoriasPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<(BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' }) | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  const { categories: bodegonCategories, loading: bodegonLoading, refreshCategories: refreshBodegonCategories, updateCategory: updateBodegonCategory } = useBodegonCategories()
  const { categories: restaurantCategories, loading: restaurantLoading, refreshCategories: refreshRestaurantCategories, updateCategory: updateRestaurantCategory } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  
  // Helper function to get restaurant name by ID
  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId)
    return restaurant ? restaurant.name : 'N/A'
  }
  
  // Combine categories with type information
  const allCategories = [
    ...bodegonCategories.map(cat => ({ ...cat, categoryType: 'bodegon' as const })),
    ...restaurantCategories.map(cat => ({ ...cat, categoryType: 'restaurant' as const }))
  ]
  
  // Filter categories based on active tab
  const filteredCategories = allCategories.filter(category => {
    if (activeTab === 'all') return true
    if (activeTab === 'bodegon') return category.categoryType === 'bodegon'
    if (activeTab === 'restaurant') return category.categoryType === 'restaurant'
    if (activeTab === 'visible') return category.is_active
    if (activeTab === 'hidden') return !category.is_active
    return true
  })
  
  const loading = bodegonLoading || restaurantLoading
  const categories = filteredCategories

  // Helper functions for category actions
  const handleEditCategory = (category: (BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' })) => {
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const handleDeleteCategory = (category: (BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' })) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  const handleToggleActive = async (category: (BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' })) => {
    try {
      const updateCategory = category.categoryType === 'bodegon' ? updateBodegonCategory : updateRestaurantCategory
      const result = await updateCategory(category.id, {
        is_active: !category.is_active
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(
        category.is_active 
          ? "Categoría desactivada exitosamente" 
          : "Categoría activada exitosamente"
      )

      // Refresh data
      refreshBodegonCategories()
      refreshRestaurantCategories()
    } catch (error: any) {
      console.error('Error toggling category status:', error)
      toast.error("Error al cambiar estado", {
        description: error.message || "Ocurrió un error inesperado"
      })
    }
  }

  const handleModalSuccess = async () => {
    console.log('🔄 handleModalSuccess called - refreshing categories')
    await Promise.all([
      refreshBodegonCategories(),
      refreshRestaurantCategories()
    ])
    setSelectedCategory(null)
    console.log('🔄 Categories refresh completed')
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
                <BreadcrumbLink href="/admin/productos">
                  Productos
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Categorías</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Categorías</h1>
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
                <DropdownMenuItem>Eliminar seleccionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none justify-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Agregar categoría</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 sm:w-auto sm:flex">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="bodegon">Bodegón</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurante</TabsTrigger>
              <TabsTrigger value="visible">Activas</TabsTrigger>
              <TabsTrigger value="hidden">Inactivas</TabsTrigger>
              <TabsTrigger value="add" className="text-muted-foreground">
                <Plus className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background w-full sm:min-w-[300px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categorías..."
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

        {/* Categories table */}
        {loading ? (
          <TableSkeleton 
            rows={5} 
            columns={4} 
            showCheckbox={true} 
            showActions={true}
          />
        ) : categories.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Nombre</TableHead>
                    <TableHead className="min-w-[100px]">Tipo</TableHead>
                    <TableHead className="min-w-[150px]">Restaurante</TableHead>
                    <TableHead className="min-w-[120px]">Productos</TableHead>
                    <TableHead className="min-w-[100px]">Estatus</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {category.image ? (
                              <img 
                                src={category.image} 
                                alt={category.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="truncate">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={category.categoryType === 'bodegon' 
                            ? "bg-blue-50 text-blue-700 border-blue-200" 
                            : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {category.categoryType === 'bodegon' ? 'Bodegón' : 'Restaurante'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category.categoryType === 'restaurant' && 'restaurant_id' in category ? (
                          <span className="text-sm text-muted-foreground">
                            {getRestaurantName(category.restaurant_id)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">0</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className={category.is_active 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {category.is_active ? "Activa" : "Inactiva"}
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
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                              {category.is_active ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category)}
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
              <Plus className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                No tienes categorías aún
              </p>
              <p className="text-sm text-muted-foreground">
                Las categorías se muestran desde datos mock locales
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar categoría
            </Button>
          </div>
        )}

        {/* Add Category Modal */}
        <AddCategoryModal 
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={handleModalSuccess}
        />

        {/* Edit Category Modal */}
        <EditCategoryModal 
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open)
            if (!open) setSelectedCategory(null)
          }}
          category={selectedCategory}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Category Modal */}
        <DeleteCategoryModal 
          open={showDeleteModal}
          onOpenChange={(open) => {
            setShowDeleteModal(open)
            if (!open) setSelectedCategory(null)
          }}
          category={selectedCategory}
          onSuccess={handleModalSuccess}
        />
      </div>
    </>
  )
}