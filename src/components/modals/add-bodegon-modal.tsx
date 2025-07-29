"use client"

import { useState } from "react"
import { useSupabaseConfig } from "@/hooks/use-supabase-config"
import { createClient } from "@supabase/supabase-js"
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
  Upload, 
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
  const { createSupabaseClient, isConfigValid, config } = useSupabaseConfig()
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
    if (!isConfigValid) {
      setError("Configuración de Supabase incompleta. Ve a Configuraciones → Integraciones.")
      return
    }

    if (!config.serviceKey) {
      setError("Se requiere la clave de servicio (service key) para crear bodegones. Configúrala en Integraciones.")
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
      console.log('Configuración Supabase:', {
        url: config.url,
        hasAnonKey: !!config.anonKey,
        hasServiceKey: !!config.serviceKey,
        serviceKeyPrefix: config.serviceKey ? config.serviceKey.substring(0, 20) + '...' : 'No configurada'
      })

      // Usar service key si está disponible para operaciones administrativas
      const supabase = config.serviceKey 
        ? createClient(config.url, config.serviceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            },
            global: {
              headers: {
                'apikey': config.serviceKey,
                'Authorization': `Bearer ${config.serviceKey}`
              }
            }
          })
        : createSupabaseClient()

      // Datos del bodegón
      const bodegonData = {
        name: formData.nombre.trim(),
        address: formData.direccion.trim() || null,
        phone_number: formData.telefono.trim(),
        is_active: true, // Los nuevos bodegones están activos por defecto
        logo_url: null as string | null
      }

      console.log('Datos a insertar:', bodegonData)

      // Subir logo si existe (opcional - requiere bucket configurado)
      try {
        if (formData.logo) {
          const logoFileName = `logo_${Date.now()}_${formData.logo.name}`
          const { data: logoData, error: logoError } = await supabase.storage
            .from('bodegons')
            .upload(`logos/${logoFileName}`, formData.logo)

          if (logoError) {
            console.warn('Error subiendo logo (continuando sin logo):', logoError)
          } else {
            const { data: { publicUrl: logoUrl } } = supabase.storage
              .from('bodegons')
              .getPublicUrl(`logos/${logoFileName}`)
            
            bodegonData.logo_url = logoUrl
          }
        }
      } catch (storageError: any) {
        console.warn('Storage no configurado, continuando sin archivos:', storageError)
        // Mostrar una advertencia más amigable si se intentó subir archivo
        if (formData.logo && storageError?.message?.includes('Bucket not found')) {
          console.info('💡 Para subir archivos, crea un bucket llamado "bodegons" en Supabase Storage')
        }
      }

      // Insertar bodegón en la base de datos
      console.log('Intentando insertar en Supabase...')
      const { data, error: insertError } = await supabase
        .from('bodegons')
        .insert([bodegonData])

      console.log('Respuesta de Supabase:')
      console.log('Data:', data)
      console.log('Error:', insertError)
      console.log('Error completo:', JSON.stringify(insertError, null, 2))

      if (insertError) {
        console.error('Error de inserción:', JSON.stringify(insertError, null, 2))
        throw insertError
      }

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating bodegon:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      
      // Mejor manejo de errores de Supabase
      let errorMessage = 'Error desconocido al crear el bodegón'
      
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
            disabled={isLoading || !isConfigValid || !config.serviceKey}
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