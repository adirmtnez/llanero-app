"use client"

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ArrowLeft, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useBodegones } from "@/hooks/use-bodegones"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useBodegonSubcategories } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useRestaurantSubcategories } from "@/hooks/restaurants/use-restaurant-subcategories"
import { useBodegonProducts } from "@/hooks/bodegones/use-bodegon-products"
import { useProductImages } from "@/hooks/use-product-images"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { toast } from "sonner"

// Demo products removed - using only real Supabase data

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const { getProductById, getProductInventory, updateProductWithInventory, updateRestaurantProduct, loading: updatingProduct, error: productError } = useBodegonProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const productId = params.id as string
  
  // Categories and subcategories hooks
  const { categories: bodegonCategories, loading: bodegonCategoriesLoading } = useBodegonCategories()
  const { categories: restaurantCategories, loading: restaurantCategoriesLoading } = useRestaurantCategories()
  const { subcategories: bodegonSubcategories, loading: bodegonSubcategoriesLoading } = useBodegonSubcategories()
  const { subcategories: restaurantSubcategories, loading: restaurantSubcategoriesLoading } = useRestaurantSubcategories()

  const [productType, setProductType] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [name, setName] = useState("")
  const [measurements, setMeasurements] = useState("")
  const [description, setDescription] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [price, setPrice] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([]) // URLs of existing images
  const [bodegonAvailability, setBodegonAvailability] = useState<{[key: string]: boolean}>({})
  const [productStatus, setProductStatus] = useState("active")
  const [inStock, setInStock] = useState(true)

  // Initialize bodegon availability when bodegones are loaded
  const initializeBodegonAvailability = useCallback(() => {
    const initialAvailability: {[key: string]: boolean} = {}
    bodegones.forEach(bodegon => {
      initialAvailability[bodegon.id] = false
    })
    setBodegonAvailability(initialAvailability)
  }, [bodegones])

  // Handle category change
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    setSubcategoryId("") // Reset subcategory when category changes
  }

  // Filter subcategories based on selected category and product type
  const getFilteredSubcategories = () => {
    if (!categoryId) return []
    
    if (productType === "bodegon-product") {
      return bodegonSubcategories.filter(sub => sub.parent_category === categoryId)
    } else if (productType === "restaurant-product") {
      return restaurantSubcategories.filter(sub => sub.parent_category === categoryId)
    }
    
    return []
  }

  // Reset categories when product type changes
  useEffect(() => {
    setCategoryId("")
    setSubcategoryId("")
  }, [productType])

  // Handle successful category creation
  const handleCategoryCreated = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    // Categories are automatically updated through the hooks, no need to manually reload
  }

  // Handle successful subcategory creation
  const handleSubcategoryCreated = (newSubcategoryId: string) => {
    setSubcategoryId(newSubcategoryId)
    // Subcategories are automatically updated through the hooks, no need to manually reload
  }

  const handleBodegonAvailabilityChange = (bodegonId: string, available: boolean) => {
    console.log(`🔄 Checkbox change for bodegon ${bodegonId}: ${available}`)
    console.log('📊 Current bodegonAvailability before change:', bodegonAvailability)
    
    setBodegonAvailability(prev => {
      const newState = {
        ...prev,
        [bodegonId]: available
      }
      console.log('📊 New bodegonAvailability after change:', newState)
      return newState
    })
  }

  // Initialize bodegon availability when bodegones are loaded
  useEffect(() => {
    if (bodegones.length > 0) {
      initializeBodegonAvailability()
    }
  }, [bodegones, initializeBodegonAvailability])

  useEffect(() => {
    // Load product data based on ID
    const loadProduct = async () => {
      if (productId) {
        try {
          setLoadingProduct(true)
          setError(null) // Limpiar errores previos
          console.log("🔍 Loading product with ID:", productId)
          const product = await getProductById(productId)
          console.log("📦 Product loaded:", product)
          
          if (product) {
            // Map product data to form fields
            setName(product.name || "")
            setSku(product.sku || "")
            setBarcode(product.bar_code || "")
            setDescription(product.description || "")
            setPrice(product.price.toString())
            setCategoryId(product.category_id || "")
            setSubcategoryId(product.subcategory_id || "")
            
            // Set product status based on is_active_product
            setProductStatus(product.is_active_product ? "active" : "draft")
            setInStock(product.is_active_product)
            
            // Load existing images if available
            if (product.image_gallery_urls && product.image_gallery_urls.length > 0) {
              console.log('📸 Loading existing images:', product.image_gallery_urls)
              setExistingImages(product.image_gallery_urls)
            } else {
              setExistingImages([])
            }
            
            // Determine product type and load inventory accordingly
            if (product.restaurant_id) {
              setProductType("restaurant-product")
              setSelectedRestaurant(product.restaurant_id)
            } else {
              setProductType("bodegon-product")
              // Inventory will be loaded in the separate useEffect when bodegones are ready
            }
          } else {
            console.warn("❌ Product not found with ID:", productId)
            // Solo mostrar el toast una vez, no hacer redirect automático
            setError("Producto no encontrado")
          }
        } catch (error) {
          console.error("Error loading product:", error)
          toast.error("Error al cargar el producto")
          router.push("/admin/productos")
        } finally {
          setLoadingProduct(false)
        }
      }
    }

    loadProduct()
  }, [productId]) // Solo productId como dependencia

  // Separate effect to load inventory once both product and bodegones are loaded
  useEffect(() => {
    const loadInventoryWhenReady = async () => {
      // Only proceed if we have a bodegon product and bodegones are loaded
      if (!productId || productType !== "bodegon-product" || bodegones.length === 0 || bodegonesLoading) {
        return
      }

      console.log('🔄 Loading inventory after bodegones are ready...')
      try {
        const availableBodegones = await getProductInventory(productId)
        console.log('✅ Loaded inventory data (delayed):', availableBodegones)
        
        // Update bodegon availability based on existing inventory
        const inventoryStatus: {[key: string]: boolean} = {}
        bodegones.forEach(bodegon => {
          const isAvailable = availableBodegones.includes(bodegon.id)
          inventoryStatus[bodegon.id] = isAvailable
          console.log(`🏪 Bodegon "${bodegon.name}" (${bodegon.id}): ${isAvailable ? '✅ Available' : '❌ Not available'}`)
        })
        setBodegonAvailability(inventoryStatus)
        console.log('✅ Updated bodegon availability state (delayed):', inventoryStatus)
      } catch (inventoryError) {
        console.error('❌ Error loading product inventory (delayed):', inventoryError)
        // If inventory loading fails, initialize with all false
        initializeBodegonAvailability()
      }
    }

    loadInventoryWhenReady()
  }, [productType, bodegones, bodegonesLoading, productId]) // Removed getProductInventory dependency

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      
      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const validImages = newImages.filter(file => {
        const isValid = allowedTypes.includes(file.type.toLowerCase())
        if (!isValid) {
          toast.error(`Archivo ${file.name} no es válido. Solo se permiten archivos JPEG, PNG y WebP`)
        }
        return isValid
      })
      
      if (validImages.length > 0) {
        setImages(prev => [...prev, ...validImages].slice(0, 4))
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🚀 Iniciando actualización de producto:", productId)
    console.log("📊 Datos del formulario:", {
      productType,
      name,
      price,
      categoryId,
      subcategoryId,
      existingImages: existingImages.length,
      newImages: images.length
    })
    
    // Validar campos requeridos
    if (!productType) {
      toast.error("Debe seleccionar un tipo de producto")
      return
    }
    
    if (!name.trim()) {
      toast.error("El nombre del producto es requerido")
      return
    }
    
    if (!price || parseFloat(price) <= 0) {
      toast.error("El precio debe ser mayor a 0")
      return
    }

    try {
      // Solo procesar productos de bodegón por ahora
      if (productType === "bodegon-product") {
        // Combinar imágenes existentes con nuevas imágenes subidas
        let finalImageUrls: string[] = [...existingImages] // Start with existing images
        
        // Subir nuevas imágenes si las hay
        if (images.length > 0) {
          toast.info("Subiendo imágenes...")
          const uploadResults = await uploadMultipleImages(images, 'products')
          
          // Filtrar solo las imágenes que se subieron correctamente
          const newImageUrls = uploadResults
            .filter(result => result.url && !result.error)
            .map(result => result.url)
          
          // Agregar las nuevas imágenes a las existentes
          finalImageUrls = [...finalImageUrls, ...newImageUrls]
          
          if (uploadResults.some(result => result.error)) {
            toast.warning("Algunas imágenes no se pudieron subir")
          }
        }

        const productData = {
          name: name.trim(),
          description: description.trim() || undefined,
          sku: sku.trim() || undefined,
          bar_code: barcode.trim() || undefined,
          category_id: categoryId || undefined,
          subcategory_id: subcategoryId || undefined,
          price: parseFloat(price),
          is_active_product: productStatus === "active",
          is_discount: false,
          is_promo: false,
          discounted_price: null,
          image_gallery_urls: finalImageUrls
        }

        // Get selected bodegones (only those marked as available)
        const selectedBodegones = Object.keys(bodegonAvailability).filter(
          bodegonId => bodegonAvailability[bodegonId] === true
        )

        if (selectedBodegones.length === 0) {
          toast.error("Debe seleccionar al menos un bodegón donde el producto estará disponible")
          return
        }

        console.log("🔄 Llamando updateProductWithInventory con:", {
          productId,
          productData,
          selectedBodegones
        })
        
        const updatedProduct = await updateProductWithInventory(productId, productData, selectedBodegones)
        
        console.log("✅ Producto actualizado exitosamente:", updatedProduct)
        
        if (updatedProduct) {
          toast.success("¡Producto de bodegón actualizado exitosamente!")
          router.push("/admin/productos")
        } else {
          toast.error("Error: No se pudo actualizar el producto")
        }
      } else if (productType === "restaurant-product") {
        // Validar que se haya seleccionado un restaurante
        if (!selectedRestaurant) {
          toast.error("Debe seleccionar un restaurante")
          return
        }

        // Combinar imágenes existentes con nuevas imágenes subidas
        let finalImageUrls: string[] = [...existingImages] // Start with existing images
        
        // Subir nuevas imágenes si las hay
        if (images.length > 0) {
          toast.info("Subiendo imágenes...")
          const uploadResults = await uploadMultipleImages(images, 'products')
          
          // Filtrar solo las imágenes que se subieron correctamente
          const newImageUrls = uploadResults
            .filter(result => result.url && !result.error)
            .map(result => result.url)
          
          // Agregar las nuevas imágenes a las existentes
          finalImageUrls = [...finalImageUrls, ...newImageUrls]
          
          if (uploadResults.some(result => result.error)) {
            toast.warning("Algunas imágenes no se pudieron subir")
          }
        }

        const restaurantProductData = {
          name: name.trim(),
          description: description.trim() || undefined,
          image_gallery_urls: finalImageUrls,
          price: parseFloat(price),
          restaurant_id: selectedRestaurant,
          category_id: categoryId || undefined,
          subcategory_id: subcategoryId || undefined,
          is_available: inStock
        }

        console.log("🔄 Llamando updateRestaurantProduct con:", {
          productId,
          restaurantProductData
        })
        
        const updatedRestaurantProduct = await updateRestaurantProduct(productId, restaurantProductData)
        
        console.log("✅ Producto de restaurante actualizado exitosamente:", updatedRestaurantProduct)
        
        if (updatedRestaurantProduct) {
          toast.success("¡Producto de restaurante actualizado exitosamente!")
          router.push("/admin/productos")
        } else {
          toast.error("Error: No se pudo actualizar el producto de restaurante")
        }
      } else {
        toast.error("Tipo de producto no válido")
      }
    } catch (error) {
      console.error("❌ Error updating product:", error)
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error(error instanceof Error ? error.message : "Error al actualizar el producto")
    }
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
                <BreadcrumbLink href="/admin/productos">
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

      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full pb-12">

        {/* Error Message */}
        {(productError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center justify-between">
              <span>{productError || error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/admin/productos")}
                className="ml-4"
              >
                Volver a productos
              </Button>
            </div>
          </div>
        )}

        {/* Loading Product */}
        {loadingProduct && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Cargando producto...</p>
            </div>
          </div>
        )}

        {!loadingProduct && (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Editar Producto</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Descartar
              </Button>
              <Button type="button" variant="outline" disabled={updatingProduct || uploadingImages}>
                Guardar Borrador
              </Button>
              <Button 
                type="submit" 
                disabled={updatingProduct || uploadingImages}
              >
                {uploadingImages ? "Subiendo imágenes..." : 
                 updatingProduct ? "Actualizando..." : 
                 "Actualizar producto"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Pizza Margherita"
                    />
                  </div>

                  {/* SKU and Barcode - Only show for Bodegon products */}
                  {productType === "bodegon-product" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="SKU del producto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="barcode">Código de barras</Label>
                        <Input
                          id="barcode"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          placeholder="Código de barras"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Establece una descripción del producto para una mejor visibilidad."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Establece una descripción del producto para una mejor visibilidad.
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Product Images Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes del Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <div className="w-12 h-12 border border-muted rounded-lg flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium mb-1">Suelta tus imágenes aquí</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        PNG o JPG (máx. 5MB)
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="pointer-events-none"
                      >
                        Seleccionar imágenes
                      </Button>
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {(existingImages.length > 0 || images.length > 0) && (
                    <div className="space-y-4">
                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Imágenes actuales:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {existingImages.map((imageUrl, index) => (
                              <div
                                key={`existing-${index}`}
                                className="aspect-square border-2 border-muted rounded-lg flex items-center justify-center relative overflow-hidden"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Existing ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    // Handle broken images
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-red-500 hover:bg-red-600 border-2 border-white shadow-lg"
                                  onClick={() => removeExistingImage(index)}
                                >
                                  <X className="h-4 w-4 text-white" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images */}
                      {images.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Nuevas imágenes:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {images.map((image, index) => (
                              <div
                                key={`new-${index}`}
                                className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative"
                              >
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`New ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-red-500 hover:bg-red-600 border-2 border-white shadow-lg"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4 text-white" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories Card - Moved from right column */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorías</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Type - Disabled in edit mode */}
                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo de Producto</Label>
                    <Select value={productType} disabled>
                      <SelectTrigger className="w-full opacity-60 cursor-not-allowed">
                        <SelectValue placeholder="Seleccionar tipo de producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bodegon-product">Producto de Bodegón</SelectItem>
                        <SelectItem value="restaurant-product">Producto de Restaurante</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      El tipo de producto no se puede cambiar después de crear el producto
                    </p>
                  </div>

                  {/* Restaurant Selection - Only show for Restaurant products */}
                  {productType === "restaurant-product" && (
                    <div className="space-y-2">
                      <Label htmlFor="restaurant">Restaurante</Label>
                      <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={restaurantsLoading ? "Cargando restaurantes..." : "Seleccionar restaurante"} />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem key={restaurant.id} value={restaurant.id}>
                              {restaurant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Category Selection */}
                  {productType && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="category">Seleccionar una categoría</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowCategoryModal(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      <Select value={categoryId} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            (productType === "bodegon-product" && bodegonCategoriesLoading) ||
                            (productType === "restaurant-product" && restaurantCategoriesLoading)
                              ? "Cargando categorías..." 
                              : "Seleccionar una categoría"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {productType === "bodegon-product" && 
                            bodegonCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          }
                          {productType === "restaurant-product" && 
                            restaurantCategories.filter(category => 
                              !selectedRestaurant || category.restaurant_id === selectedRestaurant
                            ).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Subcategory Selection */}
                  {categoryId && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subcategory">Seleccionar una subcategoría</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowSubcategoryModal(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            (productType === "bodegon-product" && bodegonSubcategoriesLoading) ||
                            (productType === "restaurant-product" && restaurantSubcategoriesLoading)
                              ? "Cargando subcategorías..." 
                              : "Seleccionar una subcategoría"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredSubcategories().map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Availability Section - Only show for Bodegon products - Moved from right column */}
              {productType === "bodegon-product" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Disponibilidad</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Selecciona en qué bodegones estará disponible este producto
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bodegonesLoading ? (
                      <div className="text-sm text-muted-foreground">Cargando bodegones...</div>
                    ) : bodegones.length > 0 ? (
                      bodegones.map((bodegon) => {
                        const isChecked = bodegonAvailability[bodegon.id] || false
                        console.log(`🏪 Rendering bodegon ${bodegon.name} (${bodegon.id}): checked=${isChecked}`)
                        return (
                          <div key={bodegon.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={`bodegon-${bodegon.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                console.log(`🔄 Checkbox onCheckedChange called for ${bodegon.id}: ${checked}`)
                                handleBodegonAvailabilityChange(bodegon.id, checked === true)
                              }}
                            />
                            <div className="grid gap-1.5 leading-none flex-1">
                              <label
                                htmlFor={`bodegon-${bodegon.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {bodegon.name}
                              </label>
                              {bodegon.address && (
                                <p className="text-xs text-muted-foreground">
                                  {bodegon.address}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground">No hay bodegones registrados en el sistema</div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Precio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        USD
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="rounded-l-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label className="flex items-center space-x-2">
                      <div className={`w-4 h-4 ${inStock ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                      <span>{inStock ? 'En stock' : 'Agotado'}</span>
                    </Label>
                    <Switch 
                      checked={inStock}
                      onCheckedChange={setInStock}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Select value={productStatus} onValueChange={setProductStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Borrador
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Activo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Establece el estado del producto.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </form>
        )}

        {/* Category Creation Modal */}
        <AddCategoryModal
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          onSuccess={() => {
            setShowCategoryModal(false)
            // Categories are automatically updated through the hooks
          }}
        />

        {/* Subcategory Creation Modal */}
        <AddCategoryModal
          open={showSubcategoryModal}
          onOpenChange={setShowSubcategoryModal}
          onSuccess={() => {
            setShowSubcategoryModal(false)
            // Subcategories are automatically updated through the hooks
          }}
        />
      </div>
    </>
  )
}