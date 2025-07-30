"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { 
  Database, 
  CheckCircle2,
  AlertTriangle,
  TestTube,
  RefreshCw,
  Info
} from "lucide-react"

export default function TestSupabasePage() {
  const { config, isConfigValid, createSupabaseClient } = useSupabaseConfig()
  const [testResults, setTestResults] = useState<any>(null)
  const [isTestingAdvanced, setIsTestingAdvanced] = useState(false)

  const runAdvancedTest = async () => {
    if (!isConfigValid) {
      setTestResults({
        success: false,
        error: "Configuración de Supabase incompleta"
      })
      return
    }

    setIsTestingAdvanced(true)
    setTestResults(null)

    try {
      const supabase = createSupabaseClient()
      
      interface TestResult {
        name: string
        success: boolean
        details: string
      }

      const results = {
        success: true,
        tests: [] as TestResult[],
        projectInfo: {} as any
      }

      // Test 1: Verificar autenticación
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        results.tests.push({
          name: "Autenticación",
          success: !authError || authError.message === "Auth session missing!",
          details: authError?.message || "OK - No hay sesión activa (esperado)"
        })
      } catch (error) {
        results.tests.push({
          name: "Autenticación",
          success: false,
          details: `Error: ${error}`
        })
      }

      // Test 2: Verificar acceso a la base de datos (intentar leer metadatos)
      try {
        // Intentar una consulta simple que no requiere tablas específicas
        const { data, error } = await supabase.rpc('version')
        
        if (error && !error.message.includes("not found")) {
          throw error
        }
        
        results.tests.push({
          name: "Conexión a Base de Datos",
          success: true,
          details: "Conexión exitosa a PostgreSQL"
        })
      } catch (error: any) {
        if (error.message?.includes("not found") || error.message?.includes("not defined")) {
          results.tests.push({
            name: "Conexión a Base de Datos",
            success: true,
            details: "Conexión exitosa (función version no disponible - normal)"
          })
        } else {
          results.tests.push({
            name: "Conexión a Base de Datos",
            success: false,
            details: `Error: ${error.message}`
          })
        }
      }

      // Test 3: Verificar Storage (opcional)
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
        results.tests.push({
          name: "Storage",
          success: !storageError,
          details: storageError?.message || `${buckets?.length || 0} buckets encontrados`
        })
      } catch (error: any) {
        results.tests.push({
          name: "Storage",
          success: false,
          details: `Error: ${error.message}`
        })
      }

      // Información del proyecto
      results.projectInfo = {
        url: config.url,
        hasAnonKey: !!config.anonKey,
        hasServiceKey: !!config.serviceKey,
        timestamp: new Date().toLocaleString()
      }

      setTestResults(results)
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message || "Error desconocido durante las pruebas"
      })
    } finally {
      setIsTestingAdvanced(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Test Avanzado de Supabase</h1>
        <p className="text-muted-foreground mt-2">
          Prueba completa de la integración con Supabase
        </p>
      </div>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">URL del Proyecto:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {config.url || "No configurada"}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Clave Anónima:</span>
              <Badge variant={config.anonKey ? "default" : "secondary"}>
                {config.anonKey ? "Configurada" : "No configurada"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Clave de Servicio:</span>
              <Badge variant={config.serviceKey ? "default" : "secondary"}>
                {config.serviceKey ? "Configurada" : "No configurada"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Button */}
      <Card>
        <CardHeader>
          <CardTitle>Ejecutar Pruebas</CardTitle>
          <CardDescription>
            Prueba conexión, autenticación, base de datos y storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAdvancedTest}
            disabled={!isConfigValid || isTestingAdvanced}
            className="w-full"
          >
            {isTestingAdvanced ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            {isTestingAdvanced ? "Ejecutando pruebas..." : "Ejecutar Pruebas Completas"}
          </Button>
          
          {!isConfigValid && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configura Supabase en la sección de Integraciones antes de ejecutar las pruebas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Resultados de las Pruebas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{testResults.error}</AlertDescription>
              </Alert>
            ) : (
              <>
                {testResults.tests?.map((test: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-muted-foreground">{test.details}</div>
                      </div>
                    </div>
                    <Badge variant={test.success ? "default" : "destructive"}>
                      {test.success ? "OK" : "Error"}
                    </Badge>
                  </div>
                ))}
                
                {testResults.projectInfo && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Información del Proyecto</h4>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>URL: {testResults.projectInfo.url}</div>
                      <div>Prueba ejecutada: {testResults.projectInfo.timestamp}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}