"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { uploadFileToStorage } from "@/lib/storage"
import { useBodegones } from "@/hooks/use-bodegones"
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
  Store, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface AddBodegonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface BodegonForm {
  nombre: string
  direccion: string
  telefono: string
  logo: File | null
}

export function AddBodegonModal({ open, onOpenChange, onSuccess }: AddBodegonModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { createBodegon, updateBodegon } = useBodegones()
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
      // Create bodegon using the hook (includes created_by automatically)
      const result = await createBodegon({
        name: formData.nombre.trim(),
        address: formData.direccion.trim() || null,
        phone_number: formData.telefono.trim(),
        is_active: true,
        logo_url: null // Will be updated after upload
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Upload logo if provided and bodegon was created successfully
      if (formData.logo && result.data) {
        console.log('🔄 Starting logo upload for bodegon:', result.data.id)
        const uploadResult = await uploadFileToStorage(
          formData.logo, 
          'bodegons', 
          `bodegon-${result.data.id}-logo`
        )

        if (uploadResult.error) {
          console.error('❌ Logo upload failed:', uploadResult.error)
          toast.error("Error subiendo logo", {
            description: uploadResult.error
          })
          // Continue without logo - don't fail the entire operation
        } else if (uploadResult.url) {
          // Update bodegon with logo URL
          console.log('✅ Logo uploaded successfully, updating bodegon with URL:', uploadResult.url)
          console.log('🔄 Calling updateBodegon with ID:', result.data.id)
          
          const updateResult = await updateBodegon(result.data.id, {
            logo_url: uploadResult.url
          })
          
          console.log('📤 UpdateBodegon result:', updateResult)
          
          if (updateResult.error) {
            console.error('❌ Failed to update bodegon with logo URL:', updateResult.error)
            toast.error("Error guardando logo", {
              description: updateResult.error
            })
            // Continue - bodegon was created successfully even if logo update failed
          } else {
            console.log('✅ Bodegon updated with logo URL successfully')
          }
        } else {
          console.warn('⚠️ Upload result has no URL and no error')
        }
      }

      // Show success toast
      toast.success("¡Bodegón creado exitosamente!", {
        description: `${formData.nombre} ha sido agregado a tu lista de bodegones.`
      })

      // Call success callback
      onSuccess?.()
      
      // Reset and close
      resetForm()
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating bodegon:', error)
      setError(error.message || 'Error al crear el bodegón')
      toast.error("Error al crear bodegón", {
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
  )

  if (isDesktop) {
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
              Guardar Bodegón
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
            <Store className="h-5 w-5" />
            Agregar Bodegón
          </DrawerTitle>
          <DrawerDescription>
            Completa la información del nuevo bodegón
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
            Guardar Bodegón
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