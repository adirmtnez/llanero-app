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
  Store, 
  X, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { useBodegones, Bodegon } from "@/hooks/use-bodegones"

interface EditBodegonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bodegon: Bodegon | null
  onSuccess?: () => void
}

interface BodegonForm {
  name: string
  phone_number: string
  logo_url: File | null
  currentLogoUrl: string | null
  is_active: boolean
}

export function EditBodegonModal({ open, onOpenChange, bodegon, onSuccess }: EditBodegonModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { updateBodegon } = useBodegones()
  const [formData, setFormData] = useState<BodegonForm>({
    name: "",
    phone_number: "",
    logo_url: null,
    currentLogoUrl: null,
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Initialize form data when bodegon changes
  useEffect(() => {
    if (bodegon) {
      setFormData({
        name: bodegon.name,
        phone_number: bodegon.phone_number,
        logo_url: null,
        currentLogoUrl: bodegon.logo_url || null,
        is_active: bodegon.is_active !== false
      })
    }
  }, [bodegon])

  const handleInputChange = (field: keyof BodegonForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("")
  }

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      logo_url: file
    }))
    setError("")
  }

  const resetForm = () => {
    if (bodegon) {
      setFormData({
        name: bodegon.name,
        phone_number: bodegon.phone_number,
        logo_url: null,
        currentLogoUrl: bodegon.logo_url || null,
        is_active: bodegon.is_active !== false
      })
    }
    setError("")
  }

  const handleSave = async () => {
    if (!bodegon) return

    if (!formData.name.trim()) {
      setError("El nombre del bodegón es requerido")
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
        is_active: formData.is_active,
      }

      // Handle logo upload if new logo is provided
      if (formData.logo_url) {
        console.log('🔄 Starting logo upload for bodegon:', bodegon.id)
        const uploadResult = await uploadFileToStorage(
          formData.logo_url, 
          'bodegones', 
          `bodegon-logo-${bodegon.id}-${formData.name.replace(/\s+/g, '-').toLowerCase()}`
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

      // Update bodegon
      const result = await updateBodegon(bodegon.id, updateData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success toast
      toast.success("¡Bodegón actualizado exitosamente!", {
        description: `${formData.name} ha sido actualizado.`
      })

      // Call success callback
      onSuccess?.()
      
      // Close modal
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error updating bodegon:', error)
      setError(error.message || 'Error al actualizar el bodegón')
      toast.error("Error al actualizar bodegón", {
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
          placeholder="Ej: Bodegón Central"
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

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Bodegón Activo</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">Logo del Bodegón</Label>
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
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={isLoading}
            className="flex-1"
          />
          {formData.logo_url && (
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
        {formData.logo_url && (
          <p className="text-xs text-muted-foreground">
            Nuevo logo: {formData.logo_url.name}
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
              <Store className="h-5 w-5" />
              Editar Bodegón
            </DialogTitle>
            <DialogDescription>
              Modifica la información del bodegón
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
            <Store className="h-5 w-5" />
            Editar Bodegón
          </DrawerTitle>
          <DrawerDescription>
            Modifica la información del bodegón
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