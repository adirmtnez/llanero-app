'use client'

export default function DesktopView() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de escritorio */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Llanero App</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 font-medium">Inicio</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Productos</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Categorías</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Ofertas</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar productos..."
                  className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-2.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal de escritorio */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar izquierdo */}
          <aside className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="flex items-center text-blue-600 font-medium">
                    <span className="text-lg mr-3">🥘</span>
                    Comida
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                    <span className="text-lg mr-3">🥤</span>
                    Bebidas
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                    <span className="text-lg mr-3">🍰</span>
                    Postres
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                    <span className="text-lg mr-3">🥗</span>
                    Ensaladas
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                    <span className="text-lg mr-3">🍕</span>
                    Pizza
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <div className="flex space-x-2">
                    <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">⭐⭐⭐⭐⭐ (5 estrellas)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">⭐⭐⭐⭐ (4+ estrellas)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="col-span-9">
            {/* Banner de bienvenida */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-2">¡Bienvenido a Llanero App!</h2>
              <p className="text-lg opacity-90">Versión de escritorio - Descubre los mejores productos</p>
              <button className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Explorar productos
              </button>
            </div>

            {/* Productos destacados */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Productos destacados</h3>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Producto {item}</h4>
                      <p className="text-gray-600 text-sm mb-3">Descripción del producto destacado</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">$25.99</span>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors">
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ofertas especiales */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ofertas especiales</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🔥</span>
                    <h4 className="text-lg font-semibold text-red-800">Oferta del día</h4>
                  </div>
                  <p className="text-red-700 mb-4">Hasta 50% de descuento en productos seleccionados</p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                    Ver ofertas
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🚚</span>
                    <h4 className="text-lg font-semibold text-green-800">Envío gratis</h4>
                  </div>
                  <p className="text-green-700 mb-4">En compras mayores a $50</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Aprovechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}