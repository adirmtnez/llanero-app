"use client"

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/admin/admin-store'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function ConfiguracionesIntegracionesPage() {
  const { setBreadcrumb } = useAdminStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    anonKey: '',
    serviceKey: ''
  })

  useEffect(() => {
    const breadcrumbItems = [
      { label: 'Admin', path: '/' },
      { label: 'Configuraciones', path: '/configuraciones' },
      { label: 'Integraciones', path: '/configuraciones/integraciones', isActive: true }
    ]
    setBreadcrumb(breadcrumbItems)
  }, [setBreadcrumb])

  const testSupabaseConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (supabaseConfig.url && supabaseConfig.anonKey) {
        setConnectionStatus('success')
        toast.success('Conexión a Supabase exitosa')
      } else {
        setConnectionStatus('error')
        toast.error('Por favor completa todos los campos')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Error al conectar con Supabase')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveConfig = () => {
    toast.success('Configuración guardada correctamente')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Supabase Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Supabase</h3>
                <p className="text-sm text-gray-500">Base de datos PostgreSQL con APIs en tiempo real.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configuración de Supabase</DialogTitle>
                    <DialogDescription>
                      Configura la conexión a tu base de datos Supabase
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="supabase-url">URL del Proyecto</Label>
                      <Input
                        id="supabase-url"
                        placeholder="https://tu-proyecto.supabase.co"
                        value={supabaseConfig.url}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anon-key">Clave Pública (anon)</Label>
                      <Input
                        id="anon-key"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseConfig.anonKey}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-key">Clave de Servicio (opcional)</Label>
                      <Input
                        id="service-key"
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseConfig.serviceKey}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, serviceKey: e.target.value }))}
                      />
                    </div>
                    
                    {/* Connection Status */}
                    {connectionStatus !== 'idle' && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        connectionStatus === 'success' 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}>
                        {connectionStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {connectionStatus === 'success' 
                            ? 'Conexión exitosa' 
                            : 'Error en la conexión'
                          }
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={testSupabaseConnection}
                        disabled={isTestingConnection}
                        className="flex-1"
                      >
                        {isTestingConnection ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Probando...
                          </>
                        ) : (
                          'Probar Conexión'
                        )}
                      </Button>
                      <Button 
                        onClick={handleSaveConfig}
                        disabled={connectionStatus !== 'success'}
                        className="flex-1"
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Configurado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}