'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import ProfileView from './profile-view'
import CartDrawer from './cart-drawer'
import ProductCard from './product-card'
import ProductDetailDrawer from './product-detail-drawer'
import FloatingCartButton from './floating-cart-button'
import CheckoutView from './checkout-view'
import BottomNavigation, { TabType } from '@/components/ui/bottom-navigation'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/auth-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MobileView() {
  // Usuario autenticado
  const { user } = useAuth()
  
  // Estabilizar userId para evitar reinicialización del carrito
  const [stableUserId, setStableUserId] = useState<string | undefined>(user?.id)
  
  useEffect(() => {
    if (user?.id && user.id !== stableUserId) {
      setStableUserId(user.id)
    }
  }, [user?.id, stableUserId])
  
  
  const [currentView, setCurrentView] = useState('home')
  const [activeTab, setActiveTab] = useState<TabType>('house')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isBodegonMenuOpen, setIsBodegonMenuOpen] = useState(false)
  const [selectedBodegon, setSelectedBodegon] = useState('Todos los bodegones')
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [restaurantsLoading, setRestaurantsLoading] = useState(true)
  const [sliders, setSliders] = useState<any[]>([])
  const [slidersLoading, setSlidersLoading] = useState(true)
  const [whiskeyProducts, setWhiskeyProducts] = useState<any[]>([])
  const [whiskeyLoading, setWhiskeyLoading] = useState(true)
  
  // Hook del carrito
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    totalItems,
    isAddingToCart
  } = useCart(stableUserId)
  
  

  // Estado local legacy para productos que no está en Supabase
  const [localCart, setLocalCart] = useState<{[key: string]: number}>({})
  
  // Estado para tracking de loading por producto
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set())
  const [decrementingProducts, setDecrementingProducts] = useState<Set<string>>(new Set())

  // Lista de bodegones disponibles
  const bodegones = [
    'Todos los bodegones',
    'Bodegón Central',
    'Bodegón Norte',
    'Bodegón Sur',
    'Bodegón Plaza',
    'Bodegón Express'
  ]

  // Función para seleccionar bodegón
  const handleBodegonSelect = (bodegon: string) => {
    setSelectedBodegon(bodegon)
    setIsBodegonMenuOpen(false)
  }

  // Función para manejar cambios de tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'profile') {
      setCurrentView('profile')
    } else if (tab === 'house') {
      setCurrentView('home')
    }
    // TODO: Implementar navegación para 'search' y 'orders'
  }

  // Función para manejar click en Home
  const handleHomeClick = () => {
    setCurrentView('home')
  }

  // Función para abrir detalle de producto
  const openProductDetail = (productData: any) => {
    setSelectedProduct({
      ...productData,
      quantity: localCart[productData.id] || 0
    })
    setIsProductDetailOpen(true)
  }

  // Función para cerrar detalle de producto
  const closeProductDetail = () => {
    setIsProductDetailOpen(false)
    setSelectedProduct(null)
  }

  // Función para abrir checkout
  const openCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  // Función para cerrar checkout
  const closeCheckout = () => {
    setIsCheckoutOpen(false)
  }

  // Función para cargar categorías desde Supabase
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const { data, error } = await supabase
        .from('bodegon_categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error loading categories:', error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Función para cargar restaurantes desde Supabase
  const loadRestaurants = async () => {
    try {
      setRestaurantsLoading(true)
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, logo_url')
        .order('name')
      
      if (error) {
        console.error('Error loading restaurants:', error)
        return
      }

      setRestaurants(data || [])
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setRestaurantsLoading(false)
    }
  }

  // Función para cargar sliders desde Supabase
  const loadSliders = async () => {
    try {
      setSlidersLoading(true)
      const { data, error } = await supabase
        .from('sliders')
        .select('id, title, image_url, type, display')
        .eq('type', 'bottom')
        .eq('display', 'mobile')
        .order('id')
      
      if (error) {
        console.error('Error loading sliders:', error)
        setSliders([])
        return
      }

      console.log('Sliders loaded:', data)
      setSliders(data || [])
    } catch (error) {
      console.error('Error loading sliders:', error)
      setSliders([])
    } finally {
      setSlidersLoading(false)
    }
  }

  // Función para cargar productos de whisky desde Supabase
  const loadWhiskeyProducts = async () => {
    try {
      setWhiskeyLoading(true)
      const { data, error } = await supabase
        .from('bodegon_products')
        .select(`
          id,
          name,
          price,
          description,
          image_gallery_urls,
          bodegon_categories!inner(name),
          bodegon_subcategories!inner(name)
        `)
        .eq('bodegon_categories.name', 'Licores')
        .eq('bodegon_subcategories.name', 'Whisky')
        .order('name')
      
      if (error) {
        console.error('Error loading whiskey products:', error)
        setWhiskeyProducts([])
        return
      }

      console.log('Whiskey products loaded:', data)
      setWhiskeyProducts(data || [])
    } catch (error) {
      console.error('Error loading whiskey products:', error)
      setWhiskeyProducts([])
    } finally {
      setWhiskeyLoading(false)
    }
  }

  // Funciones para productos locales (legacy)
  const addToLocalCart = (productId: string) => {
    setLocalCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const incrementLocalQuantity = (productId: string) => {
    setLocalCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const decrementLocalQuantity = (productId: string) => {
    setLocalCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] && newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  // Funciones para productos de Supabase
  const handleAddToCart = async (productId: string, productType: 'bodegon' | 'restaurant') => {
    try {
      setLoadingProducts(prev => new Set(prev).add(productId))
      await addToCart(productId, productType)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoadingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleUpdateQuantity = async (orderItemId: string, quantity: number) => {
    try {
      await updateQuantity(orderItemId, quantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleDecrementProduct = async (productId: string, cartItem: any) => {
    try {
      if (cartItem.quantity <= 1) {
        setDecrementingProducts(prev => new Set(prev).add(productId))
        await removeFromCart(cartItem.id)
      } else {
        await handleUpdateQuantity(cartItem.id, cartItem.quantity - 1)
      }
    } catch (error) {
      console.error('Error decrementing product:', error)
    } finally {
      setDecrementingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  // Estado y funciones del slider principal (publicidad)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const totalSlides = sliders.length || 3

  // Estado y funciones del slider superior (ofertas/promociones)
  const [currentTopSlide, setCurrentTopSlide] = useState(0)
  const [topTouchStart, setTopTouchStart] = useState(0)
  const [topTouchEnd, setTopTouchEnd] = useState(0)
  const totalTopSlides = 4

  // Funciones para el slider principal
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Funciones para el slider superior
  const nextTopSlide = () => {
    setCurrentTopSlide((prev) => (prev + 1) % totalTopSlides)
  }

  const prevTopSlide = () => {
    setCurrentTopSlide((prev) => (prev - 1 + totalTopSlides) % totalTopSlides)
  }

  // Funciones para navegación táctil del slider principal
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

  // Funciones para navegación táctil del slider superior
  const handleTopTouchStart = (e: React.TouchEvent) => {
    setTopTouchStart(e.targetTouches[0].clientX)
  }

  const handleTopTouchMove = (e: React.TouchEvent) => {
    setTopTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTopTouchEnd = () => {
    if (!topTouchStart || !topTouchEnd) return
    
    const distance = topTouchStart - topTouchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextTopSlide()
    }
    if (isRightSwipe) {
      prevTopSlide()
    }
  }

  // Auto-play del slider principal
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [currentSlide])

  // Auto-play del slider superior
  useEffect(() => {
    const topInterval = setInterval(() => {
      nextTopSlide()
    }, 4000) // Cambia cada 4 segundos

    return () => clearInterval(topInterval)
  }, [currentTopSlide])

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCategories()
    loadRestaurants()
    loadSliders()
    loadWhiskeyProducts()
  }, [])

  // Calcular total de productos en el carrito (incluyendo locales)
  const localTotalItems = Object.values(localCart).reduce((sum, quantity) => sum + quantity, 0)
  const combinedTotalItems = totalItems + localTotalItems
  
  if (currentView === 'profile') {
    return <ProfileView onBack={() => {
      setCurrentView('home')
      setActiveTab('house')
    }} />
  }
  
  return (
    <div className="min-h-screen" style={{backgroundColor: '#F2F3F6'}}>
      {/* Header móvil */}
      <header className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2">
            <Image
              src="https://zykwuzuukrmgztpgnbth.supabase.co/storage/v1/object/public/adminapp//Llanero%20Logo.png"
              alt="Llanero Logo"
              width={120}
              height={40}
              className="object-contain max-w-[100px]"
            />
          </div>
          
          {/* Selector de tienda a la derecha */}
          <div className="relative flex items-center space-x-2">
            <button 
              className="flex items-center space-x-2"
              onClick={() => setIsBodegonMenuOpen(!isBodegonMenuOpen)}
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">Elegir bodegón</div>
                <div className="text-sm font-medium text-gray-900">{selectedBodegon}</div>
              </div>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </button>

            {/* Menú desplegable de bodegones */}
            {isBodegonMenuOpen && (
              <>
                {/* Overlay para cerrar el menú */}
                <div 
                  className="fixed inset-0 z-10 animate-in fade-in duration-200"
                  onClick={() => setIsBodegonMenuOpen(false)}
                />
                
                {/* Menú */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 py-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  {bodegones.map((bodegon, index) => (
                    <button
                      key={index}
                      onClick={() => handleBodegonSelect(bodegon)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between ${
                        selectedBodegon === bodegon ? 'text-[#ED702E]' : 'text-gray-700'
                      }`}
                      style={{
                        backgroundColor: selectedBodegon === bodegon ? '#F6EAE2' : 'transparent'
                      }}
                    >
                      <span className="text-sm font-medium">{bodegon}</span>
                      {selectedBodegon === bodegon && (
                        <svg className="w-4 h-4 text-[#ED702E]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal móvil */}
      <main className="pb-32">
        {/* Slider Superior de Ofertas/Promociones */}
        <div className="py-4 px-4">
          <div className="w-full max-h-[200px] mx-auto relative">
            <div 
              className="relative overflow-hidden rounded-[20px] h-[200px] shadow-md cursor-grab active:cursor-grabbing"
              onTouchStart={handleTopTouchStart}
              onTouchMove={handleTopTouchMove}
              onTouchEnd={handleTopTouchEnd}
            >
              {/* Slides del slider superior */}
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentTopSlide * 100}%)` }}
              >
                {/* Slide 1 - Oferta Especial */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg select-none p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">¡Oferta Especial!</div>
                    <div className="text-sm">50% de descuento en todos los rones</div>
                  </div>
                </div>
                
                {/* Slide 2 - Delivery Gratis */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg select-none p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">🚚 Delivery Gratis</div>
                    <div className="text-sm">En compras mayores a $25</div>
                  </div>
                </div>
                
                {/* Slide 3 - Nuevos Productos */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg select-none p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">🆕 Nuevos Productos</div>
                    <div className="text-sm">Descubre nuestras últimas incorporaciones</div>
                  </div>
                </div>
                
                {/* Slide 4 - Happy Hour */}
                <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-lg select-none p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">🍹 Happy Hour</div>
                    <div className="text-sm">2x1 en bebidas de 6PM a 8PM</div>
                  </div>
                </div>
              </div>
              
              {/* Indicadores del slider superior */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTopSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentTopSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Categorías */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Categorías</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categoriesLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative flex-shrink-0 overflow-hidden animate-pulse" style={{width: '200px', height: '100px', borderRadius: '30px'}}>
                    <div className="absolute inset-0 bg-gray-300"></div>
                  </div>
                ))}
              </>
            ) : (
              // Categorías desde Supabase
              categories.map((category) => (
                <div key={category.id} className="relative flex-shrink-0 overflow-hidden cursor-pointer" style={{width: '200px', height: '100px', borderRadius: '30px'}}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      style={{borderRadius: '30px'}}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sección de Restaurantes */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Restaurantes</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {restaurantsLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center flex-shrink-0">
                    <div className="w-20 h-20 mx-auto mb-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ))}
              </>
            ) : (
              // Restaurantes desde Supabase
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="text-center flex-shrink-0 cursor-pointer">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden relative">
                    {restaurant.logo_url ? (
                      <Image
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-700">{restaurant.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 1. Sección de Whisky */}
        <div className="py-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">Whisky</h2>
          <div className="flex overflow-x-auto space-x-3 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {whiskeyLoading ? (
              // Loading skeleton
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-40 bg-gray-200 rounded-[30px] p-4 animate-pulse">
                    <div className="w-full aspect-square bg-gray-300 rounded-2xl mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-3"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </>
            ) : whiskeyProducts.length > 0 ? (
              // Productos de whisky desde Supabase
              whiskeyProducts.map((product) => {
                const productId = `whisky-${product.id}`
                const imageUrl = product.image_gallery_urls && product.image_gallery_urls.length > 0 
                  ? product.image_gallery_urls[0] 
                  : null
                
                // Buscar cantidad en el carrito real
                const cartItem = cart?.items.find(item => 
                  item.bodegon_product_item === product.id
                )
                const cartQuantity = cartItem?.quantity || 0
                
                

                return (
                  <ProductCard
                    key={product.id}
                    emoji="🥃"
                    title={product.name}
                    description={product.description || 'Whisky premium'}
                    price={`$${product.price}`}
                    quantity={cartQuantity}
                    variant="horizontal"
                    imageUrl={imageUrl}
                    isLoading={loadingProducts.has(product.id)}
                    isDecrementing={decrementingProducts.has(product.id)}
                    onAddToCart={() => handleAddToCart(product.id, 'bodegon')}
                    onIncrement={() => {
                      if (cartItem) {
                        handleUpdateQuantity(cartItem.id, cartItem.quantity + 1)
                      } else {
                        handleAddToCart(product.id, 'bodegon')
                      }
                    }}
                    onDecrement={() => {
                      if (cartItem) {
                        handleDecrementProduct(product.id, cartItem)
                      }
                    }}
                    onCardClick={() => openProductDetail({
                      id: productId,
                      emoji: '🥃',
                      title: product.name,
                      description: product.description || 'Whisky premium de alta calidad',
                      price: `$${product.price}`,
                      imageUrl: imageUrl
                    })}
                  />
                )
              })
            ) : (
              // Fallback si no hay productos
              <div className="flex-shrink-0 w-40 bg-white rounded-[30px] p-4 flex items-center justify-center">
                <span className="text-gray-500 text-sm text-center">No hay productos de whisky disponibles</span>
              </div>
            )}
          </div>
        </div>

        {/* Slider Publicitario */}
        <div className="py-4 px-4">
          <div className="w-full max-h-[400px] mx-auto relative">
            {slidersLoading ? (
              // Loading skeleton
              <div className="relative overflow-hidden rounded-[30px] h-[400px] shadow-lg animate-pulse">
                <div className="w-full h-full bg-gray-300"></div>
              </div>
            ) : sliders.length > 0 || true ? (
              <div 
                className="relative overflow-hidden rounded-[30px] h-[400px] shadow-lg cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Slides desde Supabase */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {sliders.length > 0 ? sliders.map((slider, index) => (
                    <div key={slider.id} className="w-full h-full flex-shrink-0 relative overflow-hidden">
                      {slider.image_url ? (
                        <Image
                          src={slider.image_url}
                          alt={slider.title || `Slide ${index + 1}`}
                          fill
                          className="object-cover"
                          style={{borderRadius: '30px'}}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-lg select-none">
                          <span>{slider.title || `Slide ${index + 1}`}</span>
                        </div>
                      )}
                    </div>
                  )) : (
                    <>
                      {/* Slide 1 - Temporal */}
                      <div className="w-full h-full flex-shrink-0 relative overflow-hidden">
                        <Image
                          src="https://zykwuzuukrmgztpgnbth.supabase.co/storage/v1/object/public/adminapp//Llanero%20Logo.png"
                          alt="Slide 1"
                          fill
                          className="object-cover"
                          style={{borderRadius: '30px'}}
                        />
                      </div>
                      
                      {/* Slide 2 - Temporal */}
                      <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg select-none">
                        <span>Publicidad Marca 2</span>
                      </div>
                      
                      {/* Slide 3 - Temporal */}
                      <div className="w-full h-full flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-lg select-none">
                        <span>Publicidad Marca 3</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {(sliders.length > 0 ? sliders : [1, 2, 3]).map((_, index) => (
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
            ) : (
              // Fallback en caso de no tener sliders
              <div className="relative overflow-hidden rounded-[30px] h-[400px] shadow-lg">
                <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-lg select-none">
                  <span>No hay publicidad disponible</span>
                </div>
              </div>
            )}
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
               quantity={localCart['ron-anejo'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('ron-anejo')}
               onIncrement={() => incrementLocalQuantity('ron-anejo')}
               onDecrement={() => decrementLocalQuantity('ron-anejo')}
             />

            {/* Ron Blanco */}
            <ProductCard
               emoji="🍾"
               title="Ron Blanco"
               description="Crystal clear white rum..."
               price="$18.00"
               quantity={localCart['ron-blanco'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('ron-blanco')}
               onIncrement={() => incrementLocalQuantity('ron-blanco')}
               onDecrement={() => decrementLocalQuantity('ron-blanco')}
             />

            {/* Ron Dorado */}
            <ProductCard
               emoji="🥃"
               title="Ron Dorado"
               description="Golden rum with smooth..."
               price="$22.00"
               quantity={localCart['ron-dorado'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('ron-dorado')}
               onIncrement={() => incrementLocalQuantity('ron-dorado')}
               onDecrement={() => decrementLocalQuantity('ron-dorado')}
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
               quantity={localCart['arroz-blanco'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('arroz-blanco')}
               onIncrement={() => incrementLocalQuantity('arroz-blanco')}
               onDecrement={() => decrementLocalQuantity('arroz-blanco')}
             />

            {/* Aceite */}
            <ProductCard
               emoji="🫒"
               title="Aceite de Oliva"
               description="Extra virgin olive oil..."
               price="$8.00"
               quantity={localCart['aceite-oliva'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('aceite-oliva')}
               onIncrement={() => incrementLocalQuantity('aceite-oliva')}
               onDecrement={() => decrementLocalQuantity('aceite-oliva')}
             />

            {/* Leche */}
            <ProductCard
               emoji="🥛"
               title="Leche Entera"
               description="Fresh whole milk 1L..."
               price="$2.50"
               quantity={localCart['leche-entera'] || 0}
               variant="horizontal"
               onAddToCart={() => addToLocalCart('leche-entera')}
               onIncrement={() => incrementLocalQuantity('leche-entera')}
               onDecrement={() => decrementLocalQuantity('leche-entera')}
             />
          </div>
        </div>


      </main>

      {/* Navegación inferior */}
      <div className="relative">
        {/* Píldora de carrito flotante */}
        <FloatingCartButton 
          totalItems={combinedTotalItems}
          onClick={() => setIsCartOpen(true)}
          isVisible={combinedTotalItems > 0}
        />
        
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onHomeClick={handleHomeClick}
        />
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={openCheckout}
        userId={stableUserId}
      />

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        isOpen={isProductDetailOpen}
        onClose={closeProductDetail}
        product={selectedProduct}
        onAddToCart={() => {
          if (selectedProduct) {
            // Para productos locales (legacy)
            addToLocalCart(selectedProduct.id)
            setSelectedProduct(prev => prev ? {...prev, quantity: (prev.quantity || 0) + 1} : null)
          }
        }}
        onIncrement={() => {
          if (selectedProduct) {
            // Para productos locales (legacy)
            incrementLocalQuantity(selectedProduct.id)
            setSelectedProduct(prev => prev ? {...prev, quantity: (prev.quantity || 0) + 1} : null)
          }
        }}
        onDecrement={() => {
          if (selectedProduct) {
            // Para productos locales (legacy)
            decrementLocalQuantity(selectedProduct.id)
            setSelectedProduct(prev => prev ? {...prev, quantity: Math.max(0, (prev.quantity || 0) - 1)} : null)
          }
        }}
      />

      {/* Checkout View */}
      <CheckoutView
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        cartTotal={cart?.total_amount || 0}
        cartItems={cart?.items.map(item => ({
          name: item.name_snapshot,
          quantity: item.quantity,
          price: item.price
        })) || []}
      />
    </div>
  )
}