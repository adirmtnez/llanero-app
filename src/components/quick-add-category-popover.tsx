"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface QuickAddCategoryPopoverProps {
  type: 'category' | 'subcategory'
  onAdd: (name: string) => Promise<string | null> // Returns the new category/subcategory ID
  disabled?: boolean
}

export function QuickAddCategoryPopover({ type, onAdd, disabled = false }: QuickAddCategoryPopoverProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    setLoading(true)
    try {
      const newId = await onAdd(name.trim())
      if (newId) {
        toast.success(`${type === 'category' ? 'Categoría' : 'Subcategoría'} creada exitosamente`)
        setName("")
        setOpen(false)
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      toast.error(`Error al crear ${type === 'category' ? 'categoría' : 'subcategoría'}`)
    } finally {
      setLoading(false)
    }
  }

  const title = type === 'category' ? 'Agregar nueva categoría' : 'Agregar nueva subcategoría'
  const placeholder = type === 'category' ? 'Nombre de la categoría' : 'Nombre de la subcategoría'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {type === 'category' 
                ? 'Crea una nueva categoría para este restaurante'
                : 'Crea una nueva subcategoría para esta categoría'
              }
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSubmit(e as any)
                }
              }}
              placeholder={placeholder}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={loading || !name.trim()}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}