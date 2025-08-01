"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { uploadFileToStorage } from "@/lib/storage"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Package, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useBodegonCategories, BodegonCategory } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories, RestaurantCategory } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

interface EditCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: (BodegonCategory & { categoryType: 'bodegon' }) | (RestaurantCategory & { categoryType: 'restaurant' }) | null
  onSuccess?: () => void
}

interface CategoryForm {
  name: string
  type: "bodegon" | "restaurant"
  restaurant_id: string
  image: File | null
  currentImageUrl: string | null
  is_active: boolean
}

export function EditCategoryModal({ open, onOpenChange, category, onSuccess }: EditCategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { updateCategory: updateBodegonCategory } = useBodegonCategories()
  const { updateCategory: updateRestaurantCategory } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    type: "bodegon",
    restaurant_id: "",
    image: null,
    currentImageUrl: null,
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.categoryType,
        restaurant_id: category.categoryType === 'restaurant' && 'restaurant_id' in category ? category.restaurant_id : "",
        image: null,
        currentImageUrl: category.image || null,
        is_active: category.is_active
      })
    }
  }, [category])

  const handleInputChange = (field: keyof CategoryForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleRestaurantChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      restaurant_id: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }))
    setError("")
    setSuccess(false)
  }

  const resetForm = () => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.categoryType,
        restaurant_id: category.categoryType === 'restaurant' && 'restaurant_id' in category ? category.restaurant_id : "",
        image: null,
        currentImageUrl: category.image || null,
        is_active: category.is_active
      })
    }
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!category) return

    if (!formData.name.trim()) {
      setError("El nombre de la categoría es requerido")
      return
    }

    if (formData.type === "restaurant" && !formData.restaurant_id) {
      setError("El restaurante es requerido para categorías de restaurante")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const updateCategory = formData.type === 'bodegon' ? updateBodegonCategory : updateRestaurantCategory
      
      // Prepare update data
      let updateData: any = {
        name: formData.name.trim(),
        is_active: formData.is_active,
        ...(formData.type === "restaurant" && { restaurant_id: formData.restaurant_id })
      }

      // Handle image upload if new image is provided
      if (formData.image) {
        console.log('🔄 Starting image upload for category:', category.id)
        const uploadResult = await uploadFileToStorage(
          formData.image, 
          'categories', 
          `${formData.type}-category-${category.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
        )

        if (uploadResult.error) {
          console.error('❌ Image upload failed:', uploadResult.error)
          toast.error("Error subiendo imagen", {
            description: uploadResult.error
          })
          // Continue without image update
        } else if (uploadResult.url) {
          console.log('✅ Image uploaded successfully:', uploadResult.url)
          updateData.image = uploadResult.url
        }
      }

      // Update category
      const result = await updateCategory(category.id, updateData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success toast
      toast.success("¡Categoría actualizada exitosamente!", {
        description: `${formData.name} ha sido actualizada.`
      })

      // Call success callback
      onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error updating category:', error)
      setError(error.message || 'Error al actualizar la categoría')
      toast.error("Error al actualizar categoría", {
        description: error.message || "Ocurrió un error inesperado"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  const renderFormContent = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          placeholder="Ej: Platos Principales"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={formData.type}
          disabled={true} // Type cannot be changed when editing
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bodegon">Bodegón</SelectItem>
            <SelectItem value="restaurant">Restaurante</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          El tipo no puede ser modificado al editar
        </p>
      </div>

      {formData.type === "restaurant" && (
        <div className="space-y-2">
          <Label htmlFor="restaurant">Restaurante *</Label>
          <Select
            value={formData.restaurant_id}
            onValueChange={handleRestaurantChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un restaurante" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image">Imagen de Categoría</Label>
        {formData.currentImageUrl && !formData.image && (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <img 
              src={formData.currentImageUrl} 
              alt="Current image"
              className="w-10 h-10 object-cover rounded"
            />
            <span className="text-xs text-muted-foreground flex-1">
              Imagen actual
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleInputChange('currentImageUrl', null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange(null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.image && (
          <p className="text-xs text-muted-foreground">
            Nueva imagen: {formData.image.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="is_active">Estado</Label>
        <Select
          value={formData.is_active.toString()}
          onValueChange={(value) => handleInputChange('is_active', value === 'true')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activa</SelectItem>
            <SelectItem value="false">Inactiva</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            ¡Categoría actualizada exitosamente!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Editar Categoría
            </DialogTitle>
            <DialogDescription>
              Modifica la información de la categoría
            </DialogDescription>
          </DialogHeader>

          {renderFormContent()}

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
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Guardar Cambios
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
          <DrawerTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Editar Categoría
          </DrawerTitle>
          <DrawerDescription>
            Modifica la información de la categoría
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          {renderFormContent()}
        </div>
        
        <DrawerFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Guardar Cambios
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