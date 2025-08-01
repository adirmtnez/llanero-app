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
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRestaurantProducts } from "@/hooks/restaurants/use-restaurant-products"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurantSubcategories } from "@/hooks/restaurants/use-restaurant-subcategories"
import { useRestaurants } from "@/hooks/use-restaurants"
import { BodegonProduct } from "@/types/products"
import { Pagination } from "@/components/ui/pagination"
import { RestaurantProductsTable } from "@/components/restaurants/products-table"

export default function RestaurantesProductosPage() {
  const router = useRouter()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [realProducts, setRealProducts] = useState<BodegonProduct[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all')
  
  const { getProducts, deleteProduct, loading, formatPrice } = useRestaurantProducts()
  const { categories: restaurantCategories } = useRestaurantCategories()
  const { subcategories: restaurantSubcategories } = useRestaurantSubcategories()
  const { restaurants } = useRestaurants()
  
  // Función para obtener el nombre de categoría
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Sin categoría"
    const category = restaurantCategories.find(cat => cat.id === categoryId)
    return category?.name || "Sin categoría"
  }
  
  // Función para obtener el nombre del restaurante
  const getRestaurantName = (restaurantId?: string) => {
    if (!restaurantId) return "Sin restaurante"
    const restaurant = restaurants.find(rest => rest.id === restaurantId)
    return restaurant?.name || "Sin restaurante"
  }

  // Función para mapear productos reales al formato de la tabla
  const mapProductToTableFormat = (product: BodegonProduct) => ({
    id: product.id,
    name: product.name,
    status: product.is_active_product ? "Active" : "Inactive",
    category: getCategoryName(product.category_id),
    restaurant: product.restaurant_id ? getRestaurantName(product.restaurant_id) : "Sin restaurante",
    price: formatPrice(product.price),
    raw: product // Mantener el objeto original para operaciones
  })

  const products = realProducts.map(mapProductToTableFormat)

  // Cargar productos reales de restaurante
  const loadProducts = async () => {
    const result = await getProducts(
      { 
        search: searchQuery,
        restaurant_id: selectedRestaurant && selectedRestaurant !== 'all' ? selectedRestaurant : undefined
      },
      { page: currentPage, limit: pageSize }
    )
    setRealProducts(result.products)
    setTotalPages(result.pagination.totalPages)
    setTotalItems(result.pagination.total)
  }

  // Funciones de manejo de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Cargar productos cuando cambie la página, búsqueda, restaurante o tamaño de página
  useEffect(() => {
    loadProducts()
  }, [currentPage, searchQuery, selectedRestaurant, pageSize])

  // Recargar al cambiar el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on search
      loadProducts()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])


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
                <BreadcrumbLink href="/admin/restaurantes">
                  Restaurantes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Productos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Productos de Restaurante</h1>
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
              onClick={() => router.push("/admin/restaurantes/productos/agregar")}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Agregar producto</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs, Restaurant Filter, and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <Tabs defaultValue="all" className="w-auto overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:flex">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="draft">Borrador</TabsTrigger>
                <TabsTrigger value="archived" className="text-xs sm:text-sm">Archivados</TabsTrigger>
                <TabsTrigger value="add" className="text-muted-foreground">
                  <Plus className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Restaurant Filter */}
            <div className="flex items-center gap-2">
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Filtrar por restaurante" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todos los restaurantes</SelectItem>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search and Filter Actions */}
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background w-full sm:min-w-[300px]">
                <Search className={`h-4 w-4 ${loading ? 'animate-pulse' : ''} text-muted-foreground`} />
                <Input
                  placeholder="Buscar productos de restaurante..."
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

        {/* Products Table */}
        {loading ? (
          <div className="animate-pulse">
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <RestaurantProductsTable 
              products={products}
              onProductDeleted={loadProducts}
            />
            
            {/* Pagination */}
            {products.length > 0 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                {searchQuery ? "No se encontraron productos" : "No tienes productos de restaurante aún"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Comienza agregando tu primer producto de restaurante al catálogo
                </p>
              )}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o agrega nuevos productos
                </p>
              )}
            </div>
            <Button onClick={() => router.push("/admin/restaurantes/productos/agregar")}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar producto de restaurante
            </Button>
          </div>
        )}
      </div>

    </>
  )
}