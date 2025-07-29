"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Puzzle, ArrowRight } from "lucide-react"

export default function ConfiguracionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuraciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la configuración de tu aplicación y las integraciones con servicios externos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Estatus de App</CardTitle>
                <CardDescription>
                  Controla el acceso al carrito de compras en la app del cliente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Activa o desactiva temporalmente la funcionalidad del carrito de compras para realizar mantenimiento o controlar las ventas.
            </p>
            <Button asChild className="w-full">
              <a href="/admin/configuraciones/estatus-app" className="flex items-center justify-center gap-2">
                Configurar
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Puzzle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Integraciones</CardTitle>
                <CardDescription>
                  Configura herramientas de terceros como Supabase
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conecta servicios externos como bases de datos, sistemas de pago y otras herramientas para potenciar tu aplicación.
            </p>
            <Button asChild className="w-full">
              <a href="/admin/configuraciones/integraciones" className="flex items-center justify-center gap-2">
                Configurar
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}