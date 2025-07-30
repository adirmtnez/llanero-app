"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from "lucide-react"

export default function IntegracionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground mt-2">
          Configura herramientas de terceros para potenciar tu aplicación
        </p>
      </div>

      <div className="space-y-6">
        {/* Database Integration - Disabled */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Database className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Base de Datos Externa (Deshabilitado)</CardTitle>
                  <CardDescription>
                    Las integraciones de base de datos externa han sido removidas del proyecto
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta funcionalidad ha sido removida. El proyecto ahora funciona con datos mock locales.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">El sistema está funcionando con:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos mock locales para desarrollo</li>
                <li>Funcionalidad completa sin dependencias externas</li>
                <li>Interfaz totalmente funcional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}