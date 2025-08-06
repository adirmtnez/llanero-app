"use client"

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/admin/admin-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Bell, Mail, MessageSquare, Save } from "lucide-react"

export function ConfiguracionesNotificacionesPage() {
  const { setBreadcrumb } = useAdminStore()
  
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { label: 'Admin', path: '/' },
      { label: 'Configuraciones', path: '/configuraciones' },
      { label: 'Notificaciones', path: '/configuraciones/notificaciones', isActive: true }
    ]
    setBreadcrumb(breadcrumbItems)
  }, [setBreadcrumb])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración de notificaciones guardada')
    } catch (err) {
      toast.error('Error al guardar configuraciones')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificaciones por Email
          </CardTitle>
          <CardDescription>
            Configura las notificaciones que se envían por correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-base font-medium">Activar notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes en tu correo electrónico
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Configura las notificaciones push para dispositivos móviles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-base font-medium">Activar notificaciones push</Label>
              <p className="text-sm text-muted-foreground">
                Envía notificaciones directamente a los dispositivos móviles
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={setPushEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notificaciones SMS
          </CardTitle>
          <CardDescription>
            Configura las notificaciones por mensaje de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-base font-medium">Activar notificaciones SMS</Label>
              <p className="text-sm text-muted-foreground">
                Envía notificaciones críticas por mensaje de texto
              </p>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
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