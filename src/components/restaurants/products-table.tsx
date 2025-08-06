"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { MoreHorizontal } from "lucide-react"
import { BodegonProduct } from "@/types/products"
import { DeleteRestaurantProductModal } from "./delete-product-modal"

interface RestaurantProductsTableProps {
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
}

export function RestaurantProductsTable({ products, onProductDeleted }: RestaurantProductsTableProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BodegonProduct | null>(null)

  const handleEdit = (product: { id: string }) => {
    router.push(`/admin/restaurantes/productos/${product.id}/editar`)
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
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="min-w-[120px]">Categoría</TableHead>
                <TableHead className="min-w-[150px]">Restaurante</TableHead>
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
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-muted-foreground/20 rounded"></div>
                      </div>
                      <span className="truncate">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={product.status === "Active" ? "default" : "secondary"}
                      className={product.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                    >
                      {product.status === "Active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="truncate block">
                      {product.category === "Uncategorized" ? "Sin categoría" : product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="truncate block">
                      {product.restaurant || "Sin restaurante"}
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
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem>Cambiar disponibilidad</DropdownMenuItem>
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

      <DeleteRestaurantProductModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        product={selectedProduct}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}