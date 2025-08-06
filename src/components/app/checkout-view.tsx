'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrimaryButton } from '@/components/ui/primary-button'
import { ArrowLeft, Bike, Store, Smartphone, Building, Globe } from 'lucide-react'
import OrderConfirmationDrawer from './order-confirmation-drawer'

interface CheckoutViewProps {
  isOpen: boolean
  onClose: () => void
  cartTotal: number
  cartItems: any[]
}

export default function CheckoutView({ isOpen, onClose, cartTotal, cartItems }: CheckoutViewProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'pago-movil' | 'transferencia' | 'zelle' | 'banesco'>('pago-movil')
  const [subtotal, setSubtotal] = useState('')
  const [shipping, setShipping] = useState('')
  const [total, setTotal] = useState('')
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const handleRealizarPedido = () => {
    setIsConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false)
  }

  const handleConfirmationBack = () => {
    setIsConfirmationOpen(false)
  }

  const handleConfirmationContinue = () => {
    // Aquí iría la lógica para procesar el pedido
    console.log('Procesando pedido...')
    setIsConfirmationOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F2F3F6' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold">Checkout</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Modo de entrega */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Modo de entrega</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                deliveryMethod === 'delivery' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(deliveryMethod === 'delivery' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Bike className="text-gray-600" />
              <span className="text-sm font-medium">Delivery</span>
            </button>
            
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                deliveryMethod === 'pickup' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(deliveryMethod === 'pickup' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Store className="text-gray-600" />
              <span className="text-sm font-medium">Pickup</span>
            </button>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Método de pago</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('pago-movil')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                paymentMethod === 'pago-movil' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(paymentMethod === 'pago-movil' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Smartphone className="text-gray-600" />
              <span className="text-sm font-medium">Pago móvil</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('transferencia')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                paymentMethod === 'transferencia' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(paymentMethod === 'transferencia' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Building className="text-gray-600" />
              <span className="text-sm font-medium">Transferencia</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('zelle')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                paymentMethod === 'zelle' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(paymentMethod === 'zelle' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Globe className="text-gray-600" />
              <span className="text-sm font-medium">Zelle</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('banesco')}
              className={`p-4 flex flex-col justify-between items-start space-y-2 transition-all duration-200 transform active:scale-95 min-h-[100px] ${
                paymentMethod === 'banesco' 
                  ? 'bg-white border scale-105' 
                  : 'bg-white hover:scale-102'
              }`}
              style={{ 
                borderRadius: '30px',
                ...(paymentMethod === 'banesco' && {
                  borderColor: '#ED702E'
                })
              }}
            >
              <Globe className="text-gray-600" />
              <span className="text-sm font-medium">Banesco Panamá</span>
            </button>
          </div>
        </div>

        {/* Monto total y Resumen de compra */}
        <div className="bg-white p-4 space-y-4" style={{ borderRadius: '30px' }}>
          {/* Monto total */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Monto total</h3>
            <div className="text-3xl font-bold">${cartTotal.toFixed(2)}</div>
          </div>

          {/* Resumen de compra */}
          <div>
            <h4 className="font-semibold mb-3">Resumen de compra</h4>
            
            {/* Items del carrito */}
            <div className="space-y-2 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Resumen de montos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Envío</span>
                <span className="text-sm font-medium">$0.00</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white border-t p-4">
        {/* Botón de realizar pedido */}
        <PrimaryButton className="w-full" onClick={handleRealizarPedido}>
          Realizar pedido
        </PrimaryButton>
      </div>

      {/* Order Confirmation Drawer */}
      <OrderConfirmationDrawer
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        onBack={handleConfirmationBack}
        onContinue={handleConfirmationContinue}
      />
    </div>
  )
}