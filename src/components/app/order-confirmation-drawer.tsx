'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrimaryButton } from '@/components/ui/primary-button'
import { ArrowLeft, Copy, CheckCircle, Loader2 } from 'lucide-react'

interface OrderConfirmationDrawerProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  onBack: () => void
}

export default function OrderConfirmationDrawer({ 
  isOpen, 
  onClose, 
  onContinue, 
  onBack 
}: OrderConfirmationDrawerProps) {
  const [fullName, setFullName] = useState("")
  const [phonePrefix, setPhonePrefix] = useState("0414")
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState<'contact' | 'payment' | 'processing' | 'success' | 'completed'>('contact')
  
  // Estados para el paso de pago
  const [selectedBank, setSelectedBank] = useState("")
  const [documentType, setDocumentType] = useState("V")
  const [documentNumber, setDocumentNumber] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [bankSender, setBankSender] = useState("")
  
  const handleContinueToPayment = () => {
    setStep('payment')
  }
  
  const handleBackToContact = () => {
    setStep('contact')
  }
  
  const handleProcessOrder = async () => {
    // Mostrar pantalla de procesamiento
    setStep('processing')
    
    // Simular procesamiento del pedido - aquí se implementará la lógica real
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mostrar pantalla de éxito
    setStep('success')
    
    // Después de 1.5 segundos mostrar la pantalla final
    setTimeout(() => {
      setStep('completed')
    }, 1500)
  }
  
  const handleBackToHome = () => {
    // Aquí se implementará la lógica para volver al inicio y reiniciar carrito
    console.log('Volver al inicio y reiniciar carrito')
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={`${step === 'payment' ? 'h-[85vh]' : 'h-auto max-h-[85vh]'} rounded-t-3xl [&>button]:hidden [&[id^='radix-']]:!gap-0 flex flex-col`} 
        style={{ backgroundColor: '#F2F3F6' }}
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 pb-6">
          {(step === 'processing' || step === 'success' || step === 'completed') ? (
            <div className="w-10"></div>
          ) : (
            <Button variant="ghost" size="icon" onClick={step === 'contact' ? onBack : handleBackToContact}>
              <ArrowLeft />
            </Button>
          )}
          <SheetTitle className="text-lg font-semibold">
            {step === 'contact' && 'Antes de continuar'}
            {step === 'payment' && 'Realizar Pago'}
            {step === 'processing' && 'Procesando pedido'}
            {step === 'success' && 'Pedido completado'}
            {step === 'completed' && 'Pedido completado'}
          </SheetTitle>
          <div className="w-10"></div>
        </SheetHeader>

        {/* Content */}
        <div className={`px-4 space-y-6 ${step === 'payment' ? 'flex-1 overflow-y-auto pb-4' : step === 'completed' ? 'flex-1 overflow-y-auto pb-4' : ''}`}>
          {step === 'contact' && (
            <>
              {/* Descripción */}
              <div className="text-center text-gray-600 text-sm px-4">
                Usaremos tu número de teléfono para confirmar la compra y coordinar la entrega
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                {/* Nombre y apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre y apellido
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full app-input"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="flex space-x-2">
                    <select 
                      className="app-select w-24 text-center"
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                    >
                      <option value="0414">0414</option>
                      <option value="0424">0424</option>
                      <option value="0416">0416</option>
                      <option value="0426">0426</option>
                      <option value="0412">0412</option>
                    </select>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 app-input"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {step === 'payment' && (
            <>
              {/* Paso 1: Realiza el pago a los siguientes datos */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h3 className="text-lg font-semibold">Realiza el pago a los siguientes datos</h3>
                </div>
                
                <div className="bg-white p-4 rounded-2xl" style={{ borderRadius: '30px' }}>
                  <div className="text-sm text-gray-600 mb-3">
                    Selecciona el banco al cual realizarás el pago:
                  </div>
                  
                  <select 
                    className="app-select w-full"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="">Elige un banco:</option>
                    <option value="venezuela">Banco de Venezuela</option>
                    <option value="mercantil">Banco Mercantil</option>
                    <option value="provincial">BBVA Provincial</option>
                  </select>
                </div>

                {selectedBank && (
                  <div className="bg-red-900 text-white p-4 rounded-2xl space-y-2" style={{ borderRadius: '30px' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Banco: Venezuela</span>
                      <button className="text-white p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>C.I/R.I.F: 123456</span>
                      <button className="text-white p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Teléfono: 123456</span>
                      <button className="text-white p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 2: Información del pago */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h3 className="text-lg font-semibold">Información del pago</h3>
                </div>

                <div className="bg-white p-4 rounded-2xl space-y-4" style={{ borderRadius: '30px' }}>
                  {/* Tu documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tu documento
                    </label>
                    <div className="flex space-x-2">
                      <select 
                        className="app-select w-20 text-center"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                      >
                        <option value="V">V</option>
                        <option value="E">E</option>
                        <option value="J">J</option>
                      </select>
                      <Input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        className="flex-1 app-input"
                        placeholder="Current User's document"
                      />
                    </div>
                  </div>

                  {/* Referencia del pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia del pago (últimos 4 números)
                    </label>
                    <Input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full app-input"
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>

                  {/* Banco emisor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco emisor
                    </label>
                    <select 
                      className="app-select w-full"
                      value={bankSender}
                      onChange={(e) => setBankSender(e.target.value)}
                    >
                      <option value="">Banco Emisor</option>
                      <option value="venezuela">Banco de Venezuela</option>
                      <option value="mercantil">Banco Mercantil</option>
                      <option value="provincial">BBVA Provincial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Paso 3: Carga el comprobante */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h3 className="text-lg font-semibold">Carga el comprobante</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl text-center" style={{ borderRadius: '30px' }}>
                  <div className="text-gray-500">
                    Haz click para subir el comprobante
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'processing' && (
            <>
              {/* Pantalla de procesamiento */}
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Procesando tu pedido</h3>
                  <p className="text-gray-600">Por favor espera mientras procesamos tu pedido...</p>
                </div>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              {/* Pantalla de éxito */}
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <CheckCircle className="w-20 h-20 text-green-500 animate-pulse" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-green-600">¡Pedido completado!</h3>
                  <p className="text-gray-600">Tu pedido ha sido procesado exitosamente</p>
                </div>
              </div>
            </>
          )}

          {step === 'completed' && (
            <>
              {/* Pantalla final con información del pedido */}
              <div className="space-y-6">
                {/* Información del pedido */}
                <div className="bg-white p-6 rounded-2xl" style={{ borderRadius: '30px' }}>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Order - 2123442</h2>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Order date:</span>
                        <span className="font-medium">Nov 29, 2024</span>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        {/* Procesando */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-xs text-center font-medium">Procesando</span>
                        </div>

                        {/* Preparando */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </div>
                          <span className="text-xs text-center font-medium text-gray-500">Preparando</span>
                        </div>

                        {/* Enviado */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <span className="text-xs text-center font-medium text-gray-500">Enviado</span>
                        </div>

                        {/* Entregado */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs text-center font-medium text-gray-500">Entregado</span>
                        </div>
                      </div>

                      {/* Barra de progreso horizontal */}
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mensaje adicional */}
                <div className="text-center text-gray-600 text-sm">
                  Te notificaremos sobre el progreso de tu pedido
                </div>
              </div>
            </>
          )}
        </div>

        {/* Spacer - solo para paso de contacto */}
        {step === 'contact' && <div className="h-8"></div>}

        {/* Bottom Section */}
        {(step === 'contact' || step === 'payment' || step === 'completed') && (
          <div className="bg-white border-t p-4 space-y-3 rounded-t-[30px]">
            <PrimaryButton 
              className="w-full"
              onClick={
                step === 'contact' ? handleContinueToPayment : 
                step === 'payment' ? handleProcessOrder : 
                handleBackToHome
              }
            >
              {step === 'contact' && 'Continuar'}
              {step === 'payment' && 'Realizar pedido'}
              {step === 'completed' && 'Volver al inicio'}
            </PrimaryButton>
            
            {(step === 'contact' || step === 'payment') && (
              <button 
                onClick={step === 'contact' ? onBack : handleBackToContact}
                className="w-full text-center text-gray-600 font-medium py-2"
              >
                Atrás
              </button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}