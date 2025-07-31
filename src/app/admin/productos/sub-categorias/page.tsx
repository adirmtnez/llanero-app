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
import { AddSubcategoryModal } from "@/components/modals/add-subcategory-modal"
import { EditSubcategoryModal } from "@/components/modals/edit-subcategory-modal"
import { DeleteSubcategoryModal } from "@/components/modals/delete-subcategory-modal"
import { useBodegonSubcategories, BodegonSubcategory } from "@/hooks/use-bodegon-subcategories"
import { useRestaurantSubcategories, RestaurantSubcategory } from "@/hooks/use-restaurant-subcategories"
import { useBodegonCategories } from "@/hooks/use-bodegon-categories"
import { useRestaurantCategories } from "@/hooks/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

export default function SubCategoriasPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<(BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' }) | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  const { subcategories: bodegonSubcategories, loading: bodegonLoading, refreshSubcategories: refreshBodegonSubcategories, updateSubcategory: updateBodegonSubcategory } = useBodegonSubcategories()
  const { subcategories: restaurantSubcategories, loading: restaurantLoading, refreshSubcategories: refreshRestaurantSubcategories, updateSubcategory: updateRestaurantSubcategory } = useRestaurantSubcategories()
  const { categories: bodegonCategories } = useBodegonCategories()
  const { categories: restaurantCategories } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  
  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string, type: 'bodegon' | 'restaurant') => {
    const categories = type === 'bodegon' ? bodegonCategories : restaurantCategories
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'N/A'
  }
  
  // Helper function to get restaurant name by ID
  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId)
    return restaurant ? restaurant.name : 'N/A'
  }
  
  // Combine subcategories with type information
  const allSubcategories = [
    ...bodegonSubcategories.map(sub => ({ ...sub, subcategoryType: 'bodegon' as const })),
    ...restaurantSubcategories.map(sub => ({ ...sub, subcategoryType: 'restaurant' as const }))
  ]
  
  // Filter subcategories based on active tab
  const filteredSubcategories = allSubcategories.filter(subcategory => {
    if (activeTab === 'all') return true
    if (activeTab === 'bodegon') return subcategory.subcategoryType === 'bodegon'
    if (activeTab === 'restaurant') return subcategory.subcategoryType === 'restaurant'
    if (activeTab === 'visible') return subcategory.is_active
    if (activeTab === 'hidden') return !subcategory.is_active
    return true
  })
  
  const loading = bodegonLoading || restaurantLoading
  const subCategories = filteredSubcategories

  // Helper functions for subcategory actions
  const handleEditSubcategory = (subcategory: (BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' })) => {
    setSelectedSubcategory(subcategory)
    setShowEditModal(true)
  }

  const handleDeleteSubcategory = (subcategory: (BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' })) => {
    setSelectedSubcategory(subcategory)
    setShowDeleteModal(true)
  }

  const handleToggleActive = async (subcategory: (BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' })) => {
    try {
      const updateSubcategory = subcategory.subcategoryType === 'bodegon' ? updateBodegonSubcategory : updateRestaurantSubcategory
      const result = await updateSubcategory(subcategory.id, {
        is_active: !subcategory.is_active
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(
        subcategory.is_active 
          ? "Subcategoría desactivada exitosamente" 
          : "Subcategoría activada exitosamente"
      )

      // Refresh data
      refreshBodegonSubcategories()
      refreshRestaurantSubcategories()
    } catch (error: any) {
      console.error('Error toggling subcategory status:', error)
      toast.error("Error al cambiar estado", {
        description: error.message || "Ocurrió un error inesperado"
      })
    }
  }

  const handleModalSuccess = () => {
    refreshBodegonSubcategories()
    refreshRestaurantSubcategories()
    setSelectedSubcategory(null)
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
                <BreadcrumbPage>Sub Categorías</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Sub Categorías</h1>
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
              <span className="hidden xs:inline">Agregar subcategoría</span>
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
                  placeholder="Buscar sub categorías..."
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

        {/* Sub Categories table */}
        {loading ? (
          <TableSkeleton 
            rows={5} 
            columns={5} 
            showCheckbox={true} 
            showActions={true}
          />
        ) : subCategories.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[180px]">Nombre</TableHead>
                    <TableHead className="min-w-[100px]">Tipo</TableHead>
                    <TableHead className="min-w-[150px]">Categoría</TableHead>
                    <TableHead className="min-w-[150px]">Restaurante</TableHead>
                    <TableHead className="min-w-[120px]">Productos</TableHead>
                    <TableHead className="min-w-[100px]">Estatus</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subCategories.map((subCategory) => (
                    <TableRow key={subCategory.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {subCategory.image ? (
                              <img 
                                src={subCategory.image} 
                                alt={subCategory.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="truncate">{subCategory.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={subCategory.subcategoryType === 'bodegon' 
                            ? "bg-blue-50 text-blue-700 border-blue-200" 
                            : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {subCategory.subcategoryType === 'bodegon' ? 'Bodegón' : 'Restaurante'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="truncate block">{getCategoryName(subCategory.parent_category, subCategory.subcategoryType)}</span>
                      </TableCell>
                      <TableCell>
                        {subCategory.subcategoryType === 'restaurant' && 'restaurant_id' in subCategory ? (
                          <span className="text-sm text-muted-foreground">
                            {getRestaurantName(subCategory.restaurant_id)}
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
                          className={subCategory.is_active 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {subCategory.is_active ? "Activa" : "Inactiva"}
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
                            <DropdownMenuItem onClick={() => handleEditSubcategory(subCategory)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(subCategory)}>
                              {subCategory.is_active ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteSubcategory(subCategory)}
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
                No tienes sub categorías aún
              </p>
              <p className="text-sm text-muted-foreground">
                Las sub categorías se muestran desde datos mock locales
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar subcategoría
            </Button>
          </div>
        )}

        {/* Add Subcategory Modal */}
        <AddSubcategoryModal 
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={handleModalSuccess}
        />

        {/* Edit Subcategory Modal */}
        <EditSubcategoryModal 
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open)
            if (!open) setSelectedSubcategory(null)
          }}
          subcategory={selectedSubcategory}
          onSuccess={handleModalSuccess}
        />

        {/* Delete Subcategory Modal */}
        <DeleteSubcategoryModal 
          open={showDeleteModal}
          onOpenChange={(open) => {
            setShowDeleteModal(open)
            if (!open) setSelectedSubcategory(null)
          }}
          subcategory={selectedSubcategory}
          onSuccess={handleModalSuccess}
        />
      </div>
    </>
  )
}