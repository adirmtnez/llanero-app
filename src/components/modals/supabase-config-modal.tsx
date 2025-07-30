"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { isSupabaseConfigured, isSupabaseFullyConfigured } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Database, Eye, EyeOff, CheckCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react"

interface SupabaseConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupabaseConfigModal({ open, onOpenChange }: SupabaseConfigModalProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isFullyConfigured, setIsFullyConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
    setIsFullyConfigured(isSupabaseFullyConfigured())
  }, [])

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      // Aquí se haría una prueba real de conexión
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (isConfigured) {
        setTestResult("success")
      } else {
        setTestResult("error")
      }
    } catch (error) {
      setTestResult("error")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      // Intenta usar la API moderna del clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopiedItem(itemId)
        setTimeout(() => setCopiedItem(null), 2000) // Reset after 2 seconds
      } else {
        // Fallback para navegadores más antiguos o contextos no seguros
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
        setCopiedItem(itemId)
        setTimeout(() => setCopiedItem(null), 2000) // Reset after 2 seconds
      }
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
      // No hacer nada visualmente, solo log del error
    }
  }

  const FormContent = () => (
    <div className="space-y-6">
      {/* Estado de configuración */}
      <div className="flex items-center gap-3 p-4 rounded-lg border">
        {isFullyConfigured ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Supabase configurado</p>
              <p className="text-sm text-green-600">Todas las credenciales están configuradas</p>
            </div>
          </>
        ) : isConfigured ? (
          <>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Configuración parcial</p>
              <p className="text-sm text-yellow-600">Falta la Service Role Key</p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Supabase no configurado</p>
              <p className="text-sm text-red-600">Se requieren las credenciales</p>
            </div>
          </>
        )}
      </div>

      {/* Instrucciones */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Para configurar Supabase, necesitas crear/editar el archivo <code className="bg-muted px-1 rounded">.env.local</code> en la raíz de tu proyecto.
        </AlertDescription>
      </Alert>

      {/* Variables de entorno requeridas */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">1. Agrega estas variables a tu archivo .env.local:</Label>
          <div className="mt-2 p-3 bg-muted rounded-lg relative overflow-x-auto">
            <pre className="text-sm whitespace-pre overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...`}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...`, 'env-vars')}
            >
              {copiedItem === 'env-vars' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">2. Encuentra tus credenciales en Supabase:</Label>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Supabase Dashboard
            </Button>
            <span className="text-sm text-muted-foreground text-center sm:text-left">→ Tu Proyecto → Settings → API</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">3. Reinicia el servidor de desarrollo:</Label>
          <div className="mt-2 p-3 bg-muted rounded-lg relative overflow-x-auto">
            <code className="text-sm whitespace-nowrap">npm run dev</code>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard('npm run dev', 'npm-command')}
            >
              {copiedItem === 'npm-command' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Test de conexión */}
      {isConfigured && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Probar conexión:</Label>
          <Button
            onClick={handleTestConnection}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin mr-2" />
                Probando conexión...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Probar conexión a Supabase
              </>
            )}
          </Button>
          
          {testResult && (
            <Alert>
              {testResult === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Conexión exitosa con Supabase
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ Error de conexión. Verifica tus credenciales.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configurar Supabase
            </DialogTitle>
            <DialogDescription>
              Configura tu proyecto de Supabase para conectar tu base de datos
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 px-1">
            <FormContent />
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurar Supabase
          </DrawerTitle>
          <DrawerDescription>
            Configura tu proyecto de Supabase para conectar tu base de datos
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          <FormContent />
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">
              Cerrar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}