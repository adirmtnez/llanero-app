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
  Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteCategoryModal } from "@/components/modals/delete-category-modal"
import { useBodegonCategories, BodegonCategory } from "@/hooks/bodegones/use-bodegon-categories"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

export function BodegonesCategoriasPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<(BodegonCategory & { categoryType: 'bodegon' }) | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { categories: bodegonCategories, loading, refreshCategories, updateCategory } = useBodegonCategories()
  
  // Filter categories based on active tab and search
  const filteredCategories = bodegonCategories.filter(category => {
    const matchesSearch = searchQuery.trim() === "" || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'visible' && category.is_active) ||
      (activeTab === 'hidden' && !category.is_active)
    
    return matchesSearch && matchesTab
  })
  
  // Pagination logic
  const totalItems = filteredCategories.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const categories = filteredCategories.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Helper functions for category actions
  const handleEditCategory = (category: BodegonCategory) => {
    setSelectedCategory({ ...category, categoryType: 'bodegon' })
    setShowEditModal(true)
  }

  const handleDeleteCategory = (category: BodegonCategory) => {
    setSelectedCategory({ ...category, categoryType: 'bodegon' })
    setShowDeleteModal(true)
  }

  const handleToggleVisibility = async (category: BodegonCategory) => {
    const updatedCategory = { ...category, is_active: !category.is_active }
    const result = await updateCategory(category.id, { is_active: !category.is_active })
    
    if (result.success) {
      toast.success(`Categoría ${updatedCategory.is_active ? 'activada' : 'desactivada'} correctamente`)
      refreshCategories()
    } else {
      toast.error(result.error || 'Error al actualizar categoría')
    }
  }

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Bodegones', path: '/bodegones' },
    { label: 'Productos', path: '/bodegones/productos' },
    { label: 'Categorías', path: '/bodegones/productos/categorias', isActive: true }
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
            <h1 className="text-2xl font-bold">Categorías de Bodegón</h1>
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

        {/* Filter tabs and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:flex">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="visible">Visibles</TabsTrigger>
                <TabsTrigger value="hidden">Ocultas</TabsTrigger>
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
                  placeholder="Buscar categorías de bodegón..."
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

        {/* Categories table */}
        {loading ? (
          <TableSkeleton rows={5} columns={6} showCheckbox={true} showActions={true} />
        ) : categories.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Categoría</TableHead>
                    <TableHead className="min-w-[120px]">Productos</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[120px]">Fecha de creación</TableHead>
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
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                          </div>
                          <span className="truncate">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.productCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={category.is_active ? "default" : "secondary"}
                          className={category.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {category.is_active ? "Visible" : "Oculta"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.created_date ? new Date(category.created_date).toLocaleDateString() : "N/A"}
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
                            <DropdownMenuItem onClick={() => handleToggleVisibility(category)}>
                              {category.is_active ? "Ocultar" : "Mostrar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
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
            
            {/* Pagination */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                {searchQuery ? "No se encontraron categorías" : "No tienes categorías de bodegón aún"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Comienza agregando tu primera categoría para organizar los productos
                </p>
              )}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o agrega nuevas categorías
                </p>
              )}
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar categoría de bodegón
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}      
      <AddCategoryModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSuccess={refreshCategories}
        categoryType="bodegon"
      />
      
      <EditCategoryModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        category={selectedCategory}
        onSuccess={refreshCategories}
      />
      
      <DeleteCategoryModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        category={selectedCategory}
        onSuccess={refreshCategories}
      />
    </>
  )
}