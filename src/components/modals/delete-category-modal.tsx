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
import { useBodegonCategories, BodegonCategory } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories, RestaurantCategory } from "@/hooks/restaurants/use-restaurant-categories"
import { useBodegonSubcategories } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useRestaurantSubcategories } from "@/hooks/restaurants/use-restaurant-subcategories"

interface DeleteCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: (BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' }) | null
  onSuccess?: () => void
}

export function DeleteCategoryModal({ open, onOpenChange, category, onSuccess }: DeleteCategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { deleteCategory: deleteBodegonCategory } = useBodegonCategories()
  const { deleteCategory: deleteRestaurantCategory } = useRestaurantCategories()
  const { subcategories: bodegonSubcategories } = useBodegonSubcategories()
  const { subcategories: restaurantSubcategories } = useRestaurantSubcategories()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if category has associated subcategories
  const hasAssociatedSubcategories = () => {
    if (!category) return false
    
    if (category.categoryType === 'bodegon') {
      return bodegonSubcategories.some(sub => sub.parent_category === category.id)
    } else {
      return restaurantSubcategories.some(sub => sub.parent_category === category.id)
    }
  }

  const getAssociatedSubcategoriesCount = () => {
    if (!category) return 0
    
    if (category.categoryType === 'bodegon') {
      return bodegonSubcategories.filter(sub => sub.parent_category === category.id).length
    } else {
      return restaurantSubcategories.filter(sub => sub.parent_category === category.id).length
    }
  }

  const handleDelete = async () => {
    if (!category) return

    // Check if category has associated subcategories
    if (hasAssociatedSubcategories()) {
      const count = getAssociatedSubcategoriesCount()
      setError(`Esta categoría tiene ${count} subcategoría${count > 1 ? 's' : ''} asociada${count > 1 ? 's' : ''}. Primero debe eliminar las subcategorías antes de eliminar la categoría.`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const deleteCategory = category.categoryType === 'bodegon' ? deleteBodegonCategory : deleteRestaurantCategory
      
      console.log('🗑️ Attempting to delete category:', { id: category.id, name: category.name, type: category.categoryType })
      const result = await deleteCategory(category.id)
      console.log('🗑️ Delete result:', result)

      // Check for error in different possible formats
      if (result && (result.error || result.success === false)) {
        throw new Error(result.error || 'Error al eliminar categoría')
      }

      console.log('🗑️ Delete successful, showing toast and calling callbacks')
      
      // Show success toast
      toast.success("¡Categoría eliminada exitosamente!", {
        description: `${category.name} ha sido eliminada permanentemente.`
      })

      // Call success callback to refresh the list
      console.log('🗑️ Calling onSuccess callback')
      await onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error deleting category:', error)
      setError(error.message || 'Error al eliminar la categoría')
      toast.error("Error al eliminar categoría", {
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

  const renderContent = () => {
    const hasSubcategories = hasAssociatedSubcategories()
    const subcategoriesCount = getAssociatedSubcategoriesCount()

    return (
      <div className="space-y-4 py-4">
        <p className="text-center text-muted-foreground">
          ¿Estás seguro de que quieres eliminar la categoría <strong>"{category?.name}"</strong>?
        </p>
        
        {hasSubcategories && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>¡Atención!</strong> Esta categoría tiene {subcategoriesCount} subcategoría{subcategoriesCount > 1 ? 's' : ''} asociada{subcategoriesCount > 1 ? 's' : ''}. 
              Primero debe eliminar las subcategorías antes de eliminar la categoría.
            </AlertDescription>
          </Alert>
        )}
        
        {!hasSubcategories && (
          <p className="text-center text-sm text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-900">
              <Trash2 className="h-5 w-5" />
              Eliminar Categoría
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
              disabled={isLoading || hasAssociatedSubcategories()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Categoría
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
            Eliminar Categoría
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
            disabled={isLoading || hasAssociatedSubcategories()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar Categoría
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