"use client"

import { useState } from "react"
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
import { useBodegonSubcategories, BodegonSubcategory } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useRestaurantSubcategories, RestaurantSubcategory } from "@/hooks/restaurants/use-restaurant-subcategories"

interface DeleteSubcategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategory: (BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' }) | null
  onSuccess?: () => void
}

export function DeleteSubcategoryModal({ open, onOpenChange, subcategory, onSuccess }: DeleteSubcategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { deleteSubcategory: deleteBodegonSubcategory } = useBodegonSubcategories()
  const { deleteSubcategory: deleteRestaurantSubcategory } = useRestaurantSubcategories()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!subcategory) return

    setIsLoading(true)
    setError("")

    try {
      const deleteSubcategory = subcategory.subcategoryType === 'bodegon' ? deleteBodegonSubcategory : deleteRestaurantSubcategory
      
      const result = await deleteSubcategory(subcategory.id)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success toast
      toast.success("¡Subcategoría eliminada exitosamente!", {
        description: `${subcategory.name} ha sido eliminada permanentemente.`
      })

      // Call success callback
      onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error deleting subcategory:', error)
      setError(error.message || 'Error al eliminar la subcategoría')
      toast.error("Error al eliminar subcategoría", {
        description: error.message || "Ocurrió un error inesperado"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setError("")
    onOpenChange(false)
  }

  const renderContent = () => (
    <div className="space-y-4 py-4">
      <p className="text-center text-muted-foreground">
        ¿Estás seguro de que quieres eliminar la subcategoría <strong>"{subcategory?.name}"</strong>?
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Esta acción no se puede deshacer.
      </p>

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
              Eliminar Subcategoría
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
              Eliminar Subcategoría
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
            Eliminar Subcategoría
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
            Eliminar Subcategoría
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