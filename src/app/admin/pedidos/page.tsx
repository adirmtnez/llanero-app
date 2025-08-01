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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  CreditCard,
  Smartphone,
  Building2,
  Globe
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"

const demoOrders = [
  {
    date: "3 de jul. de 2023",
    orders: [
      {
        id: "TE7YATAQ4D",
        customerName: "Cliente Anónimo",
        paymentMethod: "phone",
        status: "Depositada",
        time: "15:03",
        amount: "$300.00",
        statusColor: "green",
        products: [
          { name: "Hamburguesa Clásica", quantity: 2, price: "$17.98" },
          { name: "Papas Fritas", quantity: 1, price: "$4.99" }
        ],
        shipping: "$2.00",
        total: "$300.00"
      }
    ]
  },
  {
    date: "24 de jun. de 2023",
    orders: [
      {
        id: "CERVEZA-DUFF",
        customerName: "Cerveza Duff",
        paymentMethod: "bank",
        status: "Depositada",
        time: "17:17",
        amount: "$120.00",
        statusColor: "green",
        products: [
          { name: "Pizza Margarita", quantity: 1, price: "$12.50" },
          { name: "Refresco", quantity: 2, price: "$3.00" }
        ],
        shipping: "$2.00",
        total: "$120.00"
      }
    ]
  },
  {
    date: "14 de jun. de 2023",
    orders: [
      {
        id: "TETDZR3PA6",
        customerName: "Cliente Anónimo",
        paymentMethod: "planet",
        status: "Depositada",
        time: "21:43",
        amount: "$450.00",
        statusColor: "green",
        products: [
          { name: "Tacos al Pastor", quantity: 5, price: "$33.75" },
          { name: "Guacamole", quantity: 1, price: "$5.00" }
        ],
        shipping: "$3.00",
        total: "$450.00"
      },
      {
        id: "TEGNVP9SAN",
        customerName: "Cliente Anónimo",
        paymentMethod: "phone",
        status: "Fallido",
        time: "18:59",
        amount: "$200.00",
        statusColor: "red",
        products: [
          { name: "Ensalada César", quantity: 1, price: "$7.25" },
          { name: "Pollo a la Plancha", quantity: 1, price: "$15.00" }
        ],
        shipping: "$2.00",
        total: "$200.00"
      },
      {
        id: "TFEKFQLLDS",
        customerName: "Cliente Anónimo",
        paymentMethod: "bank",
        status: "Depositada",
        time: "18:45",
        amount: "$1,000.00",
        statusColor: "green",
        products: [
          { name: "Combo Familiar", quantity: 2, price: "$45.00" },
          { name: "Bebidas Familiares", quantity: 3, price: "$12.00" }
        ],
        shipping: "$5.00",
        total: "$1,000.00"
      },
      {
        id: "TC9Y6PYZE4",
        customerName: "Cliente Anónimo",
        paymentMethod: "planet",
        status: "Depositada",
        time: "18:42",
        amount: "$1,000.00",
        statusColor: "green",
        products: [
          { name: "Malta Belga Star Premium 0.33 L", quantity: 5, price: "$3.00" }
        ],
        shipping: "$2.00",
        total: "$1,000.00"
      }
    ]
  }
]

export default function PedidosPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])
  
  const orders = demoOrders

  const handleOrderClick = (order: any, date: string) => {
    setSelectedOrder({
      ...order,
      date: date
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "phone":
        return <Smartphone className="h-4 w-4 text-white" />
      case "bank":
        return <Building2 className="h-4 w-4 text-white" />
      case "planet":
        return <Globe className="h-4 w-4 text-white" />
      default:
        return <CreditCard className="h-4 w-4 text-white" />
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
                <BreadcrumbPage>Pedidos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Pedidos</h1>
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
                <DropdownMenuItem>Marcar como completados</DropdownMenuItem>
                <DropdownMenuItem>Cancelar seleccionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="flex-1 sm:flex-none justify-center">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Nuevo pedido</span>
              <span className="xs:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs defaultValue="all" className="w-auto overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:flex">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">Pendientes</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">Completados</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelados</TabsTrigger>
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
                  placeholder="Buscar pedidos..."
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

        {/* Orders content */}
        {loading ? (
          <TableSkeleton rows={5} columns={5} showCheckbox={true} showActions={true} />
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((dateGroup, dateIndex) => (
              <div key={dateIndex} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-1">
                  {dateGroup.date}
                </h3>
                <div className="space-y-2">
                  {dateGroup.orders.map((order) => (
                    <Card 
                      key={order.id} 
                      className="bg-white hover:bg-gray-50 transition-colors cursor-pointer py-0"
                      onClick={() => handleOrderClick(order, dateGroup.date)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                              {getPaymentIcon(order.paymentMethod)}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs sm:text-sm truncate">{order.id}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <Badge 
                                  variant={order.statusColor === "green" ? "default" : "destructive"}
                                  className={
                                    order.statusColor === "green" 
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs" 
                                      : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                                  }
                                >
                                  {order.status}
                                </Badge>
                                <span className="text-muted-foreground">{order.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                            <span className="font-bold text-sm sm:text-lg">{order.amount}</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="text-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  No hay pedidos que coincidan con los filtros
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          order={selectedOrder}
        />
      </div>
    </>
  )
}