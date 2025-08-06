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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useState, useEffect } from "react"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { AddSubcategoryModal } from "@/components/modals/add-subcategory-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteSubcategoryModal } from "@/components/modals/delete-subcategory-modal"
import { useBodegonSubcategories, BodegonSubcategory } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

export function BodegonesSubcategoriasPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<(BodegonSubcategory & { subcategoryType: 'bodegon' }) | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { subcategories: bodegonSubcategories, loading, refreshSubcategories, updateSubcategory } = useBodegonSubcategories()
  const { categories: bodegonCategories } = useBodegonCategories()
  
  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = bodegonCategories.find(c => c.id === categoryId)
    return category ? category.name : 'N/A'
  }
  
  // Filter subcategories based on active tab, search, and category
  const filteredSubcategories = bodegonSubcategories.filter(subcategory => {
    const matchesSearch = searchQuery.trim() === "" || 
      subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'visible' && subcategory.is_active) ||
      (activeTab === 'hidden' && !subcategory.is_active)
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      subcategory.parent_category === selectedCategory
    
    return matchesSearch && matchesTab && matchesCategory
  })
  
  // Pagination logic
  const totalItems = filteredSubcategories.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const subcategories = filteredSubcategories.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab, selectedCategory])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Helper functions for subcategory actions
  const handleEditSubcategory = (subcategory: BodegonSubcategory) => {
    setSelectedSubcategory({ ...subcategory, subcategoryType: 'bodegon' })
    setShowEditModal(true)
  }

  const handleDeleteSubcategory = (subcategory: BodegonSubcategory) => {
    setSelectedSubcategory({ ...subcategory, subcategoryType: 'bodegon' })
    setShowDeleteModal(true)
  }

  const handleToggleVisibility = async (subcategory: BodegonSubcategory) => {
    const updatedSubcategory = { ...subcategory, is_active: !subcategory.is_active }
    const result = await updateSubcategory(subcategory.id, { is_active: !subcategory.is_active })
    
    if (result.success) {
      toast.success(`Subcategoría ${updatedSubcategory.is_active ? 'activada' : 'desactivada'} correctamente`)
      refreshSubcategories()
    } else {
      toast.error(result.error || 'Error al actualizar subcategoría')
    }
  }

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Bodegones', path: '/bodegones' },
    { label: 'Productos', path: '/bodegones/productos' },
    { label: 'Sub Categorías', path: '/bodegones/productos/sub-categorias', isActive: true }
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
            <h1 className="text-2xl font-bold">Sub Categorías de Bodegón</h1>
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

        {/* Filter tabs, Category Filter, and Search */}
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
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {bodegonCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                  placeholder="Buscar subcategorías de bodegón..."
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

        {/* Subcategories table */}
        {loading ? (
          <TableSkeleton rows={5} columns={8} showCheckbox={true} showActions={true} />
        ) : subcategories.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Sub Categoría</TableHead>
                    <TableHead className="min-w-[120px]">Productos</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[150px]">Categoría Padre</TableHead>
                    <TableHead className="min-w-[120px]">Fecha de creación</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {subcategory.image ? (
                              <img 
                                src={subcategory.image} 
                                alt={subcategory.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <UtensilsCrossed className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="truncate">{subcategory.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{subcategory.productCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={subcategory.is_active ? "default" : "secondary"}
                          className={subcategory.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {subcategory.is_active ? "Visible" : "Oculta"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="truncate block">
                          {getCategoryName(subcategory.parent_category)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subcategory.created_date ? new Date(subcategory.created_date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSubcategory(subcategory)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(subcategory)}>
                              {subcategory.is_active ? "Ocultar" : "Mostrar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteSubcategory(subcategory)}
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
                {searchQuery ? "No se encontraron subcategorías" : "No tienes subcategorías de bodegón aún"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Comienza agregando tu primera subcategoría para organizar mejor los productos
                </p>
              )}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda o agrega nuevas subcategorías
                </p>
              )}
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar subcategoría de bodegón
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}      
      <AddSubcategoryModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onSuccess={refreshSubcategories}
        subcategoryType="bodegon"
      />
      
      <EditCategoryModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        category={selectedSubcategory}
        onSuccess={refreshSubcategories}
      />
      
      <DeleteSubcategoryModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        subcategory={selectedSubcategory}
        onSuccess={refreshSubcategories}
      />
    </>
  )
}