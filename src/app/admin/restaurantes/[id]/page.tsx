"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useRestaurants } from "@/hooks/use-restaurants"
import { EditRestaurantModal } from "@/components/modals/edit-restaurant-modal"
import { DeleteRestaurantModal } from "@/components/modals/delete-restaurant-modal"
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
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Clock
} from "lucide-react"

interface Restaurant {
  id: string
  name: string
  phone_number: string
  logo_url: string | null
  cover_image: string | null
  delivery_available?: boolean
  pickup_available?: boolean
  opening_hours?: string
  is_active?: boolean
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  is_active: boolean
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { restaurants } = useRestaurants()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchRestaurant = async () => {
    if (!params.id) {
      setError("ID de restaurante no válido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find restaurant in mock data
      const foundRestaurant = restaurants.find(r => r.id === params.id)
      
      if (!foundRestaurant) {
        throw new Error('Restaurante no encontrado')
      }

      setRestaurant(foundRestaurant)

      // Mock products for this restaurant
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Pizza Margherita",
          price: 15000,
          category: "Pizza",
          stock: 5,
          is_active: true
        },
        {
          id: "2", 
          name: "Hamburguesa Clásica",
          price: 12000,
          category: "Hamburguesa",
          stock: 8,
          is_active: true
        }
      ]
      
      setProducts(mockProducts)

    } catch (err: any) {
      console.error('Error fetching restaurant:', err)
      setError(err.message || 'Error al cargar el restaurante')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restaurants.length > 0 && params.id) {
      fetchRestaurant()
    }
  }, [params.id, restaurants])

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
          <p className="text-muted-foreground">Cargando restaurante...</p>
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
          <Button onClick={() => router.push('/admin/restaurantes')}>
            Volver a Restaurantes
          </Button>
        </div>
      </div>
    )
  }

  if (!restaurant) {
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
            <AlertDescription>Restaurante no encontrado</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/admin/restaurantes')}>
            Volver a Restaurantes
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
              <BreadcrumbLink href="/admin/restaurantes">Restaurantes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{restaurant.name}</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                  {restaurant.is_active ? (
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

        {/* Información del Restaurante */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Restaurante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{restaurant.phone_number}</p>
                </div>
              </div>
              {restaurant.opening_hours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Horario</p>
                    <p className="text-sm text-muted-foreground">{restaurant.opening_hours}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servicios y Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Productos</p>
                  <p className="text-sm text-muted-foreground">{products.length} productos</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {restaurant.delivery_available && (
                  <Badge variant="secondary">Delivery</Badge>
                )}
                {restaurant.pickup_available && (
                  <Badge variant="secondary">Pickup</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              Lista de productos disponibles en este restaurante
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
                <p className="text-muted-foreground">No hay productos en este restaurante</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <EditRestaurantModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          restaurant={restaurant}
          onSuccess={() => {
            console.log('Restaurante actualizado, refrescando datos...')
            fetchRestaurant()
          }}
        />

        <DeleteRestaurantModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          restaurant={restaurant}
          onSuccess={() => {
            router.push('/admin/restaurantes')
          }}
        />
      </div>
    </>
  )
}