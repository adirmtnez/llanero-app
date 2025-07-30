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
  Store, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface AddBodegonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BodegonForm {
  nombre: string
  direccion: string
  telefono: string
  logo: File | null
}

export function AddBodegonModal({ open, onOpenChange }: AddBodegonModalProps) {
  const [formData, setFormData] = useState<BodegonForm>({
    nombre: "",
    direccion: "",
    telefono: "",
    logo: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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
    setFormData({
      nombre: "",
      direccion: "",
      telefono: "",
      logo: null
    })
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
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

      console.log('Mock: Creating bodegon with data:', {
        name: formData.nombre.trim(),
        address: formData.direccion.trim() || null,
        phone_number: formData.telefono.trim(),
        is_active: true,
        logo_url: formData.logo ? 'mock-logo-url' : null
      })

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating bodegon:', error)
      setError('Error al crear el bodegón')
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
            <Store className="h-5 w-5" />
            Agregar Bodegón
          </DialogTitle>
          <DialogDescription>
            Completa la información del nuevo bodegón
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
                ¡Bodegón creado exitosamente!
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
            Guardar Bodegón
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}