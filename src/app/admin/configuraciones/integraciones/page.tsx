"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Settings } from "lucide-react"
import { SupabaseConfigModal } from "@/components/modals/supabase-config-modal"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function IntegracionesPage() {
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false)
  const supabaseConfigured = isSupabaseConfigured()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground mt-2">
          Configura herramientas de terceros para potenciar tu aplicación
        </p>
      </div>

      <div className="grid gap-6">
        {/* Supabase Integration */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">Supabase</CardTitle>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          supabaseConfigured 
                            ? 'bg-green-500' 
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className={`text-xs font-medium ${
                        supabaseConfigured 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {supabaseConfigured ? 'Configurado' : 'No configurado'}
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Base de datos PostgreSQL como servicio con autenticación y APIs en tiempo real
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setIsSupabaseModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Funcionalidades disponibles:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Base de datos PostgreSQL escalable</li>
                <li>Autenticación y autorización</li>
                <li>APIs REST y GraphQL automáticas</li>
                <li>Almacenamiento de archivos</li>
                <li>Funciones Edge y triggers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <SupabaseConfigModal 
        open={isSupabaseModalOpen}
        onOpenChange={setIsSupabaseModalOpen}
      />
    </div>
  )
}