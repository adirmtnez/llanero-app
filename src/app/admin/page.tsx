"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Package, Settings, ShoppingBag, Users } from "lucide-react"
import { useDemoMode } from "@/contexts/demo-mode-context"

export default function AdminPage() {
  const { isDemoMode } = useDemoMode()
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-[1080px] mx-auto w-full">
        {/* Time Filter Tabs */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="este-año" className="w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hoy">Hoy</TabsTrigger>
              <TabsTrigger value="esta-semana">Esta semana</TabsTrigger>
              <TabsTrigger value="este-mes">Este mes</TabsTrigger>
              <TabsTrigger value="este-año">Este año</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Air Date/Time Picker
          </Button>
        </div>

        {/* Main Sales Card */}
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">
                $ {isDemoMode ? "46.99" : "0.00"}
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
                  <div className="text-2xl font-bold">{isDemoMode ? "2" : "0"}</div>
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
                  <div className="text-2xl font-bold">{isDemoMode ? "0" : "0"}</div>
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
                  <div className="text-2xl font-bold">{isDemoMode ? "2" : "0"}</div>
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
                  <div className="text-2xl font-bold">{isDemoMode ? "0" : "0"}</div>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                Productos más vendidos del mes
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                ¿Qué es lo que más compraron los clientes?
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {isDemoMode ? "Sin resultados" : "Aún no hay productos vendidos"}
              </p>
              {!isDemoMode && (
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                  Cuando tengas ventas, aquí aparecerán tus productos más populares
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}