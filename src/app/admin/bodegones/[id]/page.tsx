"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBodegones } from "@/hooks/use-bodegones"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft
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
  category: string
  stock: number
  is_active: boolean
}

export default function BodegonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { bodegones } = useBodegones()
  const [bodegon, setBodegon] = useState<Bodegon | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchBodegon = async () => {
    if (!params.id) {
      setError("ID de bodegón no válido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find bodegon in mock data
      const foundBodegon = bodegones.find(b => b.id === params.id)
      
      if (!foundBodegon) {
        throw new Error('Bodegón no encontrado')
      }

      setBodegon(foundBodegon)

      // Mock products for this bodegon
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Producto Ejemplo 1",
          price: 2500,
          category: "Bebidas",
          stock: 10,
          is_active: true
        },
        {
          id: "2", 
          name: "Producto Ejemplo 2",
          price: 1800,
          category: "Snacks",
          stock: 25,
          is_active: true
        }
      ]
      
      setProducts(mockProducts)

    } catch (err: any) {
      console.error('Error fetching bodegon:', err)
      setError(err.message || 'Error al cargar el bodegón')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bodegones.length > 0 && params.id) {
      fetchBodegon()
    }
  }, [params.id, bodegones])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Cargando bodegón...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </header>
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/admin/bodegones')}>
            Volver a Bodegones
          </Button>
        </div>
      </div>
    )
  }

  if (!bodegon) {
    return (
      <div className="space-y-6">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </header>
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Bodegón no encontrado</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/admin/bodegones')}>
            Volver a Bodegones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/bodegones">Bodegones</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{bodegon.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{bodegon.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={bodegon.is_active ? "default" : "secondary"}>
                  {bodegon.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactivo
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Información del Bodegón */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Bodegón</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{bodegon.phone_number}</p>
                </div>
              </div>
              {bodegon.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">{bodegon.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Productos</p>
                  <p className="text-sm text-muted-foreground">{products.length} productos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              Lista de productos disponibles en este bodegón
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay productos en este bodegón</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
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