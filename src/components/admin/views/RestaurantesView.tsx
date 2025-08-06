"use client"

import { Routes, Route, Navigate } from 'react-router-dom'

// Import existing restaurantes components (we'll need to adapt these)
import { RestaurantesGeneralPage } from './restaurantes/RestaurantesGeneralPage'
import { RestaurantesProductosPage } from './restaurantes/RestaurantesProductosPage'
import { RestaurantesCategoriasPage } from './restaurantes/RestaurantesCategoriasPage'
import { RestaurantesSubcategoriasPage } from './restaurantes/RestaurantesSubcategoriasPage'
import { RestaurantesAgregarProductoPage } from './restaurantes/RestaurantesAgregarProductoPage'
import { RestaurantesEditarProductoPage } from './restaurantes/RestaurantesEditarProductoPage'

export function RestaurantesView() {
  return (
    <Routes>
      {/* General restaurantes view */}
      <Route path="/" element={<RestaurantesGeneralPage />} />
      
      {/* Products routes */}
      <Route path="/productos" element={<RestaurantesProductosPage />} />
      <Route path="/productos/agregar" element={<RestaurantesAgregarProductoPage />} />
      <Route path="/productos/:id/editar" element={<RestaurantesEditarProductoPage />} />
      
      {/* Categories routes */}
      <Route path="/productos/categorias" element={<RestaurantesCategoriasPage />} />
      <Route path="/productos/sub-categorias" element={<RestaurantesSubcategoriasPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}