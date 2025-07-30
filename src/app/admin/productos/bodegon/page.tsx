"use client"

import { useState } from "react"
import { ProductList } from "@/components/products/product-list"
import { ProductForm } from "@/components/products/product-form"
import { BodegonProduct } from "@/types/products"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"

type ViewMode = 'list' | 'create' | 'edit'

export default function BodegonProductsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Manejar creación de producto
  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setViewMode('create')
  }

  // Manejar edición de producto
  const handleEditProduct = (product: BodegonProduct) => {
    setSelectedProduct(product)
    setViewMode('edit')
  }

  // Manejar éxito en formulario
  const handleFormSuccess = (product: BodegonProduct) => {
    setViewMode('list')
    setSelectedProduct(null)
    setRefreshTrigger(prev => prev + 1) // Trigger refresh de la lista
  }

  // Manejar cancelación de formulario
  const handleFormCancel = () => {
    setViewMode('list')
    setSelectedProduct(null)
  }

  // Manejar eliminación
  const handleDeleteProduct = (product: BodegonProduct) => {
    setRefreshTrigger(prev => prev + 1) // Trigger refresh de la lista
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      {viewMode !== 'list' && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleFormCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la Lista
            </Button>
            
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">
                {viewMode === 'create' ? 'Nuevo Producto' : `Editando: ${selectedProduct?.name}`}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Vista de lista */}
      {viewMode === 'list' && (
        <ProductList
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* Vista de formulario */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <ProductForm
          product={selectedProduct ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}