"use client"

import { Routes, Route, Navigate } from 'react-router-dom'

// Import existing bodegones components (we'll need to adapt these)
import { BodegonesGeneralPage } from './bodegones/BodegonesGeneralPage'
import { BodegonesProductosPage } from './bodegones/BodegonesProductosPage'
import { BodegonesCategoriasPage } from './bodegones/BodegonesCategoriasPage'
import { BodegonesSubcategoriasPage } from './bodegones/BodegonesSubcategoriasPage'
import { BodegonesAgregarProductoPage } from './bodegones/BodegonesAgregarProductoPage'
import { BodegonesEditarProductoPage } from './bodegones/BodegonesEditarProductoPage'

export function BodegonesView() {
  return (
    <Routes>
      {/* General bodegones view */}
      <Route path="/" element={<BodegonesGeneralPage />} />
      
      {/* Products routes */}
      <Route path="/productos" element={<BodegonesProductosPage />} />
      <Route path="/productos/agregar" element={<BodegonesAgregarProductoPage />} />
      <Route path="/productos/:id/editar" element={<BodegonesEditarProductoPage />} />
      
      {/* Categories routes */}
      <Route path="/productos/categorias" element={<BodegonesCategoriasPage />} />
      <Route path="/productos/sub-categorias" element={<BodegonesSubcategoriasPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}