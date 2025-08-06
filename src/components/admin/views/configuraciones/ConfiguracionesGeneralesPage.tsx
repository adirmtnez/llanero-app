"use client"

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/admin/admin-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ShoppingCart, Save, Info } from "lucide-react"

export function ConfiguracionesGeneralesPage() {
  const { setBreadcrumb } = useAdminStore()
  
  const [cartEnabled, setCartEnabled] = useState(true)
  const [allowPurchases, setAllowPurchases] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { label: 'Admin', path: '/' },
      { label: 'Configuraciones', path: '/configuraciones', isActive: true }
    ]
    setBreadcrumb(breadcrumbItems)
  }, [setBreadcrumb])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Cambios guardados correctamente')
    } catch (err) {
      toast.error('Error al guardar configuraciones')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setCartEnabled(true)
    setAllowPurchases(true)
    toast.success('Configuración restablecida')
  }

  return (
    <div className="space-y-6">
      {/* Estado del Carrito */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Estado del Carrito</h3>
                <p className="text-sm text-muted-foreground">Los clientes pueden realizar compras</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Activo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Carrito */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Carrito</CardTitle>
          <CardDescription>
            Activa o desactiva la funcionalidad del carrito de compras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Permitir compras</Label>
              <p className="text-sm text-muted-foreground">
                Cuando esté desactivado, los clientes no podrán agregar productos al carrito
              </p>
            </div>
            <Switch
              checked={allowPurchases}
              onCheckedChange={setAllowPurchases}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
            >
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información importante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
              <span>Cuando el carrito esté desactivado, los usuarios podrán navegar por los productos pero no podrán realizar compras.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
              <span>El mensaje de mantenimiento se mostrará en lugar del botón "Agregar al carrito".</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
              <span>Esta configuración afecta inmediatamente a todos los usuarios de la aplicación móvil.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
              <span>Se recomienda desactivar las compras solo durante períodos de mantenimiento o actualizaciones importantes.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}