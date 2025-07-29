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
import { useState } from "react"
import { useDemoMode } from "@/contexts/demo-mode-context"

const demoCategories = [
  {
    id: "1",
    name: "Salsas",
    productCount: 0,
    status: "Visible",
    image: "/images/salsas.jpg",
  },
  {
    id: "2", 
    name: "Familia",
    productCount: 4,
    status: "Visible",
    image: "/images/familia.jpg",
  },
  {
    id: "3",
    name: "Platos Principales",
    productCount: 20,
    status: "Visible",
    image: "/images/platos.jpg",
  },
]

export default function CategoriasPage() {
  const { isDemoMode } = useDemoMode()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const categories = isDemoMode ? demoCategories : []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Categorías</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Más acciones
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Exportar seleccionados</DropdownMenuItem>
                <DropdownMenuItem>Edición masiva</DropdownMenuItem>
                <DropdownMenuItem>Eliminar seleccionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar categoría
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-auto">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="visible">Visibles</TabsTrigger>
              <TabsTrigger value="hidden">Ocultas</TabsTrigger>
              <TabsTrigger value="archived">Archivadas</TabsTrigger>
              <TabsTrigger value="add" className="text-muted-foreground">
                <Plus className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background min-w-[300px]">
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
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <div className="w-6 h-6 bg-muted-foreground/20 rounded"></div>
                        </div>
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category.productCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="default"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        {category.status}
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
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem>Ocultar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48">
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          {isDemoMode ? "No hay categorías que coincidan con los filtros" : "No tienes categorías aún"}
                        </p>
                        {!isDemoMode && (
                          <p className="text-xs text-muted-foreground max-w-sm">
                            Organiza tus productos creando categorías para facilitar la navegación
                          </p>
                        )}
                      </div>
                      {!isDemoMode && (
                        <div className="pt-2">
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar categoría
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}