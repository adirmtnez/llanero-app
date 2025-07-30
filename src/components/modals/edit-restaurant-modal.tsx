"use client"

import { useState, useEffect } from "react"
import { Restaurant } from "@/hooks/use-restaurants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  UtensilsCrossed, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface EditRestaurantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurant: Restaurant | null
  onSuccess?: () => void
}

interface RestaurantForm {
  nombre: string
  telefono: string
  status: string
  logo: File | null
  fotoPortada: File | null
}

export function EditRestaurantModal({ 
  open, 
  onOpenChange, 
  restaurant,
  onSuccess 
}: EditRestaurantModalProps) {
  const [formData, setFormData] = useState<RestaurantForm>({
    nombre: "",
    telefono: "",
    status: "activo",
    logo: null,
    fotoPortada: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Cargar datos del restaurante cuando se abre el modal
  useEffect(() => {
    if (open && restaurant) {
      console.log('Datos del restaurante recibidos en el modal:', restaurant)
      console.log('Logo URL:', restaurant.logo_url)
      console.log('Cover Image URL:', restaurant.cover_image)
      
      setFormData({
        nombre: restaurant.name || "",
        telefono: restaurant.phone_number || "",
        status: (restaurant.is_active ?? true) ? "activo" : "inactivo",
        logo: null,
        fotoPortada: null
      })
      setError("")
      setSuccess(false)
    }
  }, [open, restaurant])

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
    if (restaurant) {
      setFormData({
        nombre: restaurant.name || "",
        telefono: restaurant.phone_number || "",
        status: (restaurant.is_active ?? true) ? "activo" : "inactivo",
        logo: null,
        fotoPortada: null
      })
    }
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {

    if (!restaurant) {
      setError("No se encontró el restaurante a editar")
      return
    }

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Datos del restaurante a actualizar
      const restaurantData = {
        name: formData.nombre.trim(),
        phone_number: formData.telefono.trim(),
        is_active: formData.status === "activo",
        logo_url: restaurant.logo_url,
        cover_image: restaurant.cover_image
      }

      // Mock file uploads
      if (formData.logo) {
        console.log('Mock: Uploading logo:', formData.logo.name)
        restaurantData.logo_url = 'mock-logo-url'
      }
      
      if (formData.fotoPortada) {
        console.log('Mock: Uploading cover image:', formData.fotoPortada.name)
        restaurantData.cover_image = 'mock-cover-url'
      }

      // Mock database update
      console.log('Mock: Updating restaurant with data:', restaurantData)

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)

    } catch (error: any) {
      console.error('Error updating restaurant:', error)
      
      let errorMessage = 'Error desconocido al actualizar el restaurante'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.error_description) {
        errorMessage = error.error_description
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  if (!restaurant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Editar Restaurante
          </DialogTitle>
          <DialogDescription>
            Actualiza la información de {restaurant.name}
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="status">Estatus</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
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
            {restaurant.logo_url && !formData.logo && (
              <p className="text-xs text-muted-foreground">
                Logo actual: <a href={restaurant.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver imagen</a>
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
            {restaurant.cover_image && !formData.fotoPortada && (
              <p className="text-xs text-muted-foreground">
                Foto actual: <a href={restaurant.cover_image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver imagen</a>
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
                ¡Restaurante actualizado exitosamente!
              </AlertDescription>
            </Alert>
          )}
        </div>

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
            Actualizar Restaurante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}