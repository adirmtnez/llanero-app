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
import { useRouter } from "next/navigation"
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

export default function AgregarProductoPage() {
  const router = useRouter()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const { createProductWithInventory, createRestaurantProduct, loading: creatingProduct, error: productError } = useBodegonProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
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
  const [bodegonAvailability, setBodegonAvailability] = useState<{[key: string]: boolean}>({})
  const [productStatus, setProductStatus] = useState("draft")
  const [inStock, setInStock] = useState(true)

  // Initialize bodegon availability when bodegones are loaded
  const initializeBodegonAvailability = useCallback(() => {
    const initialAvailability: {[key: string]: boolean} = {}
    bodegones.forEach(bodegon => {
      initialAvailability[bodegon.id] = false
    })
    setBodegonAvailability(initialAvailability)
  }, [bodegones])

  // Initialize bodegon availability when bodegones are loaded
  useEffect(() => {
    if (bodegones.length > 0) {
      initializeBodegonAvailability()
    }
  }, [bodegones, initializeBodegonAvailability])

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
    setBodegonAvailability(prev => ({
      ...prev,
      [bodegonId]: available
    }))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        // Subir imágenes si las hay
        let imageUrls: string[] = []
        if (images.length > 0) {
          toast.info("Subiendo imágenes...")
          const uploadResults = await uploadMultipleImages(images, 'products')
          
          // Filtrar solo las imágenes que se subieron correctamente
          imageUrls = uploadResults
            .filter(result => result.url && !result.error)
            .map(result => result.url)
          
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
          image_gallery_urls: imageUrls
        }

        // Get selected bodegones (only those marked as available)
        const selectedBodegones = Object.keys(bodegonAvailability).filter(
          bodegonId => bodegonAvailability[bodegonId] === true
        )

        if (selectedBodegones.length === 0) {
          toast.error("Debe seleccionar al menos un bodegón donde el producto estará disponible")
          return
        }

        const createdProduct = await createProductWithInventory(productData, selectedBodegones)
        
        if (createdProduct) {
          toast.success("¡Producto de bodegón creado exitosamente!")
          router.push("/admin/productos")
        }
      } else if (productType === "restaurant-product") {
        // Validar que se haya seleccionado un restaurante
        if (!selectedRestaurant) {
          toast.error("Debe seleccionar un restaurante")
          return
        }

        // Subir imágenes si las hay
        let imageUrls: string[] = []
        if (images.length > 0) {
          toast.info("Subiendo imágenes...")
          const uploadResults = await uploadMultipleImages(images, 'products')
          
          // Filtrar solo las imágenes que se subieron correctamente
          imageUrls = uploadResults
            .filter(result => result.url && !result.error)
            .map(result => result.url)
          
          if (uploadResults.some(result => result.error)) {
            toast.warning("Algunas imágenes no se pudieron subir")
          }
        }

        const restaurantProductData = {
          name: name.trim(),
          description: description.trim() || undefined,
          image_gallery_urls: imageUrls,
          price: parseFloat(price),
          restaurant_id: selectedRestaurant,
          category_id: categoryId || undefined,
          subcategory_id: subcategoryId || undefined,
          is_available: inStock
        }

        const createdRestaurantProduct = await createRestaurantProduct(restaurantProductData)
        
        if (createdRestaurantProduct) {
          toast.success("¡Producto de restaurante creado exitosamente!")
          router.push("/admin/productos")
        }
      } else {
        toast.error("Tipo de producto no válido")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear el producto")
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
                <BreadcrumbPage>Agregar Producto</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full pb-12">

        {/* Error Message */}
        {productError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {productError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Agregar Producto</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Descartar
              </Button>
              <Button type="button" variant="outline" disabled={creatingProduct || uploadingImages}>
                Guardar Borrador
              </Button>
              <Button 
                type="submit" 
                disabled={creatingProduct || uploadingImages}
              >
                {uploadingImages ? "Subiendo imágenes..." : 
                 creatingProduct ? "Guardando..." : 
                 "Publicar"}
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
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative"
                        >
                          {images[index] ? (
                            <>
                              <img
                                src={URL.createObjectURL(images[index])}
                                alt={`Preview ${index + 1}`}
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
                            </>
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
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
                  {/* Product Type */}
                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo de Producto</Label>
                    <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo de producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bodegon-product">Producto de Bodegón</SelectItem>
                        <SelectItem value="restaurant-product">Producto de Restaurante</SelectItem>
                      </SelectContent>
                    </Select>
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
                      bodegones.map((bodegon) => (
                        <div key={bodegon.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`bodegon-${bodegon.id}`}
                            checked={bodegonAvailability[bodegon.id] || false}
                            onCheckedChange={(checked) => 
                              handleBodegonAvailabilityChange(bodegon.id, checked === true)
                            }
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
                      ))
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