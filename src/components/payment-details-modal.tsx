"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  User, 
  Phone, 
  MapPin,
  Image,
  MessageCircle
} from "lucide-react"

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaymentDetailsModal({ isOpen, onClose }: PaymentDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto p-6" style={{ maxWidth: '350px' }}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-left text-lg font-semibold">
            Detalles de pago y envío
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 min-h-0 py-4">
          {/* Payment Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Método de pago</h3>
                <p className="text-sm text-gray-600">Pago móvil</p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Cliente</h3>
                <p className="text-sm text-gray-600">Maria Fernanda</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Teléfono</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">+58 414 3510649</p>
                  <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Chat
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Dirección de entrega</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Urbanización roca nostra 2 alfrente de la campiña, 6-12, Cabudare, Lara
                </p>
              </div>
            </div>
          </div>

          {/* View Receipt Button */}
          <div className="pt-2">
            <Button variant="outline" className="w-full justify-center" size="sm">
              <Image className="h-4 w-4 mr-2" />
              Ver comprobante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}