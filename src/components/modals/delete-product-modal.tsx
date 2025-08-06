"use client"

import React, { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Trash2, 
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { BodegonProduct } from "@/types/products"

interface DeleteProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: BodegonProduct | null
  onDelete: (product: BodegonProduct) => void
}

export function DeleteProductModal({
  open,
  onOpenChange,
  product,
  onDelete,
}: DeleteProductModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [deletionStep, setDeletionStep] = useState("")

  const handleDelete = async () => {
    if (!product) return

    setIsLoading(true)
    setError("")
    setDeletionStep("Iniciando eliminación...")

    try {
      // Simulate progress updates
      setDeletionStep("Eliminando inventario relacionado...")
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDeletionStep("Eliminando producto de la base de datos...")
      await onDelete(product)
      
      setDeletionStep("Finalizando eliminación...")
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Show success toast
      toast.success("¡Producto eliminado exitosamente!", {
        description: `${product.name} ha sido eliminado permanentemente.`
      })
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error deleting product:', error)
      setError(error.message || 'Error al eliminar el producto')
      toast.error("Error al eliminar producto", {
        description: error.message || "Ocurrió un error inesperado"
      })
    } finally {
      setIsLoading(false)
      setDeletionStep("")
    }
  }

  const handleCancel = () => {
    setError("")
    setDeletionStep("")
    onOpenChange(false)
  }

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setError("")
      setDeletionStep("")
      setIsLoading(false)
    }
  }, [open])

  const renderContent = () => (
    <div className="space-y-4 py-4">
      {!isLoading ? (
        <>
          <p className="text-center text-muted-foreground">
            ¿Estás seguro de que quieres eliminar el producto <strong>"{product?.name}"</strong>?
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>
        </>
      ) : (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">{deletionStep}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Por favor espera mientras eliminamos el producto y sus datos relacionados...
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-900">
              <Trash2 className="h-5 w-5" />
              Eliminar Producto
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer
            </DialogDescription>
          </DialogHeader>

          {renderContent()}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-red-900">
            <Trash2 className="h-5 w-5" />
            Eliminar Producto
          </DrawerTitle>
          <DrawerDescription>
            Esta acción no se puede deshacer
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          {renderContent()}
        </div>
        
        <DrawerFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar Producto
          </Button>
          <DrawerClose asChild>
            <Button 
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}