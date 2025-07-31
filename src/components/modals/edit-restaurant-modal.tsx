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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  UtensilsCrossed, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useRestaurants, Restaurant } from "@/hooks/use-restaurants"

interface EditRestaurantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurant: Restaurant | null
  onSuccess?: () => void
}

interface RestaurantForm {
  name: string
  phone_number: string
  logo_url: File | null
  cover_image: File | null
  currentLogoUrl: string | null
  currentCoverImageUrl: string | null
  delivery_available: boolean
  pickup_available: boolean
  opening_hours: string
  is_active: boolean
}

export function EditRestaurantModal({ open, onOpenChange, restaurant, onSuccess }: EditRestaurantModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { updateRestaurant } = useRestaurants()
  const [formData, setFormData] = useState<RestaurantForm>({
    name: "",
    phone_number: "",
    logo_url: null,
    cover_image: null,
    currentLogoUrl: null,
    currentCoverImageUrl: null,
    delivery_available: true,
    pickup_available: true,
    opening_hours: "",
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Initialize form data when restaurant changes
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        phone_number: restaurant.phone_number,
        logo_url: null,
        cover_image: null,
        currentLogoUrl: restaurant.logo_url || null,
        currentCoverImageUrl: restaurant.cover_image || null,
        delivery_available: restaurant.delivery_available || false,
        pickup_available: restaurant.pickup_available || false,
        opening_hours: restaurant.opening_hours || "",
        is_active: restaurant.is_active !== false
      })
    }
  }, [restaurant])

  const handleInputChange = (field: keyof RestaurantForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
  }

  const handleFileChange = (field: 'logo_url' | 'cover_image', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
    setError("")
  }

  const resetForm = () => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        phone_number: restaurant.phone_number,
        logo_url: null,
        cover_image: null,
        currentLogoUrl: restaurant.logo_url || null,
        currentCoverImageUrl: restaurant.cover_image || null,
        delivery_available: restaurant.delivery_available || false,
        pickup_available: restaurant.pickup_available || false,
        opening_hours: restaurant.opening_hours || "",
        is_active: restaurant.is_active !== false
      })
    }
    setError("")
  }

  const handleSave = async () => {
    if (!restaurant) return

    if (!formData.name.trim()) {
      setError("El nombre del restaurante es requerido")
      return
    }

    if (!formData.phone_number.trim()) {
      setError("El teléfono es requerido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Prepare update data
      let updateData: any = {
        name: formData.name.trim(),
        phone_number: formData.phone_number.trim(),
        delivery_available: formData.delivery_available,
        pickup_available: formData.pickup_available,
        opening_hours: formData.opening_hours.trim() || null,
        is_active: formData.is_active,
      }

      // Handle logo upload if new logo is provided
      if (formData.logo_url) {
        console.log('🔄 Starting logo upload for restaurant:', restaurant.id)
        const uploadResult = await uploadFileToStorage(
          formData.logo_url, 
          'restaurants', 
          `restaurant-logo-${restaurant.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
        )

        if (uploadResult.error) {
          console.error('❌ Logo upload failed:', uploadResult.error)
          toast.error("Error subiendo logo", {
            description: uploadResult.error
          })
        } else if (uploadResult.url) {
          console.log('✅ Logo uploaded successfully:', uploadResult.url)
          updateData.logo_url = uploadResult.url
        }
      }

      // Handle cover image upload if new cover image is provided
      if (formData.cover_image) {
        console.log('🔄 Starting cover image upload for restaurant:', restaurant.id)
        const uploadResult = await uploadFileToStorage(
          formData.cover_image, 
          'restaurants', 
          `restaurant-cover-${restaurant.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
        )

        if (uploadResult.error) {
          console.error('❌ Cover image upload failed:', uploadResult.error)
          toast.error("Error subiendo imagen de portada", {
            description: uploadResult.error
          })
        } else if (uploadResult.url) {
          console.log('✅ Cover image uploaded successfully:', uploadResult.url)
          updateData.cover_image = uploadResult.url
        }
      }

      // Update restaurant
      const result = await updateRestaurant(restaurant.id, updateData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success toast
      toast.success("¡Restaurante actualizado exitosamente!", {
        description: `${formData.name} ha sido actualizado.`
      })

      // Call success callback
      onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error updating restaurant:', error)
      setError(error.message || 'Error al actualizar el restaurante')
      toast.error("Error al actualizar restaurante", {
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
          placeholder="Ej: Pizza Express"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Teléfono *</Label>
        <Input
          id="phone_number"
          placeholder="Ej: +1234567890"
          value={formData.phone_number}
          onChange={(e) => handleInputChange('phone_number', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening_hours">Horario de Atención</Label>
        <Input
          id="opening_hours"
          placeholder="Ej: 10:00-22:00"
          value={formData.opening_hours}
          onChange={(e) => handleInputChange('opening_hours', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="delivery_available">Servicio a Domicilio</Label>
          <Switch
            id="delivery_available"
            checked={formData.delivery_available}
            onCheckedChange={(checked) => handleInputChange('delivery_available', checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pickup_available">Retiro en Local</Label>
          <Switch
            id="pickup_available"
            checked={formData.pickup_available}
            onCheckedChange={(checked) => handleInputChange('pickup_available', checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">Restaurante Activo</Label>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">Logo del Restaurante</Label>
        {formData.currentLogoUrl && !formData.logo_url && (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <img 
              src={formData.currentLogoUrl} 
              alt="Current logo"
              className="w-10 h-10 object-cover rounded"
            />
            <span className="text-xs text-muted-foreground flex-1">
              Logo actual
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleInputChange('currentLogoUrl', "")}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="logo_url"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('logo_url', e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.logo_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange('logo_url', null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.logo_url && (
          <p className="text-xs text-muted-foreground">
            Nuevo logo: {formData.logo_url.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_image">Imagen de Portada</Label>
        {formData.currentCoverImageUrl && !formData.cover_image && (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <img 
              src={formData.currentCoverImageUrl} 
              alt="Current cover"
              className="w-10 h-10 object-cover rounded"
            />
            <span className="text-xs text-muted-foreground flex-1">
              Portada actual
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleInputChange('currentCoverImageUrl', "")}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="cover_image"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('cover_image', e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.cover_image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange('cover_image', null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.cover_image && (
          <p className="text-xs text-muted-foreground">
            Nueva portada: {formData.cover_image.name}
          </p>
        )}
      </div>

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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Editar Restaurante
            </DialogTitle>
            <DialogDescription>
              Modifica la información del restaurante
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
            <UtensilsCrossed className="h-5 w-5" />
            Editar Restaurante
          </DrawerTitle>
          <DrawerDescription>
            Modifica la información del restaurante
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