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
  const { createSupabaseClient, isConfigValid, config } = useSupabaseConfig()
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
    if (!isConfigValid) {
      setError("Configuración de Supabase incompleta. Ve a Configuraciones → Integraciones.")
      return
    }

    if (!config.serviceKey) {
      setError("Se requiere la clave de servicio (service key) para crear restaurantes. Configúrala en Integraciones.")
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

      // Datos del restaurante
      const restaurantData = {
        name: formData.nombre.trim(),
        phone_number: formData.telefono.trim(),
        is_active: true, // Los nuevos restaurantes están activos por defecto
        logo_url: null as string | null,
        cover_image: null as string | null
      }

      console.log('Datos a insertar:', restaurantData)

      // Subir archivos si existen (opcional - requiere bucket configurado)
      try {
        if (formData.logo) {
          const logoFileName = `logo_${Date.now()}_${formData.logo.name}`
          const { data: logoData, error: logoError } = await supabase.storage
            .from('restaurants')
            .upload(`logos/${logoFileName}`, formData.logo)

          if (logoError) {
            console.warn('Error subiendo logo (continuando sin logo):', logoError)
          } else {
            const { data: { publicUrl: logoUrl } } = supabase.storage
              .from('restaurants')
              .getPublicUrl(`logos/${logoFileName}`)
            
            restaurantData.logo_url = logoUrl
          }
        }

        if (formData.fotoPortada) {
          const portadaFileName = `portada_${Date.now()}_${formData.fotoPortada.name}`
          const { data: portadaData, error: portadaError } = await supabase.storage
            .from('restaurants')
            .upload(`portadas/${portadaFileName}`, formData.fotoPortada)

          if (portadaError) {
            console.warn('Error subiendo foto de portada (continuando sin foto):', portadaError)
          } else {
            const { data: { publicUrl: portadaUrl } } = supabase.storage
              .from('restaurants')
              .getPublicUrl(`portadas/${portadaFileName}`)
            
            restaurantData.cover_image = portadaUrl
          }
        }
      } catch (storageError: any) {
        console.warn('Storage no configurado, continuando sin archivos:', storageError)
        // Mostrar una advertencia más amigable si se intentaron subir archivos
        if ((formData.logo || formData.fotoPortada) && storageError?.message?.includes('Bucket not found')) {
          console.info('💡 Para subir archivos, crea un bucket llamado "restaurants" en Supabase Storage')
        }
      }

      // Insertar restaurante en la base de datos
      console.log('Intentando insertar en Supabase...')
      const { data, error: insertError } = await supabase
        .from('restaurants')
        .insert([restaurantData])

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
      console.error('Error creating restaurant:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      
      // Mejor manejo de errores de Supabase
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
            disabled={isLoading || !isConfigValid || !config.serviceKey}
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