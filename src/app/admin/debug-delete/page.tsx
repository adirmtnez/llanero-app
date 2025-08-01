"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBodegonProducts } from "@/hooks/use-bodegon-products"

export default function DebugDeletePage() {
  const [productId, setProductId] = useState("")
  const [testResult, setTestResult] = useState<string>("")
  const { testDeleteRestaurantProduct, deleteRestaurantProduct, loading } = useBodegonProducts()

  const handleTestDelete = async () => {
    if (!productId.trim()) {
      setTestResult("❌ Por favor ingresa un ID de producto")
      return
    }

    setTestResult("🔄 Ejecutando test...")
    console.log("🧪 Starting test for product ID:", productId)
    
    try {
      const result = await testDeleteRestaurantProduct(productId.trim())
      if (result) {
        setTestResult("✅ Test exitoso! El producto fue eliminado correctamente.")
      } else {
        setTestResult("❌ Test falló. Revisa la consola para más detalles.")
      }
    } catch (error) {
      console.error("Test error:", error)
      setTestResult(`❌ Error en el test: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleActualDelete = async () => {
    if (!productId.trim()) {
      setTestResult("❌ Por favor ingresa un ID de producto")
      return
    }

    setTestResult("🔄 Eliminando producto...")
    console.log("🗑️ Starting actual deletion for product ID:", productId)
    
    try {
      const result = await deleteRestaurantProduct(productId.trim())
      if (result) {
        setTestResult("✅ Producto eliminado exitosamente!")
      } else {
        setTestResult("❌ Error al eliminar producto. Revisa la consola para más detalles.")
      }
    } catch (error) {
      console.error("Delete error:", error)
      setTestResult(`❌ Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Eliminación de Productos de Restaurante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">ID del Producto de Restaurante</Label>
            <Input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Ingresa el ID del producto a eliminar"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestDelete}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Probando..." : "Probar Eliminación"}
            </Button>
            
            <Button 
              onClick={handleActualDelete}
              disabled={loading}
              variant="destructive"
            >
              {loading ? "Eliminando..." : "Eliminar Producto"}
            </Button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Resultado:</h3>
              <p className="text-sm whitespace-pre-wrap">{testResult}</p>
            </div>
          )}
          
          <div className="mt-6 p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium mb-2">Instrucciones:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Primero usa "Probar Eliminación" para diagnosticar el problema</li>
              <li>Revisa la consola del navegador para logs detallados</li>
              <li>Si el test es exitoso, usa "Eliminar Producto" para la eliminación real</li>
              <li>Verifica en Supabase que el producto fue eliminado</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}