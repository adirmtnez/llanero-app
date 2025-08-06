"use client"

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/admin/admin-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Shield, Key, Clock, Save } from "lucide-react"

export function ConfiguracionesSeguridad() {
  const { setBreadcrumb } = useAdminStore()
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('60')
  const [passwordPolicy, setPasswordPolicy] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { label: 'Admin', path: '/' },
      { label: 'Configuraciones', path: '/configuraciones' },
      { label: 'Seguridad', path: '/configuraciones/seguridad', isActive: true }
    ]
    setBreadcrumb(breadcrumbItems)
  }, [setBreadcrumb])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración de seguridad guardada')
    } catch (err) {
      toast.error('Error al guardar configuraciones')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Two Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-base font-medium">Activar 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Requiere un código adicional al iniciar sesión
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestión de Sesiones
          </CardTitle>
          <CardDescription>
            Configura el tiempo de vida de las sesiones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tiempo de expiración (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Las sesiones expirarán automáticamente después de este tiempo de inactividad
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Política de Contraseñas
          </CardTitle>
          <CardDescription>
            Configura los requisitos de seguridad para las contraseñas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-base font-medium">Política de contraseñas estricta</Label>
              <p className="text-sm text-muted-foreground">
                Requiere contraseñas con al menos 8 caracteres, mayúsculas, minúsculas y números
              </p>
            </div>
            <Switch
              checked={passwordPolicy}
              onCheckedChange={setPasswordPolicy}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  )
}