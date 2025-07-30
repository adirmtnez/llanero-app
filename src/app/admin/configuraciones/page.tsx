"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Smartphone, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle2,
  Save,
  Database,
  Puzzle
} from "lucide-react"

export default function ConfiguracionesPage() {
  const [isCartEnabled, setIsCartEnabled] = useState(true)
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const handleCartToggle = (enabled: boolean) => {
    setIsCartEnabled(enabled)
    setHasChanges(true)
  }

  const handleMessageChange = (message: string) => {
    setMaintenanceMessage(message)
    setHasChanges(true)
  }

  const handleSave = () => {
    console.log("Guardando configuración:", {
      isCartEnabled,
      maintenanceMessage
    })
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuraciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la configuración de tu aplicación
        </p>
      </div>

      <Tabs defaultValue="estatus-app" className="w-full">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="estatus-app" 
              className="h-auto px-4 py-3 rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:bg-transparent bg-transparent hover:bg-gray-50 text-gray-600 data-[state=active]:text-black font-medium shadow-none"
              style={{ "--tw-shadow": "0" } as React.CSSProperties}
            >
              Estatus de App
            </TabsTrigger>
            <TabsTrigger 
              value="integraciones" 
              className="h-auto px-4 py-3 rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:bg-transparent bg-transparent hover:bg-gray-50 text-gray-600 data-[state=active]:text-black font-medium shadow-none"
              style={{ "--tw-shadow": "0" } as React.CSSProperties}
            >
              Integraciones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="estatus-app" className="space-y-6 mt-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isCartEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                    <ShoppingCart className={`h-6 w-6 ${isCartEnabled ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Estado del Carrito</CardTitle>
                    <CardDescription>
                      {isCartEnabled ? 'Los clientes pueden realizar compras' : 'Las compras están deshabilitadas'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCartEnabled ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Activo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Inactivo</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Carrito</CardTitle>
              <CardDescription>
                Activa o desactiva la funcionalidad del carrito de compras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="cart-toggle" className="text-base font-medium">
                    Permitir compras
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando está desactivado, los clientes no podrán agregar productos al carrito
                  </p>
                </div>
                <Switch
                  id="cart-toggle"
                  checked={isCartEnabled}
                  onCheckedChange={handleCartToggle}
                />
              </div>

              {!isCartEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">
                      Mensaje de mantenimiento
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      placeholder="Ej: Estamos realizando mantenimiento. Las compras estarán disponibles pronto."
                      value={maintenanceMessage}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este mensaje se mostrará a los usuarios cuando intenten acceder al carrito
                    </p>
                  </div>
                </div>
              )}

              {hasChanges && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Tienes cambios sin guardar. Haz clic en "Guardar cambios" para aplicarlos.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="sm:w-auto w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCartEnabled(true)
                    setMaintenanceMessage("")
                    setHasChanges(false)
                  }}
                  className="sm:w-auto w-full"
                >
                  Restablecer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Información importante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  • Cuando el carrito esté desactivado, los usuarios podrán navegar por los productos pero no podrán realizar compras.
                </p>
                <p>
                  • El mensaje de mantenimiento se mostrará en lugar del botón "Agregar al carrito".
                </p>
                <p>
                  • Esta configuración afecta inmediatamente a todos los usuarios de la aplicación móvil.
                </p>
                <p>
                  • Se recomienda desactivar las compras solo durante períodos de mantenimiento o actualizaciones importantes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integraciones" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* QuickBooks */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">qb</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">QuickBooks</h3>
                        <p className="text-xs text-gray-500">Sincroniza gastos para registros precisos.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch />
                  </div>
                </div>

                {/* PayPal */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">PP</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">PayPal</h3>
                        <p className="text-xs text-gray-500">Pagos en línea y móviles confiables.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch />
                  </div>
                </div>

                {/* Google Analytics */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">GA</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">Google Analytics</h3>
                        <p className="text-xs text-gray-500">Análisis y estadísticas web avanzadas.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch />
                  </div>
                </div>

                {/* Wave */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">W</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">Wave</h3>
                        <p className="text-xs text-gray-500">Herramientas contables gratuitas para emprendedores.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch />
                  </div>
                </div>

                {/* Amazon Seller Central */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">AS</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">Amazon Seller Central</h3>
                        <p className="text-xs text-gray-500">Gestiona ventas e inventario de Amazon.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch />
                  </div>
                </div>

                {/* Google Data Studio */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">GDS</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">Google Data Studio</h3>
                        <p className="text-xs text-gray-500">Visualización de datos gratuita.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 px-3">
                      Configurar
                    </Button>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}