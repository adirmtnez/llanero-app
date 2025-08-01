"use client"

import { useState } from "react"
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
import { useBodegonSubcategories } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useRestaurantSubcategories } from "@/hooks/restaurants/use-restaurant-subcategories"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

interface AddSubcategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface SubcategoryForm {
  name: string
  description: string
  type: "bodegon" | "restaurant" | ""
  parent_category: string
  restaurant_id: string
  image: File | null
}

export function AddSubcategoryModal({ open, onOpenChange, onSuccess }: AddSubcategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { createSubcategory: createBodegonSubcategory, updateSubcategory: updateBodegonSubcategory } = useBodegonSubcategories()
  const { createSubcategory: createRestaurantSubcategory, updateSubcategory: updateRestaurantSubcategory } = useRestaurantSubcategories()
  const { categories: bodegonCategories } = useBodegonCategories()
  const { categories: restaurantCategories } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  const [formData, setFormData] = useState<SubcategoryForm>({
    name: "",
    description: "",
    type: "",
    parent_category: "",
    restaurant_id: "",
    image: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof SubcategoryForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleTypeChange = (value: "bodegon" | "restaurant") => {
    setFormData(prev => ({
      ...prev,
      type: value,
      parent_category: "", // Reset category selection when type changes
      restaurant_id: "" // Reset restaurant selection when type changes
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
    setFormData({
      name: "",
      description: "",
      type: "",
      parent_category: "",
      restaurant_id: "",
      image: null
    })
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre de la subcategoría es requerido")
      return
    }

    if (!formData.type) {
      setError("El tipo de subcategoría es requerido")
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
      // Create subcategory using the appropriate hook based on type
      const createSubcategory = formData.type === 'bodegon' ? createBodegonSubcategory : createRestaurantSubcategory
      const updateSubcategory = formData.type === 'bodegon' ? updateBodegonSubcategory : updateRestaurantSubcategory
      
      // Prepare subcategory data based on type
      const subcategoryData: any = {
        name: formData.name.trim(),
        parent_category: formData.parent_category,
        is_active: true,
        image: null, // Will be updated after upload
      }

      // Add description for restaurant subcategories
      if (formData.type === "restaurant") {
        subcategoryData.description = formData.description.trim() || null
        subcategoryData.restaurant_id = formData.restaurant_id
      }
      
      const result = await createSubcategory(subcategoryData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Upload image if provided and subcategory was created successfully
      if (formData.image && result.data) {
        console.log('🔄 Starting image upload for subcategory:', result.data.id)
        const uploadResult = await uploadFileToStorage(
          formData.image, 
          'subcategories', 
          `${formData.type}-subcategory-${result.data.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
        )

        if (uploadResult.error) {
          console.error('❌ Image upload failed:', uploadResult.error)
          toast.error("Error subiendo imagen", {
            description: uploadResult.error
          })
          // Continue without image - don't fail the entire operation
        } else if (uploadResult.url) {
          console.log('✅ Image uploaded successfully, updating subcategory with URL:', uploadResult.url)
          
          // Update subcategory with image URL
          const updateResult = await updateSubcategory(result.data.id, {
            image: uploadResult.url
          })
          
          if (updateResult.error) {
            console.error('❌ Failed to update subcategory with image URL:', updateResult.error)
            toast.error("Error guardando imagen", {
              description: updateResult.error
            })
            // Continue - subcategory was created successfully even if image update failed
          } else {
            console.log('✅ Subcategory updated with image URL successfully')
          }
        }
      }

      // Show success toast
      toast.success("¡Subcategoría creada exitosamente!", {
        description: `${formData.name} ha sido agregada a las subcategorías ${formData.type === 'bodegon' ? 'de bodegón' : 'de restaurante'}.`
      })

      // Call success callback
      onSuccess?.()
      
      // Reset and close
      resetForm()
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating subcategory:', error)
      setError(error.message || 'Error al crear la subcategoría')
      toast.error("Error al crear subcategoría", {
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
        <Label htmlFor="type">Tipo *</Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de subcategoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bodegon">Bodegón</SelectItem>
            <SelectItem value="restaurant">Restaurante</SelectItem>
          </SelectContent>
        </Select>
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

      {formData.type && (formData.type === 'bodegon' || (formData.type === 'restaurant' && formData.restaurant_id)) && (
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
      )}

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
            Archivo seleccionado: {formData.image.name}
          </p>
        )}
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
            ¡Subcategoría creada exitosamente!
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
              Agregar Subcategoría
            </DialogTitle>
            <DialogDescription>
              Completa la información de la nueva subcategoría
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
              Guardar Subcategoría
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
            Agregar Subcategoría
          </DrawerTitle>
          <DrawerDescription>
            Completa la información de la nueva subcategoría
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
            Guardar Subcategoría
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