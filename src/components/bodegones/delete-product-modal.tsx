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
import { useBodegonProducts } from "@/hooks/bodegones/use-bodegon-products"

interface DeleteBodegonProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: BodegonProduct | null
  onSuccess?: () => void
}

export function DeleteBodegonProductModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: DeleteBodegonProductModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [deletionStep, setDeletionStep] = useState("")
  
  const { deleteProduct } = useBodegonProducts()

  const handleDelete = async () => {
    if (!product) return

    setIsLoading(true)
    setError("")
    setDeletionStep("Iniciando eliminación...")

    try {
      // Simulate progress updates
      setDeletionStep("Eliminando inventario de bodegones...")
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDeletionStep("Eliminando producto de la base de datos...")
      const success = await deleteProduct(product.id)
      
      if (!success) {
        throw new Error("Error al eliminar el producto de bodegón")
      }
      
      setDeletionStep("Finalizando eliminación...")
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Show success toast
      toast.success("¡Producto de bodegón eliminado exitosamente!", {
        description: `${product.name} y su inventario han sido eliminados permanentemente.`
      })
      
      // Close modal and call success callback
      onOpenChange(false)
      onSuccess?.()

    } catch (error: any) {
      console.error('Error deleting bodegon product:', error)
      setError(error.message || 'Error al eliminar el producto de bodegón')
      toast.error("Error al eliminar producto de bodegón", {
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
            ¿Estás seguro de que quieres eliminar el producto de bodegón <strong>"{product?.name}"</strong>?
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Esta acción eliminará el producto y todo su inventario en los bodegones. No se puede deshacer.
          </p>
        </>
      ) : (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">{deletionStep}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Por favor espera mientras eliminamos el producto y su inventario de bodegones...
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
              Eliminar Producto de Bodegón
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará el producto y su inventario permanentemente
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
              Eliminar Producto de Bodegón
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
            Eliminar Producto de Bodegón
          </DrawerTitle>
          <DrawerDescription>
            Esta acción eliminará el producto y su inventario permanentemente
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
            Eliminar Producto de Bodegón
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