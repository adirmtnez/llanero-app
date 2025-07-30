"use client"

import { useState } from "react"
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
}

interface RestaurantForm {
  nombre: string
  logo: File | null
  fotoPortada: File | null
  telefono: string
}

export function AddRestaurantModal({ open, onOpenChange }: AddRestaurantModalProps) {
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Datos del restaurante
      const restaurantData = {
        name: formData.nombre.trim(),
        phone_number: formData.telefono.trim(),
        is_active: true, // Los nuevos restaurantes están activos por defecto
        logo_url: null as string | null,
        cover_image: null as string | null
      }

      console.log('Datos a insertar:', restaurantData)

      // Mock file uploads
      if (formData.logo) {
        console.log('Mock: Uploading logo:', formData.logo.name)
        restaurantData.logo_url = 'mock-logo-url'
      }
      
      if (formData.fotoPortada) {
        console.log('Mock: Uploading cover image:', formData.fotoPortada.name)
        restaurantData.cover_image = 'mock-cover-url'
      }

      // Mock database insertion
      console.log('Mock: Creating restaurant with data:', restaurantData)

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating restaurant:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      
      // Better error handling
      let errorMessage = 'Error desconocido al crear el restaurante'
      
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