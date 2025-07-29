"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { createClient } from "@supabase/supabase-js"
import { EditBodegonModal } from "@/components/modals/edit-bodegon-modal"
import { DeleteBodegonModal } from "@/components/modals/delete-bodegon-modal"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft,
  Search,
  Settings,
  Plus,
  MoreHorizontal,
  Package,
  Store,
  Trash2
} from "lucide-react"

interface Bodegon {
  id: string
  name: string
  address: string | null
  phone_number: string
  is_active: boolean
  logo_url: string | null
}

interface Product {
  id: string
  name: string
  price: number
  status: 'disponible' | 'agotado' | 'pausado'
  sku?: string
}

export default function BodegonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { config, isConfigValid } = useSupabaseConfig()
  const [bodegon, setBodegon] = useState<Bodegon | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos los estatus...")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Datos demo para productos
  const demoProducts: Product[] = [
    {
      id: "1",
      name: "Producto de Bodegón 1",
      price: 15.50,
      status: "disponible",
      sku: "B001"
    }
  ]

  useEffect(() => {
    if (isConfigValid && config.serviceKey && params.id) {
      fetchBodegon()
    }
  }, [params.id, isConfigValid, config.serviceKey])

  const fetchBodegon = async () => {
    if (!isConfigValid || !config.serviceKey) {
      setError("Configuración de Supabase incompleta")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'apikey': config.serviceKey,
            'Authorization': `Bearer ${config.serviceKey}`
          }
        }
      })

      const { data, error: fetchError } = await supabase
        .from('bodegons')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      console.log('Datos del bodegón obtenidos:', data)
      console.log('Logo URL obtenido:', data.logo_url)
      console.log('Cover Image URL obtenido:', data.cover_image)
      
      setBodegon(data)
      // Por ahora usamos datos demo para productos
      setProducts(demoProducts)
    } catch (err: any) {
      console.error('Error fetching bodegon:', err)
      setError(err.message || 'Error al cargar el bodegón')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>
      case "agotado":
        return <Badge variant="destructive">Agotado</Badge>
      case "pausado":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pausado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando bodegón...</p>
        </div>
      </div>
    )
  }

  if (error || !bodegon) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-red-600">Error al cargar el bodegón</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
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
                <BreadcrumbLink href="/admin/bodegones">
                  Bodegones
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{bodegon.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Mobile back button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {bodegon.name}
          </Button>
        </div>

        {/* Header with bodegon info and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {bodegon.logo_url ? (
                <img 
                  src={bodegon.logo_url} 
                  alt={bodegon.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si la imagen falla al cargar, mostrar el icono por defecto
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <Store 
                className={`h-6 w-6 text-muted-foreground ${bodegon.logo_url ? 'hidden' : ''}`} 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{bodegon.name}</h1>
              <p className="text-muted-foreground text-sm">
                Gestiona los productos de este bodegón
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Editar ajustes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar bodegón
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-background flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los estatus...">Todos los estatus...</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="agotado">Agotado</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar producto
          </Button>
        </div>

        {/* Products table */}
        {products.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">SKU</TableHead>
                    <TableHead className="min-w-[200px]">Producto</TableHead>
                    <TableHead className="min-w-[100px]">Precio</TableHead>
                    <TableHead className="min-w-[100px]">Estatus</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">{product.sku || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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
              <Package className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                No hay productos aún
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Agrega productos para que los clientes puedan pedirlos desde tu bodegón
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar producto
              </Button>
            </div>
          </div>
        )}

        <EditBodegonModal 
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          bodegon={bodegon}
          onSuccess={() => {
            console.log('Bodegón actualizado, refrescando datos...')
            fetchBodegon()
          }}
        />

        <DeleteBodegonModal 
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          bodegon={bodegon}
          onSuccess={() => {
            router.push('/admin/bodegones')
          }}
        />
      </div>
    </>
  )
}