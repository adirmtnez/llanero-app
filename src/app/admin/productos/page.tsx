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
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBodegonProducts } from "@/hooks/use-bodegon-products"
import { useCategories } from "@/hooks/use-categories"
import { DeleteProductModal } from "@/components/modals/delete-product-modal"
import { BodegonProduct } from "@/types/products"
import { TableSkeleton } from "@/components/ui/table-skeleton"

const demoProducts = [
  {
    id: "1",
    name: "Hamburguesa Clásica",
    sku: "HAMBUR-001",
    status: "Active",
    inventory: "25 in stock",
    category: "Hamburguesas",
    price: "$8.99",
  },
  {
    id: "2", 
    name: "Pizza Margarita",
    sku: "PIZZA-002",
    status: "Active",
    inventory: "12 in stock",
    category: "Pizzas",
    price: "$12.50",
  },
  {
    id: "3",
    name: "Tacos al Pastor",
    sku: "TACOS-003",
    status: "Active",
    inventory: "30 in stock",
    category: "Tacos",
    price: "$6.75",
  },
  {
    id: "4",
    name: "Ensalada César",
    sku: "ENSALADA-004",
    status: "Draft",
    inventory: "0 in stock",
    category: "Ensaladas",
    price: "$7.25",
  },
]

export default function ProductosPage() {
  const router = useRouter()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)
  const [realProducts, setRealProducts] = useState<BodegonProduct[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  
  const { getProducts, deleteProduct, loading, formatPrice } = useBodegonProducts()
  const bodegonCategories = useCategories('bodegon')
  
  // Función para obtener el nombre de categoría
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Sin categoría"
    const category = bodegonCategories.categories.find(cat => cat.id === categoryId)
    return category?.name || "Sin categoría"
  }

  // Función para mapear productos reales al formato de la tabla
  const mapProductToTableFormat = (product: BodegonProduct) => ({
    id: product.id,
    name: product.name,
    sku: product.sku || "N/A",
    status: product.is_active_product ? "Active" : "Draft",
    inventory: `${product.quantity_in_pack || 0} en stock`,
    category: getCategoryName(product.category_id),
    price: formatPrice(product.price),
    raw: product // Mantener el objeto original para operaciones
  })

  const products = realProducts.map(mapProductToTableFormat)

  // Cargar productos reales
  const loadProducts = async () => {
    const result = await getProducts(
      { search: searchQuery },
      { page: currentPage, limit: 25 }
    )
    setRealProducts(result.products)
    setTotalPages(result.pagination.totalPages)
  }

  // Cargar productos cuando cambie la página o búsqueda
  useEffect(() => {
    loadProducts()
  }, [currentPage, searchQuery])

  // Recargar al cambiar el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on search
      loadProducts()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleEdit = (product: { id: string }) => {
    router.push(`/admin/productos/${product.id}/editar`)
  }

  const handleDelete = (product: BodegonProduct | { id: string, name: string }) => {
    setSelectedProduct(product as BodegonProduct)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async (productId: string) => {
    const success = await deleteProduct(productId)
    if (success) {
      setShowDeleteModal(false)
      setSelectedProduct(null)
      // Recargar productos
      loadProducts()
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
            <h1 className="text-2xl font-bold">Productos</h1>
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
              onClick={() => router.push("/admin/productos/agregar")}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Agregar producto</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background w-full sm:min-w-[300px]">
                <Search className={`h-4 w-4 ${loading ? 'animate-pulse' : ''} text-muted-foreground`} />
                <Input
                  placeholder="Buscar productos..."
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

        {/* Products table */}
        {loading ? (
          <TableSkeleton rows={5} columns={6} showCheckbox={true} showActions={true} />
        ) : products.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Producto</TableHead>
                    <TableHead className="min-w-[120px]">SKU</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[120px]">Inventario</TableHead>
                    <TableHead className="min-w-[120px]">Categoría</TableHead>
                    <TableHead className="min-w-[100px]">Precio</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-muted-foreground/20 rounded"></div>
                          </div>
                          <span className="truncate">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs sm:text-sm">
                        <span className="block truncate">{product.sku}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.status === "Active" ? "default" : "secondary"}
                          className={product.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {product.status === "Active" ? "Activo" : product.status === "Draft" ? "Borrador" : product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={product.inventory.includes("0") ? "text-red-600" : "text-green-600"}>
                        {product.inventory.replace("in stock", "en stock")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="truncate block">
                          {product.category === "Uncategorized" ? "Sin categoría" : product.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.price}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                            <DropdownMenuItem>Archivar</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(product)}
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
                {searchQuery ? "No se encontraron productos" : "No tienes productos aún"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Los productos se muestran desde datos mock locales
                </p>
              )}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o agrega nuevos productos
                </p>
              )}
            </div>
            <Button onClick={() => router.push("/admin/productos/agregar")}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar producto
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}      
      <DeleteProductModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        product={selectedProduct}
        onDelete={handleDeleteConfirm}
      />
    </>
  )
}