"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SPABodegonProductForm } from "../../shared/SPABodegonProductForm"
import { useBodegonProducts } from "@/hooks/bodegones/use-bodegon-products"
import { BodegonProduct } from "@/types/products"
import { AdminBreadcrumb } from "../../shared/AdminBreadcrumb"

export function BodegonesEditarProductoPage() {
  const params = useParams()
  const productId = params.id as string
  const { getProductById } = useBodegonProducts()
  const [product, setProduct] = useState<BodegonProduct | null>(null)
  const [loading, setLoading] = useState(true)

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          const productData = await getProductById(productId)
          setProduct(productData)
        } catch (error) {
          console.error('Error loading bodegon product:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProduct()
  }, [productId, getProductById])

  const breadcrumbItems = [
    { label: 'Admin', path: '/' },
    { label: 'Bodegones', path: '/bodegones' },
    { label: 'Productos', path: '/bodegones/productos' },
    { label: 'Editar Producto', path: `/bodegones/productos/${productId}/editar`, isActive: true }
  ]

  if (loading) {
    return (
      <>
        <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <AdminBreadcrumb items={breadcrumbItems} />
          </div>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="hidden md:flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <AdminBreadcrumb items={breadcrumbItems} />
        </div>
      </header>

      <SPABodegonProductForm product={product} mode="edit" />
    </>
  )
}