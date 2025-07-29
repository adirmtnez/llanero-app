"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, FileText, Edit } from "lucide-react"
import { PaymentDetailsModal } from "./payment-details-modal"
import { UpdateOrderModal } from "./update-order-modal"

interface OrderProduct {
  name: string
  quantity: number
  price: string
}

interface OrderDetails {
  id: string
  date: string
  time: string
  status: string
  statusColor: string
  amount: string
  products: OrderProduct[]
  shipping: string
  total: string
}

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderDetails | null
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false)
  const [isUpdateOrderOpen, setIsUpdateOrderOpen] = useState(false)
  
  if (!order) return null

  const handlePaymentDetailsClick = () => {
    setIsPaymentDetailsOpen(true)
  }

  const handleClosePaymentDetails = () => {
    setIsPaymentDetailsOpen(false)
  }

  const handleUpdateOrderClick = () => {
    setIsUpdateOrderOpen(true)
  }

  const handleCloseUpdateOrder = () => {
    setIsUpdateOrderOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-left text-lg font-semibold">
            Detalles del pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 min-h-0 py-4">
          {/* Header with title and date */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Factura Digital</h2>
            <p className="text-sm text-muted-foreground">
              {order.date} - {order.time}
            </p>
          </div>

          <Separator className="border-dashed" />

          {/* Order Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ID de Pedido</span>
              <span className="text-sm font-bold">#{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estatus</span>
              <Badge 
                variant={order.statusColor === "green" ? "default" : "destructive"}
                className={
                  order.statusColor === "green" 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monto</span>
              <span className="text-sm font-bold">{order.amount}</span>
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Products */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Productos</h3>
            <div className="space-y-2">
              {order.products.map((product, index) => (
                <div key={index} className="flex justify-between items-start">
                  <span className="text-sm text-left flex-1">
                    {product.quantity}x {product.name}
                  </span>
                  <span className="text-sm font-medium ml-2">{product.price}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm">Envío</span>
              <span className="text-sm">{order.shipping}</span>
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">Total</span>
            <span className="text-base font-bold">{order.total}</span>
          </div>

          <Separator className="border-dashed" />

          {/* Thank you message */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">¡Gracias por su compra!</p>
            <p className="text-xs text-muted-foreground">
              Para soporte: support@example.com
            </p>
          </div>
        </div>

        {/* Fixed footer with action buttons */}
        <div className="pt-4 border-t space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-center" 
            size="sm"
            onClick={handlePaymentDetailsClick}
          >
            <FileText className="h-4 w-4 mr-2" />
            Detalles de pago y envío
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-center" 
            size="sm"
            onClick={handleUpdateOrderClick}
          >
            <Edit className="h-4 w-4 mr-2" />
            Actualizar pedido
          </Button>
        </div>

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          isOpen={isPaymentDetailsOpen}
          onClose={handleClosePaymentDetails}
        />

        {/* Update Order Modal */}
        <UpdateOrderModal
          isOpen={isUpdateOrderOpen}
          onClose={handleCloseUpdateOrder}
        />
      </DialogContent>
    </Dialog>
  )
}