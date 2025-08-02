"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BodegonProductForm } from "@/components/bodegones/product-form"
import { useBodegonProducts } from "@/hooks/bodegones/use-bodegon-products"
import { BodegonProduct } from "@/types/products"

export default function EditarProductoBodegonPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/bodegones">
                  Bodegones
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/bodegones/productos">
                  Productos
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar Producto</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <BodegonProductForm product={product} mode="edit" />
    </>
  )
}