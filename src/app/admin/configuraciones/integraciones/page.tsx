"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { 
  Database, 
  Key,
  CheckCircle2,
  AlertTriangle,
  Save,
  TestTube,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown
} from "lucide-react"

export default function IntegracionesPage() {
  const {
    config: supabaseConfig,
    hasChanges,
    connectionStatus,
    errorMessage,
    updateConfig: handleSupabaseChange,
    saveConfig: handleSave,
    testConnection,
    resetConfig,
    isConfigValid
  } = useSupabaseConfig()
  
  const [showKeys, setShowKeys] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState("supabase")

  const getStatusBadge = (status: typeof connectionStatus) => {
    switch (status) {
      case "testing":
        return <Badge variant="secondary">Probando...</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Conectado</Badge>
      case "error":
        return <Badge variant="destructive">Error de conexión</Badge>
      default:
        return <Badge variant="outline">No configurado</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground mt-2">
          Configura herramientas de terceros para potenciar tu aplicación
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Label htmlFor="integration-select" className="text-base font-medium">
            Seleccionar integración:
          </Label>
          <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Selecciona una integración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supabase">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  Supabase
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIntegration === "supabase" && (
          <div className="space-y-6">
          {/* Supabase Integration */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Supabase</CardTitle>
                    <CardDescription>
                      Base de datos PostgreSQL en la nube con autenticación y API en tiempo real
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(connectionStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">URL del proyecto</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://tu-proyecto.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => handleSupabaseChange("url", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-anon-key">Clave anónima (anon key)</Label>
                  <div className="relative">
                    <Input
                      id="supabase-anon-key"
                      type={showKeys ? "text" : "password"}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseConfig.anonKey}
                      onChange={(e) => handleSupabaseChange("anonKey", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabase-service-key">Clave de servicio (service_role key)</Label>
                <div className="relative">
                  <Input
                    id="supabase-service-key"
                    type={showKeys ? "text" : "password"}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConfig.serviceKey}
                    onChange={(e) => handleSupabaseChange("serviceKey", e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  La clave de servicio se usa para operaciones administrativas. Manténla segura.
                </p>
              </div>

              {connectionStatus === "error" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {errorMessage || "No se pudo conectar a Supabase. Verifica que las credenciales sean correctas."}
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "success" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Conexión exitosa con Supabase. La base de datos está configurada correctamente.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={testConnection}
                  disabled={!isConfigValid || connectionStatus === "testing"}
                  variant="outline"
                  className="sm:w-auto w-full"
                >
                  {connectionStatus === "testing" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {connectionStatus === "testing" ? "Probando..." : "Probar conexión"}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="sm:w-auto w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar configuración
                </Button>
                <Button 
                  onClick={resetConfig}
                  variant="ghost"
                  className="sm:w-auto w-full"
                >
                  Restablecer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cómo obtener tus credenciales de Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Pasos para configurar Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ve a tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com/dashboard</a></li>
                  <li>En el menú lateral, ve a "Settings" → "API"</li>
                  <li>Copia la "URL" del proyecto</li>
                  <li>Copia la "anon public" key</li>
                  <li>Copia la "service_role" key (solo para operaciones administrativas)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes cambios sin guardar. Recuerda guardar la configuración antes de salir.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}