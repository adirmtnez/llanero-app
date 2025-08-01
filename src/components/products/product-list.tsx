"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { DeleteProductModal } from "@/components/modals/delete-product-modal"

import { useCategories } from "@/hooks/use-categories"
import { useBodegonProducts } from "@/hooks/use-bodegon-products"
import { 
  BodegonProduct, 
  ProductsFilters,
  ProductsResponse
} from "@/types/products"

interface ProductListProps {
  onCreateProduct?: () => void
  onEditProduct?: (product: BodegonProduct) => void
  onDeleteProduct?: (product: BodegonProduct) => void
  refreshTrigger?: number
}

export function ProductList({ 
  onCreateProduct, 
  onEditProduct, 
  onDeleteProduct,
  refreshTrigger 
}: ProductListProps) {
  // Estados
  const [productsData, setProductsData] = useState<ProductsResponse>({
    products: [],
    pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }
  })
  const [filters, setFilters] = useState<ProductsFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showFilters, setShowFilters] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)

  // Hooks
  const { categories, subcategories, loadSubcategories } = useCategories('bodegon')
  const { 
    getProducts, 
    deleteProduct, 
    toggleProductActive, 
    formatPrice, 
    loading, 
    error 
  } = useBodegonProducts()

  // Cargar productos
  const loadProducts = useCallback(async () => {
    try {
      const response = await getProducts(
        {
          ...filters,
          search: searchTerm.trim() || undefined
        },
        { page: currentPage, limit: pageSize }
      )
      setProductsData(response)
    } catch (err) {
      console.error('Error loading products:', err)
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    }
  }, [filters, searchTerm, currentPage, pageSize, getProducts, isInitialLoad])

  // Cargar productos al montar y cuando cambien los filtros
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Refrescar cuando cambie refreshTrigger
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadProducts()
    }
  }, [refreshTrigger, loadProducts])

  // Manejar cambio de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset a primera página
  }

  // Manejar cambio de filtros
  const handleFilterChange = (key: keyof ProductsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
    setCurrentPage(1) // Reset a primera página

    // Si cambió la categoría, cargar subcategorías y resetear subcategoría
    if (key === 'category_id') {
      setFilters(prev => ({ ...prev, subcategory_id: undefined }))
      if (value) {
        loadSubcategories(value)
      }
    }
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Cambiar tamaño de página
  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size))
    setCurrentPage(1) // Reset a primera página
  }

  // Manejar eliminación
  const handleDelete = (product: BodegonProduct) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async (product: BodegonProduct) => {
    const success = await deleteProduct(product.id)
    if (success) {
      loadProducts() // Recargar lista
      onDeleteProduct?.(product)
    } else {
      throw new Error('Error al eliminar el producto')
    }
  }

  // Alternar estado activo
  const handleToggleActive = async (product: BodegonProduct) => {
    const success = await toggleProductActive(product.id, !product.is_active_product)
    if (success) {
      loadProducts() // Recargar lista
    }
  }

  // Generar páginas para paginación
  const generatePageNumbers = () => {
    const { totalPages } = productsData.pagination
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const { products, pagination } = productsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Productos de Bodegón
          </h2>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos de bodegón
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          {onCreateProduct && (
            <Button onClick={onCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, descripción, SKU o código de barras..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={loadProducts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select 
                    value={filters.category_id || ''} 
                    onValueChange={(value) => handleFilterChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategoría</Label>
                  <Select 
                    value={filters.subcategory_id || ''} 
                    onValueChange={(value) => handleFilterChange('subcategory_id', value)}
                    disabled={!filters.category_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las subcategorías</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select 
                    value={filters.is_active?.toString() || ''} 
                    onValueChange={(value) => handleFilterChange('is_active', value === '' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="true">Activos</SelectItem>
                      <SelectItem value="false">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de productos */}
      <Card>
        <CardContent className="p-0">
          {isInitialLoad ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando productos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay productos</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'No se encontraron productos con los filtros aplicados'
                  : 'Aún no has creado productos'
                }
              </p>
              {onCreateProduct && (
                <Button onClick={onCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Producto
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU / Código</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_gallery_urls && product.image_gallery_urls.length > 0 ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={product.image_gallery_urls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {product.sku && (
                            <div className="text-sm">
                              <span className="font-mono">{product.sku}</span>
                            </div>
                          )}
                          {product.bar_code && (
                            <div className="text-xs text-gray-500">
                              <span className="font-mono">{product.bar_code}</span>
                            </div>
                          )}
                          {!product.sku && !product.bar_code && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatPrice(product.price)}
                          </div>
                          {product.purchase_price && product.purchase_price > 0 && (
                            <div className="text-xs text-gray-500">
                              Compra: {formatPrice(product.purchase_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {product.quantity_in_pack} unidades/paquete
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={product.is_active_product ? "default" : "secondary"}
                            className="w-fit"
                          >
                            {product.is_active_product ? 'Activo' : 'Inactivo'}
                          </Badge>
                          
                          <div className="flex gap-1">
                            {product.is_discount && (
                              <Badge variant="destructive" className="text-xs">
                                Descuento
                              </Badge>
                            )}
                            {product.is_promo && (
                              <Badge variant="outline" className="text-xs">
                                Promo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEditProduct && (
                              <DropdownMenuItem onClick={() => onEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleToggleActive(product)}
                            >
                              {product.is_active_product ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleDelete(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="px-6 py-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize" className="text-sm">
                      Mostrar:
                    </Label>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">
                      de {pagination.total} productos
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      {generatePageNumbers().map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de eliminación */}
      <DeleteProductModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        product={selectedProduct}
        onDelete={handleDeleteConfirm}
      />
    </div>
  )
}