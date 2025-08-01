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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Package, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurants } from "@/hooks/use-restaurants"

interface AddCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CategoryForm {
  name: string
  type: "bodegon" | "restaurant" | ""
  restaurant_id: string
  image: File | null
}

export function AddCategoryModal({ open, onOpenChange, onSuccess }: AddCategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { createCategory: createBodegonCategory, updateCategory: updateBodegonCategory } = useBodegonCategories()
  const { createCategory: createRestaurantCategory, updateCategory: updateRestaurantCategory } = useRestaurantCategories()
  const { restaurants } = useRestaurants()
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    type: "",
    restaurant_id: "",
    image: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof CategoryForm, value: string) => {
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
      restaurant_id: "" // Reset restaurant selection when type changes
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
    setFormData({
      name: "",
      type: "",
      restaurant_id: "",
      image: null
    })
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre de la categoría es requerido")
      return
    }

    if (!formData.type) {
      setError("El tipo de categoría es requerido")
      return
    }

    if (formData.type === "restaurant" && !formData.restaurant_id) {
      setError("El restaurante es requerido para categorías de restaurante")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create category using the appropriate hook based on type
      const createCategory = formData.type === 'bodegon' ? createBodegonCategory : createRestaurantCategory
      const updateCategory = formData.type === 'bodegon' ? updateBodegonCategory : updateRestaurantCategory
      
      // Prepare category data based on type
      const categoryData = {
        name: formData.name.trim(),
        is_active: true,
        image: null, // Will be updated after upload
        ...(formData.type === "restaurant" && { restaurant_id: formData.restaurant_id })
      }
      
      const result = await createCategory(categoryData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Upload image if provided and category was created successfully
      if (formData.image && result.data) {
        console.log('🔄 Starting image upload for category:', result.data.id)
        const uploadResult = await uploadFileToStorage(
          formData.image, 
          'categories', 
          `${formData.type}-category-${result.data.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
        )

        if (uploadResult.error) {
          console.error('❌ Image upload failed:', uploadResult.error)
          toast.error("Error subiendo imagen", {
            description: uploadResult.error
          })
          // Continue without image - don't fail the entire operation
        } else if (uploadResult.url) {
          console.log('✅ Image uploaded successfully, updating category with URL:', uploadResult.url)
          
          // Update category with image URL
          const updateResult = await updateCategory(result.data.id, {
            image: uploadResult.url
          })
          
          if (updateResult.error) {
            console.error('❌ Failed to update category with image URL:', updateResult.error)
            toast.error("Error guardando imagen", {
              description: updateResult.error
            })
            // Continue - category was created successfully even if image update failed
          } else {
            console.log('✅ Category updated with image URL successfully')
          }
        }
      }

      // Show success toast
      toast.success("¡Categoría creada exitosamente!", {
        description: `${formData.name} ha sido agregada a las categorías ${formData.type === 'bodegon' ? 'de bodegón' : 'de restaurante'}.`
      })

      // Call success callback
      onSuccess?.()
      
      // Reset and close
      resetForm()
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating category:', error)
      setError(error.message || 'Error al crear la categoría')
      toast.error("Error al crear categoría", {
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
        <Label htmlFor="type">Tipo *</Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo de categoría" />
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

      <div className="space-y-2">
        <Label htmlFor="image">Imagen de Categoría</Label>
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
            ¡Categoría creada exitosamente!
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
              Agregar Categoría
            </DialogTitle>
            <DialogDescription>
              Completa la información de la nueva categoría
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
              Guardar Categoría
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
            Agregar Categoría
          </DrawerTitle>
          <DrawerDescription>
            Completa la información de la nueva categoría
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
            Guardar Categoría
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