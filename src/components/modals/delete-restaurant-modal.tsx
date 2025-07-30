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
  Trash2, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface Restaurant {
  id: string
  name: string
  phone_number: string
  logo_url: string | null
  cover_image: string | null
}

interface DeleteRestaurantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurant: Restaurant | null
  onSuccess?: () => void
}

export function DeleteRestaurantModal({ 
  open, 
  onOpenChange, 
  restaurant,
  onSuccess 
}: DeleteRestaurantModalProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setConfirmationText("")
    setError("")
    setSuccess(false)
  }

  const isConfirmationValid = restaurant && confirmationText.trim() === restaurant.name

  const handleDelete = async () => {

    if (!restaurant) {
      setError("No se encontró el restaurante a eliminar")
      return
    }

    if (!isConfirmationValid) {
      setError(`Debes escribir exactamente "${restaurant.name}" para confirmar`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock deletion
      console.log('Mock: Deleting restaurant with id:', restaurant.id)

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)

    } catch (error: any) {
      console.error('Error deleting restaurant:', error)
      
      let errorMessage = 'Error desconocido al eliminar el restaurante'
      
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

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (!restaurant) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Eliminar Restaurante
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el restaurante{" "}
            <span className="font-semibold">"{restaurant.name}"</span> y todos sus datos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">¡Advertencia!</p>
            </div>
            <p className="text-sm text-red-700">
              Esta acción eliminará permanentemente:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
              <li>El restaurante "{restaurant.name}"</li>
              <li>Todos los productos asociados</li>
              <li>Historial de pedidos</li>
              <li>Configuraciones personalizadas</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Para confirmar, escribe <span className="font-semibold">"{restaurant.name}"</span> en el campo de abajo:
            </Label>
            <Input
              id="confirmation"
              placeholder={`Escribe "${restaurant.name}" para confirmar`}
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value)
                setError("")
              }}
              disabled={isLoading}
              className={!isConfirmationValid && confirmationText ? "border-red-300 focus:border-red-500" : ""}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600">
                El texto no coincide. Debes escribir exactamente "{restaurant.name}"
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
                ¡Restaurante eliminado exitosamente!
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
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar Restaurante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}