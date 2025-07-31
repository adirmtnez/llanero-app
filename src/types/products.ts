export type ProductType = 'bodegon' | 'restaurant'

export interface BodegonProduct {
  id: string
  name: string
  description?: string
  image_gallery_urls?: string[]
  bar_code?: string  // Único y opcional
  sku?: string       // Único y opcional
  category_id?: string    // FK a categories_bodegon
  subcategory_id?: string // FK a subcategories_bodegon
  price: number
  purchase_price?: number
  quantity_in_pack: number
  is_active_product?: boolean
  is_discount?: boolean
  is_promo?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
  // Restaurant-specific fields (optional)
  restaurant_id?: string
  product_type?: 'bodegon' | 'restaurant'
}

export interface CreateBodegonProductData {
  name: string
  description?: string
  image_gallery_urls?: string[]
  bar_code?: string
  sku?: string
  category_id?: string
  subcategory_id?: string
  price: number
  purchase_price?: number
  quantity_in_pack: number
  is_active_product?: boolean
  is_discount?: boolean
  is_promo?: boolean
}

export interface UpdateBodegonProductData extends Partial<CreateBodegonProductData> {
  id: string
}

export interface Category {
  id: string
  name: string
  description?: string
  type: ProductType  // 'bodegon' | 'restaurant'
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Subcategory {
  id: string
  name: string
  description?: string
  category_id?: string // Opcional para compatibilidad 
  parent_category_id?: string // Nueva estructura
  type: ProductType  // 'bodegon' | 'restaurant'
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductsFilters {
  search?: string
  category_id?: string
  subcategory_id?: string
  is_active?: boolean
  is_discount?: boolean
  is_promo?: boolean
  price_min?: number
  price_max?: number
}

export interface ProductsPagination {
  page: number
  limit: number  // 10, 25 o 50
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: BodegonProduct[]
  pagination: ProductsPagination
}

// Utility types para formateo de precios
export interface FormattedPrice {
  raw: number
  formatted: string  // "$1.250,00"
}

// Para el upload de imágenes
export interface ImageUploadResult {
  url: string
  path: string
  error?: string
}