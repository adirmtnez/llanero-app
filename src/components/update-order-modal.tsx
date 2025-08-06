"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  CheckCircle, 
  User,
  Save
} from "lucide-react"

interface UpdateOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpdateOrderModal({ isOpen, onClose }: UpdateOrderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto p-6" style={{ maxWidth: '350px' }}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-left text-lg font-semibold">
            Actualizar pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 min-h-0 py-4">
          {/* Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">
              Estatus
            </label>
            <Select defaultValue="entregado">
              <SelectTrigger className="w-full justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <SelectValue placeholder="Seleccionar estatus" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="en-camino">En camino</SelectItem>
                <SelectItem value="preparando">Preparando</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Person */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">
              Repartidor
            </label>
            <Select defaultValue="sin-repartidor">
              <SelectTrigger className="w-full justify-between">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <SelectValue placeholder="Sin repartidor asignado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin-repartidor">Sin repartidor asignado</SelectItem>
                <SelectItem value="juan">Juan Pérez</SelectItem>
                <SelectItem value="maria">María González</SelectItem>
                <SelectItem value="carlos">Carlos Rodríguez</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button className="w-full justify-center">
            <Save className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}