"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Product {
  id: string
  name: string
  sku: string
  status: string
  inventory: string
  category: string
  price: string
}

interface DeleteProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onDelete: (productId: string) => void
}

export function DeleteProductModal({ 
  open, 
  onOpenChange, 
  product, 
  onDelete 
}: DeleteProductModalProps) {
  const handleDelete = () => {
    if (product) {
      onDelete(product.id)
      onOpenChange(false)
    }
  }

  if (!product) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar "{product.name}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}