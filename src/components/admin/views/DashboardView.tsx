"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Package, Settings, ShoppingBag, Users } from "lucide-react"

export function DashboardView() {
  return (
    <>
      <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Time Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs defaultValue="este-año" className="w-full sm:w-auto overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:flex">
              <TabsTrigger value="hoy">Hoy</TabsTrigger>
              <TabsTrigger value="esta-semana" className="text-xs sm:text-sm">Esta semana</TabsTrigger>
              <TabsTrigger value="este-mes" className="text-xs sm:text-sm">Este mes</TabsTrigger>
              <TabsTrigger value="este-año" className="text-xs sm:text-sm">Este año</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Air Date/Time Picker</span>
            <span className="sm:hidden">Fechas</span>
          </Button>
        </div>

        {/* Main Sales Card */}
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">
                $ 0.00
              </div>
              <p className="text-sm text-muted-foreground">
                Ventas Totales
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-black rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    Pedidos entregados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-black rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    Productos vendidos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-black rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    Nuevos Clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-black rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">
                    Cupones aplicados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-semibold">
                Productos más vendidos del mes
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                ¿Qué es lo que más compraron los clientes?
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Aún no hay productos vendidos
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-sm px-4">
                Cuando tengas ventas, aquí aparecerán tus productos más populares
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}