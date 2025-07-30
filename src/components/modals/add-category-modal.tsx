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
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

interface AddCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'category' | 'subcategory'
  productType: 'bodegon' | 'restaurant'
  parentCategoryId?: string
  onSuccess?: (categoryId: string) => void
  createCategory?: (data: any) => Promise<any>
  createSubcategory?: (data: any) => Promise<any>
}

export function AddCategoryModal({
  open,
  onOpenChange,
  type,
  productType,
  parentCategoryId,
  onSuccess,
  createCategory,
  createSubcategory
}: AddCategoryModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError("El nombre es requerido")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      let result

      if (type === 'category' && createCategory) {
        result = await createCategory({
          name: name.trim(),
          description: description.trim() || null
        })
      } else if (type === 'subcategory' && createSubcategory && parentCategoryId) {
        result = await createSubcategory({
          name: name.trim(),
          description: description.trim() || null,
          parent_category_id: parentCategoryId
        })
      }

      if (result && result.id) {
        onSuccess?.(result.id)
        handleClose()
      }
    } catch (err: any) {
      console.error('Error creating category:', err)
      setError(err.message || `Error al crear ${type === 'category' ? 'categoría' : 'subcategoría'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setError("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const title = type === 'category' 
    ? `Nueva Categoría (${productType === 'bodegon' ? 'Bodegón' : 'Restaurante'})`
    : `Nueva Subcategoría (${productType === 'bodegon' ? 'Bodegón' : 'Restaurante'})`

  const placeholder = type === 'category'
    ? "Ej: Bebidas, Snacks, Productos de Limpieza..."
    : "Ej: Gaseosas, Jugos, Cervezas..."

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {type === 'category'
              ? `Crea una nueva categoría para productos de ${productType === 'bodegon' ? 'bodegón' : 'restaurante'}.`
              : `Crea una nueva subcategoría dentro de la categoría seleccionada.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">
              Nombre {type === 'category' ? 'de la categoría' : 'de la subcategoría'} *
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting}
              className={error && !name.trim() ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">
              Descripción (opcional)
            </Label>
            <Input
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve..."
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Crear {type === 'category' ? 'Categoría' : 'Subcategoría'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}