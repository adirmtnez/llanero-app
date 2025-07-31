"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { uploadFileToStorage } from "@/lib/storage"
import { useRestaurants } from "@/hooks/use-restaurants"
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
import { toast } from "sonner"
import { 
  UtensilsCrossed, 
  Upload, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface AddRestaurantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface RestaurantForm {
  nombre: string
  logo: File | null
  fotoPortada: File | null
  telefono: string
}

export function AddRestaurantModal({ open, onOpenChange, onSuccess }: AddRestaurantModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { createRestaurant, updateRestaurant } = useRestaurants()
  const [formData, setFormData] = useState<RestaurantForm>({
    nombre: "",
    logo: null,
    fotoPortada: null,
    telefono: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof RestaurantForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleFileChange = (field: 'logo' | 'fotoPortada', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
    setError("")
    setSuccess(false)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      logo: null,
      fotoPortada: null,
      telefono: ""
    })
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setError("El nombre del restaurante es requerido")
      return
    }

    if (!formData.telefono.trim()) {
      setError("El teléfono es requerido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create restaurant using the hook (includes created_by automatically)
      const result = await createRestaurant({
        name: formData.nombre.trim(),
        phone_number: formData.telefono.trim(),
        is_active: true,
        logo_url: null, // Will be updated after upload
        cover_image: null, // Will be updated after upload
        delivery_available: true,
        pickup_available: true,
        opening_hours: null
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Upload images if provided and restaurant was created successfully
      if (result.data) {
        const updates: { logo_url?: string; cover_image?: string } = {}
        
        // Upload logo if provided
        if (formData.logo) {
          console.log('🔄 Starting logo upload for restaurant:', result.data.id)
          const logoUploadResult = await uploadFileToStorage(
            formData.logo, 
            'restaurants', 
            `restaurant-${result.data.id}-logo`
          )

          if (logoUploadResult.error) {
            console.error('❌ Logo upload failed:', logoUploadResult.error)
            toast.error("Error subiendo logo", {
              description: logoUploadResult.error
            })
          } else if (logoUploadResult.url) {
            console.log('✅ Logo uploaded successfully:', logoUploadResult.url)
            updates.logo_url = logoUploadResult.url
          }
        }

        // Upload cover image if provided
        if (formData.fotoPortada) {
          console.log('🔄 Starting cover image upload for restaurant:', result.data.id)
          const coverUploadResult = await uploadFileToStorage(
            formData.fotoPortada, 
            'restaurants', 
            `restaurant-${result.data.id}-cover`
          )

          if (coverUploadResult.error) {
            console.error('❌ Cover image upload failed:', coverUploadResult.error)
            toast.error("Error subiendo imagen de portada", {
              description: coverUploadResult.error
            })
          } else if (coverUploadResult.url) {
            console.log('✅ Cover image uploaded successfully:', coverUploadResult.url)
            updates.cover_image = coverUploadResult.url
          }
        }

        // Update restaurant with image URLs if any were uploaded
        if (Object.keys(updates).length > 0) {
          console.log('🔄 Updating restaurant with image URLs:', updates)
          const updateResult = await updateRestaurant(result.data.id, updates)
          
          if (updateResult.error) {
            console.error('❌ Failed to update restaurant with image URLs:', updateResult.error)
            toast.error("Error guardando imágenes", {
              description: updateResult.error
            })
          } else {
            console.log('✅ Restaurant updated with image URLs successfully')
          }
        }
      }

      // Show success toast
      toast.success("¡Restaurante creado exitosamente!", {
        description: `${formData.nombre} ha sido agregado a tu lista de restaurantes.`
      })

      // Call success callback
      onSuccess?.()
      
      // Reset and close
      resetForm()
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating restaurant:', error)
      
      let errorMessage = 'Error desconocido al crear el restaurante'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.error_description) {
        errorMessage = error.error_description
      }
      
      setError(errorMessage)
      toast.error("Error al crear restaurante", {
        description: errorMessage
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
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          placeholder="Ej: Pizza Express"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          placeholder="Ej: +1234567890"
          value={formData.telefono}
          onChange={(e) => handleInputChange('telefono', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        <div className="flex items-center gap-2">
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.logo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange('logo', null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.logo && (
          <p className="text-xs text-muted-foreground">
            Archivo seleccionado: {formData.logo.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto-portada">Foto de Portada</Label>
        <div className="flex items-center gap-2">
          <Input
            id="foto-portada"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('fotoPortada', e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.fotoPortada && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileChange('fotoPortada', null)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.fotoPortada && (
          <p className="text-xs text-muted-foreground">
            Archivo seleccionado: {formData.fotoPortada.name}
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
            ¡Restaurante creado exitosamente!
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
              <UtensilsCrossed className="h-5 w-5" />
              Agregar Restaurante
            </DialogTitle>
            <DialogDescription>
              Completa la información del nuevo restaurante
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
              Guardar Restaurante
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
            Agregar Restaurante
          </DrawerTitle>
          <DrawerDescription>
            Completa la información del nuevo restaurante
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
            Guardar Restaurante
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