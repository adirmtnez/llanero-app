"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Copy, Archive, Image as ImageIcon } from "lucide-react"
import { BodegonProduct } from "@/types/products"
import { DeleteRestaurantProductModal } from "./delete-product-modal"

interface RestaurantProductsGridProps {
  products: Array<{
    id: string
    name: string
    status: string
    category: string
    restaurant?: string
    price: string
    raw: BodegonProduct
  }>
  onProductDeleted?: () => void
  categories?: Array<{ id: string; name: string }>
  subcategories?: Array<{ id: string; name: string; parent_category: string }>
}

export function RestaurantProductsGrid({ products, onProductDeleted, categories = [], subcategories = [] }: RestaurantProductsGridProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)

  const handleEdit = (productId: string) => {
    router.push(`/admin/restaurantes/productos/${productId}/editar`)
  }

  const handleDelete = (product: BodegonProduct) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setSelectedProduct(null)
    onProductDeleted?.()
  }

  const getProductImage = (product: BodegonProduct) => {
    if (product.image_gallery_urls && product.image_gallery_urls.length > 0) {
      return product.image_gallery_urls[0]
    }
    return null
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || null
  }

  const getSubcategoryName = (subcategoryId?: string) => {
    if (!subcategoryId) return null
    const subcategory = subcategories.find(sub => sub.id === subcategoryId)
    return subcategory?.name || null
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const productImage = getProductImage(product.raw)
          const categoryName = getCategoryName(product.raw.category_id)
          const subcategoryName = getSubcategoryName(product.raw.subcategory_id)
          
          return (
            <Card key={product.id} className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 py-0">
              <CardHeader className="p-0">
                {/* Product Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={product.status === "Active" ? "default" : "secondary"}
                      className={
                        product.status === "Active" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                      }
                    >
                      {product.status === "Active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white border-0 shadow-md cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archivar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-700"
                          onClick={() => handleDelete(product.raw)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3">
                {/* Product Name */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight truncate">
                    {product.name}
                  </h3>
                </div>

                {/* Category and Subcategory Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {categoryName && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      {categoryName}
                    </Badge>
                  )}
                  {subcategoryName && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-800 hover:bg-purple-100"
                    >
                      {subcategoryName}
                    </Badge>
                  )}
                </div>

                {/* Restaurant Name */}
                {product.restaurant && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600 truncate block">
                      {product.restaurant}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {product.price}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(product.id)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="border-dashed border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  {index === 0 ? "Sin productos" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteRestaurantProductModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        product={selectedProduct}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}