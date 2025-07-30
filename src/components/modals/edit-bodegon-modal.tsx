"use client"

import { useState, useEffect } from "react"
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
  Store, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface Bodegon {
  id: string
  name: string
  address: string | null
  phone_number: string
  is_active: boolean
  logo_url: string | null
}

interface EditBodegonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bodegon: Bodegon | null
  onSuccess?: () => void
}

interface BodegonForm {
  nombre: string
  direccion: string
  telefono: string
  status: string
  logo: File | null
}

export function EditBodegonModal({ 
  open, 
  onOpenChange, 
  bodegon,
  onSuccess 
}: EditBodegonModalProps) {
  const [formData, setFormData] = useState<BodegonForm>({
    nombre: "",
    direccion: "",
    telefono: "",
    status: "activo",
    logo: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Cargar datos del bodegón cuando se abre el modal
  useEffect(() => {
    if (open && bodegon) {
      console.log('Datos del bodegón recibidos en el modal:', bodegon)
      console.log('Logo URL:', bodegon.logo_url)
      
      setFormData({
        nombre: bodegon.name || "",
        direccion: bodegon.address || "",
        telefono: bodegon.phone_number || "",
        status: bodegon.is_active !== false ? "activo" : "inactivo",
        logo: null
      })
      setError("")
      setSuccess(false)
    }
  }, [open, bodegon])

  const handleInputChange = (field: keyof BodegonForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
    setSuccess(false)
  }

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      logo: file
    }))
    setError("")
    setSuccess(false)
  }

  const resetForm = () => {
    if (bodegon) {
      setFormData({
        nombre: bodegon.name || "",
        direccion: bodegon.address || "",
        telefono: bodegon.phone_number || "",
        status: bodegon.is_active !== false ? "activo" : "inactivo",
        logo: null
      })
    }
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {

    if (!bodegon) {
      setError("No se encontró el bodegón a editar")
      return
    }

    if (!formData.nombre.trim()) {
      setError("El nombre del bodegón es requerido")
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

      // Datos del bodegón a actualizar
      const bodegonData = {
        name: formData.nombre.trim(),
        address: formData.direccion.trim() || null,
        phone_number: formData.telefono.trim(),
        is_active: formData.status === "activo",
        logo_url: bodegon.logo_url
      }

      // Mock file upload
      if (formData.logo) {
        console.log('Mock: Uploading logo:', formData.logo.name)
        bodegonData.logo_url = 'mock-logo-url'
      }

      // Mock database update
      console.log('Mock: Updating bodegon with data:', bodegonData)

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)

    } catch (error: any) {
      console.error('Error updating bodegon:', error)
      
      let errorMessage = 'Error desconocido al actualizar el bodegón'
      
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

  if (!bodegon) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Editar Bodegón
          </DialogTitle>
          <DialogDescription>
            Actualiza la información de {bodegon.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Bodegón Central"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              placeholder="Ej: Av. Principal #123, Ciudad"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
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
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                disabled={isLoading}
                className="flex-1"
              />
              {formData.logo && (
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
            {formData.logo && (
              <p className="text-xs text-muted-foreground">
                Archivo seleccionado: {formData.logo.name}
              </p>
            )}
            {bodegon.logo_url && !formData.logo && (
              <p className="text-xs text-muted-foreground">
                Logo actual: <a href={bodegon.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver imagen</a>
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
                ¡Bodegón actualizado exitosamente!
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
            Actualizar Bodegón
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}