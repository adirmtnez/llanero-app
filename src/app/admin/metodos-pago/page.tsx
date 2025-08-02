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
  CreditCard,
  Building2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { TableLoading } from "@/components/ui/table-loading"

const demoPaymentMethods = [
  {
    id: "1",
    bank: "Banco de Venezuela",
    type: "Transferencia Bancaria",
    account: "0102-****-****-5678",
    status: "Activo",
    establishment: "Pizza Express",
    establishmentType: "restaurante",
    category: "nacional",
  },
  {
    id: "2", 
    bank: "Banesco",
    type: "Pago Móvil",
    account: "0134-****-****-9012",
    status: "Activo",
    establishment: "Minimarket El Arepazo",
    establishmentType: "bodegon",
    category: "nacional",
  },
  {
    id: "3",
    bank: "BBVA Provincial",
    type: "Punto de Venta",
    account: "0108-****-****-3456",
    status: "Inactivo",
    establishment: "Supermercado La Esquina",
    establishmentType: "bodegon",
    category: "nacional",
  },
  {
    id: "4",
    bank: "PayPal",
    type: "Transferencia Internacional",
    account: "user@example.com",
    status: "Activo",
    establishment: "Café Central",
    establishmentType: "restaurante",
    category: "internacional",
  },
  {
    id: "5",
    bank: "Wise (TransferWise)",
    type: "Transferencia Internacional",
    account: "USD Account ****4567",
    status: "Activo",
    establishment: "Bodegón Los Hermanos",
    establishmentType: "bodegon",
    category: "internacional",
  },
  {
    id: "6",
    bank: "Mercado Pago",
    type: "Billetera Digital",
    account: "+58-414-****-789",
    status: "Pendiente",
    establishment: "Pollo Dorado",
    establishmentType: "restaurante",
    category: "nacional",
  },
]

export default function MetodosPagoPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])
  
  const allPaymentMethods = demoPaymentMethods
  
  // Filter payment methods based on active filter
  const paymentMethods = allPaymentMethods.filter(method => {
    if (activeFilter === "all") return true
    if (activeFilter === "nacional") return method.category === "nacional"
    if (activeFilter === "internacional") return method.category === "internacional"
    if (activeFilter === "active") return method.status === "Activo"
    if (activeFilter === "pending") return method.status === "Pendiente"
    if (activeFilter === "inactive") return method.status === "Inactivo"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Inactivo":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
                <BreadcrumbPage>Métodos de pago</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Métodos de pago</h1>
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
                <DropdownMenuItem>Desactivar seleccionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="flex-1 sm:flex-none justify-center">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Agregar método</span>
              <span className="xs:hidden">Agregar</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 sm:w-auto sm:flex">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="nacional" className="text-xs sm:text-sm">Nacional</TabsTrigger>
              <TabsTrigger value="internacional" className="text-xs sm:text-sm">Intl.</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">Pend.</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs sm:text-sm">Inact.</TabsTrigger>
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
                  placeholder="Buscar métodos de pago..."
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

        {/* Payment Methods table */}
        {loading ? (
          <TableLoading 
            rows={5} 
            columns={4} 
            showCheckbox={true} 
            showActions={true}
          />
        ) : paymentMethods.length > 0 ? (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="min-w-[150px]">Banco</TableHead>
                    <TableHead className="min-w-[140px]">Tipo de método</TableHead>
                    <TableHead className="min-w-[140px]">Cuenta</TableHead>
                    <TableHead className="min-w-[100px]">Estatus</TableHead>
                    <TableHead className="min-w-[160px]">Bodegón/Restaurante</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                          <span className="truncate">{method.bank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="block truncate text-xs sm:text-sm">{method.type}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        <span className="block truncate">{method.account}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className={getStatusColor(method.status)}
                        >
                          {method.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="truncate">{method.establishment}</span>
                          <span className="text-xs text-muted-foreground/60 capitalize">
                            {method.establishmentType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem>
                              {method.status === "Activo" ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
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
              <CreditCard className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-medium text-foreground">
                No tienes métodos de pago aún
              </p>
              <p className="text-sm text-muted-foreground">
                Los métodos de pago se muestran desde datos mock locales
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar método de pago
            </Button>
          </div>
        )}
      </div>
    </>
  )
}