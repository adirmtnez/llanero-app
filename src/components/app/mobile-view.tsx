'use client'

import { useState, useEffect } from 'react'
import ProfileView from './profile-view'
import CartDrawer from './cart-drawer'
import ProductCard from './product-card'

export default function MobileView() {
  const [currentView, setCurrentView] = useState('home')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState<{[key: string]: number}>({
    'chicken-sandwich': 2 // Producto inicial en el carrito
  })

  // Función para agregar producto al carrito
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  // Función para incrementar cantidad
  const incrementQuantity = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  // Estado y funciones del slider
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const totalSlides = 3

  // Función para ir al siguiente slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  // Función para ir al slide anterior
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Funciones para navegación táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }
  }

  // Auto-play del slider
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [currentSlide])

  // Función para decrementar cantidad
  const decrementQuantity = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] && newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  // Calcular total de productos en el carrito
  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  
  if (currentView === 'profile') {
    return <ProfileView onBack={() => setCurrentView('home')} />
  }
  
  return (
    <div className="min-h-screen" style={{backgroundColor: '#F2F3F6'}}>
      {/* Header móvil */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Llanero App</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal móvil */}
      <main className="pb-32">
        {/* Sección de Categorías */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Categorías</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Licores */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{width: '200px', height: '100px', borderRadius: '30px'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-900">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-bold tracking-wider">LICORES</span>
                </div>
              </div>
            </div>
            
            {/* Mercado */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{width: '200px', height: '100px', borderRadius: '30px'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-bold tracking-wider">MERCADO</span>
                </div>
              </div>
            </div>
            
            {/* Varios */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{width: '200px', height: '100px', borderRadius: '30px'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-bold tracking-wider">VARIOS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Restaurantes */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Restaurantes</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Boulevard Rose */}
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">
                  <div>BOULEVARD</div>
                  <div>ROSE</div>
                </div>
              </div>
              <span className="text-xs text-gray-700">Boulevard Rose</span>
            </div>
            
            {/* La Nave */}
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 mx-auto mb-2 bg-red-600 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">
                  <div>LA</div>
                  <div>NAVE</div>
                </div>
              </div>
              <span className="text-xs text-gray-700">La Nave</span>
            </div>
            
            {/* Orinoco Grill */}
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 mx-auto mb-2 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold text-center">
                  <div>ORINOCO</div>
                  <div>GRILL</div>
                </div>
              </div>
              <span className="text-xs text-gray-700">Orinoco Grill</span>
            </div>
          </div>
        </div>

        {/* 1. Sección de Snacks */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Snacks</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Golden Spicy Chicken */}
            <ProductCard
               emoji="🍗"
               title="Golden Spicy Chicken"
               description="Indulge in our succulent G..."
               price="$5.00"
               quantity={cart['golden-spicy-chicken'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('golden-spicy-chicken')}
               onIncrement={() => incrementQuantity('golden-spicy-chicken')}
               onDecrement={() => decrementQuantity('golden-spicy-chicken')}
             />

            {/* Crispy Chicken Wings */}
            <ProductCard
               emoji="🍖"
               title="Crispy Chicken Wings"
               description="Delicious crispy wings..."
               price="$7.50"
               quantity={cart['crispy-chicken-wings'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('crispy-chicken-wings')}
               onIncrement={() => incrementQuantity('crispy-chicken-wings')}
               onDecrement={() => decrementQuantity('crispy-chicken-wings')}
             />

            {/* Beef Burger */}
            <ProductCard
               emoji="🍔"
               title="Beef Burger"
               description="Juicy beef burger with..."
               price="$8.00"
               quantity={cart['beef-burger'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('beef-burger')}
               onIncrement={() => incrementQuantity('beef-burger')}
               onDecrement={() => decrementQuantity('beef-burger')}
             />

            {/* Fish Tacos */}
            <ProductCard
               emoji="🌮"
               title="Fish Tacos"
               description="Fresh fish tacos with..."
               price="$6.50"
               quantity={cart['fish-tacos'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('fish-tacos')}
               onIncrement={() => incrementQuantity('fish-tacos')}
               onDecrement={() => decrementQuantity('fish-tacos')}
             />

            {/* Veggie Wrap */}
            <ProductCard
               emoji="🥗"
               title="Veggie Wrap"
               description="Healthy veggie wrap..."
               price="$5.50"
               quantity={cart['veggie-wrap'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('veggie-wrap')}
               onIncrement={() => incrementQuantity('veggie-wrap')}
               onDecrement={() => decrementQuantity('veggie-wrap')}
             />

            {/* Pizza Slice - Con Descuento */}
            <ProductCard
               emoji="🍕"
               title="Pizza Slice"
               description="Delicious cheese pizza slice..."
               price="$6.00"
               originalPrice="$8.00"
               discount="-25%"
               quantity={cart['pizza-slice'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('pizza-slice')}
               onIncrement={() => incrementQuantity('pizza-slice')}
               onDecrement={() => decrementQuantity('pizza-slice')}
             />

            {/* Chicken Sandwich - En Carrito */}
            <ProductCard
                emoji="🥪"
                title="Chicken Sandwich"
                description="Grilled chicken sandwich..."
                price="$7.25"
                quantity={cart['chicken-sandwich'] || 0}
                variant="horizontal"
                onAddToCart={() => addToCart('chicken-sandwich')}
                onIncrement={() => incrementQuantity('chicken-sandwich')}
                onDecrement={() => decrementQuantity('chicken-sandwich')}
              />
          </div>
        </div>

        {/* Slider Publicitario */}
        <div className="py-4 px-4">
          <div className="w-full max-h-[400px] mx-auto relative">
            <div 
              className="relative overflow-hidden rounded-[30px] h-[400px] shadow-lg cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slides */}
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Slide 1 */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg select-none">
                  <span>Publicidad Marca 1</span>
                </div>
                
                {/* Slide 2 */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg select-none">
                  <span>Publicidad Marca 2</span>
                </div>
                
                {/* Slide 3 */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-lg select-none">
                  <span>Publicidad Marca 3</span>
                </div>
              </div>
              
              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sección de Rones */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Rones</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Ron Añejo */}
            <ProductCard
               emoji="🥃"
               title="Ron Añejo"
               description="Premium aged rum with..."
               price="$25.00"
               quantity={cart['ron-anejo'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('ron-anejo')}
               onIncrement={() => incrementQuantity('ron-anejo')}
               onDecrement={() => decrementQuantity('ron-anejo')}
             />

            {/* Ron Blanco */}
            <ProductCard
               emoji="🍾"
               title="Ron Blanco"
               description="Crystal clear white rum..."
               price="$18.00"
               quantity={cart['ron-blanco'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('ron-blanco')}
               onIncrement={() => incrementQuantity('ron-blanco')}
               onDecrement={() => decrementQuantity('ron-blanco')}
             />

            {/* Ron Dorado */}
            <ProductCard
               emoji="🥃"
               title="Ron Dorado"
               description="Golden rum with smooth..."
               price="$22.00"
               quantity={cart['ron-dorado'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('ron-dorado')}
               onIncrement={() => incrementQuantity('ron-dorado')}
               onDecrement={() => decrementQuantity('ron-dorado')}
             />
          </div>
        </div>

        {/* 3. Sección de Mercado */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Mercado</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Arroz */}
            <ProductCard
               emoji="🍚"
               title="Arroz Blanco"
               description="Premium white rice 1kg..."
               price="$3.50"
               quantity={cart['arroz-blanco'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('arroz-blanco')}
               onIncrement={() => incrementQuantity('arroz-blanco')}
               onDecrement={() => decrementQuantity('arroz-blanco')}
             />

            {/* Aceite */}
            <ProductCard
               emoji="🫒"
               title="Aceite de Oliva"
               description="Extra virgin olive oil..."
               price="$8.00"
               quantity={cart['aceite-oliva'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('aceite-oliva')}
               onIncrement={() => incrementQuantity('aceite-oliva')}
               onDecrement={() => decrementQuantity('aceite-oliva')}
             />

            {/* Leche */}
            <ProductCard
               emoji="🥛"
               title="Leche Entera"
               description="Fresh whole milk 1L..."
               price="$2.50"
               quantity={cart['leche-entera'] || 0}
               variant="horizontal"
               onAddToCart={() => addToCart('leche-entera')}
               onIncrement={() => incrementQuantity('leche-entera')}
               onDecrement={() => decrementQuantity('leche-entera')}
             />
          </div>
        </div>


      </main>

      {/* Navegación inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        {/* Píldora de carrito flotante */}
        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-in-out ${
          totalItems > 0 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }`}>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="text-sm font-medium">{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
          </button>
        </div>
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center py-2 transition-colors duration-200 ${
              currentView === 'home' ? 'text-gray-700' : 'text-gray-400 hover:text-blue-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs font-medium">Inicio</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Buscar</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs">Pedidos</span>
          </button>

          <button 
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center space-y-1 transition-colors duration-200 active:scale-95 transform ${
                currentView === 'profile' ? 'text-gray-700' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Perfil</span>
            </button>
        </div>
      </nav>
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  )
}