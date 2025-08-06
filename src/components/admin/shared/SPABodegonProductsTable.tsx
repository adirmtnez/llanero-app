"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Package } from "lucide-react"
import { BodegonProduct } from "@/types/products"
import { DeleteBodegonProductModal } from "@/components/bodegones/delete-product-modal"

interface SPABodegonProductsTableProps {
  products: Array<{
    id: string
    name: string
    sku?: string
    status: string
    category: string
    subcategory: string
    price: string
    raw: BodegonProduct
  }>
  onProductDeleted?: () => void
}

export function SPABodegonProductsTable({ products, onProductDeleted }: SPABodegonProductsTableProps) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)

  const handleEdit = (product: { id: string }) => {
    navigate(`/bodegones/productos/${product.id}/editar`)
  }

  const handleDelete = (product: { raw: BodegonProduct }) => {
    setSelectedProduct(product.raw)
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setSelectedProduct(null)
    onProductDeleted?.()
  }

  return (
    <>
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-[200px]">Producto</TableHead>
              <TableHead className="min-w-[120px]">SKU</TableHead>
              <TableHead className="min-w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[120px]">Categoría</TableHead>
              <TableHead className="min-w-[150px]">Subcategoría</TableHead>
              <TableHead className="min-w-[100px]">Precio</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.raw.image_gallery_urls && product.raw.image_gallery_urls.length > 0 ? (
                        <img 
                          src={product.raw.image_gallery_urls[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                      )}
                    </div>
                    <span className="truncate">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs sm:text-sm">
                  <span className="block truncate">{product.sku || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={product.status === "Active" ? "default" : "secondary"}
                    className={product.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {product.status === "Active" ? "Activo" : product.status === "Draft" ? "Borrador" : product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="truncate block">
                    {product.category === "Uncategorized" ? "Sin categoría" : product.category}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="truncate block">
                    {product.subcategory === "Sin subcategoría" ? "Sin subcategoría" : product.subcategory}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {product.price}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>Archivar</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(product)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
      </Table>

      <DeleteBodegonProductModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        product={selectedProduct}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}