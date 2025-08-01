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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Package, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useBodegonSubcategories, BodegonSubcategory } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useRestaurantSubcategories, RestaurantSubcategory } from "@/hooks/restaurants/use-restaurant-subcategories"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

interface EditSubcategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategory: (BodegonSubcategory & { subcategoryType: 'bodegon' }) | (RestaurantSubcategory & { subcategoryType: 'restaurant' }) | null
  onSuccess?: () => void
}

interface SubcategoryForm {
  name: string
  description: string
  type: "bodegon" | "restaurant"
  parent_category: string
  restaurant_id: string
  image: File | null
  currentImageUrl: string | null
  is_active: boolean
}

export function EditSubcategoryModal({ open, onOpenChange, subcategory, onSuccess }: EditSubcategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { updateSubcategory: updateBodegonSubcategory } = useBodegonSubcategories()
  const { updateSubcategory: updateRestaurantSubcategory } = useRestaurantSubcategories()
  const { categories: bodegonCategories } = useBodegonCategories()
  const { categories: restaurantCategories } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  const [formData, setFormData] = useState<SubcategoryForm>({
    name: "",
    description: "",
    type: "bodegon",
    parent_category: "",
    restaurant_id: "",
    image: null,
    currentImageUrl: null,
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Initialize form data when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.subcategoryType === 'restaurant' && 'description' in subcategory ? subcategory.description || "" : "",
        type: subcategory.subcategoryType,
        parent_category: subcategory.parent_category,
        restaurant_id: subcategory.subcategoryType === 'restaurant' && 'restaurant_id' in subcategory ? subcategory.restaurant_id : "",
        image: null,
        currentImageUrl: subcategory.image || null,
        is_active: subcategory.is_active
      })
    }
  }, [subcategory])

  const handleInputChange = (field: keyof SubcategoryForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleParentCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      parent_category: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleRestaurantChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      restaurant_id: value,
      parent_category: "" // Reset parent category when restaurant changes
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
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.subcategoryType === 'restaurant' && 'description' in subcategory ? subcategory.description || "" : "",
        type: subcategory.subcategoryType,
        parent_category: subcategory.parent_category,
        restaurant_id: subcategory.subcategoryType === 'restaurant' && 'restaurant_id' in subcategory ? subcategory.restaurant_id : "",
        image: null,
        currentImageUrl: subcategory.image || null,
        is_active: subcategory.is_active
      })
    }
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!subcategory) return

    if (!formData.name.trim()) {
      setError("El nombre de la subcategoría es requerido")
      return
    }

    if (!formData.parent_category) {
      setError("La categoría padre es requerida")
      return
    }

    if (formData.type === "restaurant" && !formData.restaurant_id) {
      setError("El restaurante es requerido para subcategorías de restaurante")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const updateSubcategory = formData.type === 'bodegon' ? updateBodegonSubcategory : updateRestaurantSubcategory
      
      // Prepare update data
      let updateData: any = {
        name: formData.name.trim(),
        parent_category: formData.parent_category,
        is_active: formData.is_active,
      }

      // Add description for restaurant subcategories
      if (formData.type === "restaurant") {
        updateData.description = formData.description.trim() || null
        updateData.restaurant_id = formData.restaurant_id
      }

      // Handle image upload if new image is provided
      if (formData.image) {
        console.log('🔄 Starting image upload for subcategory:', subcategory.id)
        const uploadResult = await uploadFileToStorage(
          formData.image, 
          'subcategories', 
          `${formData.type}-subcategory-${subcategory.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
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

      // Update subcategory
      const result = await updateSubcategory(subcategory.id, updateData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success toast
      toast.success("¡Subcategoría actualizada exitosamente!", {
        description: `${formData.name} ha sido actualizada.`
      })

      // Call success callback
      onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error updating subcategory:', error)
      setError(error.message || 'Error al actualizar la subcategoría')
      toast.error("Error al actualizar subcategoría", {
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

  // Get available categories based on type and restaurant selection
  const availableCategories = formData.type === 'bodegon' 
    ? bodegonCategories 
    : restaurantCategories.filter(cat => 
        formData.type === 'restaurant' && formData.restaurant_id 
          ? cat.restaurant_id === formData.restaurant_id 
          : true
      )

  const renderFormContent = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          placeholder="Ej: Pizzas Tradicionales"
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
        <Label htmlFor="parent_category">Categoría Padre *</Label>
        <Select
          value={formData.parent_category}
          onValueChange={handleParentCategoryChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la categoría padre" />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.type === 'restaurant' && availableCategories.length === 0 && formData.restaurant_id && (
          <p className="text-xs text-muted-foreground text-orange-600">
            El restaurante seleccionado no tiene categorías. Primero debes crear categorías para este restaurante.
          </p>
        )}
      </div>

      {formData.type === "restaurant" && (
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción opcional de la subcategoría"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image">Imagen de Subcategoría</Label>
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
              onClick={() => handleInputChange('currentImageUrl', "")}
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
            ¡Subcategoría actualizada exitosamente!
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
              Editar Subcategoría
            </DialogTitle>
            <DialogDescription>
              Modifica la información de la subcategoría
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
            Editar Subcategoría
          </DrawerTitle>
          <DrawerDescription>
            Modifica la información de la subcategoría
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