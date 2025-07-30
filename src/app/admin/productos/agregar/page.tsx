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
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useBodegones } from "@/hooks/use-bodegones"
import { useCategories } from "@/hooks/use-categories"
import { useBodegonProducts } from "@/hooks/use-bodegon-products"
import { useProductImages } from "@/hooks/use-product-images"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { toast } from "sonner"

export default function AgregarProductoPage() {
  const router = useRouter()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const { createProduct, loading: creatingProduct, error: productError } = useBodegonProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
  // Categories hooks - dynamic based on product type
  const bodegonCategories = useCategories('bodegon')
  const restaurantCategories = useCategories('restaurant')
  
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
  const [comparePrice, setComparePrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [costPerItem, setCostPerItem] = useState("")
  const [profit, setProfit] = useState("")
  const [margin, setMargin] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [bodegonAvailability, setBodegonAvailability] = useState<{[key: string]: {available: boolean, quantity: string}}>({})

  // Initialize bodegon availability when bodegones are loaded
  const initializeBodegonAvailability = useCallback(() => {
    const initialAvailability: {[key: string]: {available: boolean, quantity: string}} = {}
    bodegones.forEach(bodegon => {
      initialAvailability[bodegon.id] = { available: false, quantity: "0" }
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
    setSubcategoryId("") // Reset subcategory
    
    // Load subcategories for the selected category
    if (newCategoryId) {
      if (productType === "bodegon-product") {
        bodegonCategories.loadSubcategories(newCategoryId)
      } else if (productType === "restaurant-product") {
        restaurantCategories.loadSubcategories(newCategoryId)
      }
    }
  }

  // Reset categories when product type changes
  useEffect(() => {
    setCategoryId("")
    setSubcategoryId("")
  }, [productType])

  // Handle successful category creation
  const handleCategoryCreated = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    // Reload categories to show the new one
    if (productType === "bodegon-product") {
      bodegonCategories.loadCategories()
    } else if (productType === "restaurant-product") {
      restaurantCategories.loadCategories()
    }
  }

  // Handle successful subcategory creation
  const handleSubcategoryCreated = (newSubcategoryId: string) => {
    setSubcategoryId(newSubcategoryId)
    // Reload subcategories to show the new one
    if (categoryId) {
      if (productType === "bodegon-product") {
        bodegonCategories.loadSubcategories(categoryId)
      } else if (productType === "restaurant-product") {
        restaurantCategories.loadSubcategories(categoryId)
      }
    }
  }

  // Calculate Costo por item, Ganancia and Margen automatically
  useEffect(() => {
    const priceNum = parseFloat(price) || 0
    const comparePriceNum = parseFloat(comparePrice) || 0
    const quantityNum = parseFloat(quantity) || 1

    // Costo por item = Precio / Cantidad
    if (quantityNum > 0) {
      const costPerItemValue = priceNum / quantityNum
      setCostPerItem(costPerItemValue.toFixed(2))
    } else {
      setCostPerItem("0.00")
    }

    // Ganancia = Precio - Precio de compra
    const profitValue = priceNum - comparePriceNum
    setProfit(profitValue.toFixed(2))

    // Margen = (Precio - Precio de compra) / Precio * 100
    if (priceNum > 0) {
      const marginValue = ((priceNum - comparePriceNum) / priceNum) * 100
      setMargin(marginValue.toFixed(2))
    } else {
      setMargin("0.00")
    }
  }, [price, comparePrice, quantity])

  const handleBodegonAvailabilityChange = (bodegonId: string, available: boolean) => {
    setBodegonAvailability(prev => ({
      ...prev,
      [bodegonId]: {
        ...prev[bodegonId],
        available,
        quantity: available ? prev[bodegonId]?.quantity || "0" : "0"
      }
    }))
  }

  const handleBodegonQuantityChange = (bodegonId: string, quantity: string) => {
    setBodegonAvailability(prev => ({
      ...prev,
      [bodegonId]: {
        ...prev[bodegonId],
        quantity
      }
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages].slice(0, 6))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!productType) {
      alert("Debe seleccionar un tipo de producto")
      return
    }
    
    if (!name.trim()) {
      alert("El nombre del producto es requerido")
      return
    }
    
    if (!price || parseFloat(price) <= 0) {
      alert("El precio debe ser mayor a 0")
      return
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      alert("La cantidad debe ser mayor a 0")
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
          purchase_price: comparePrice ? parseFloat(comparePrice) : undefined,
          quantity_in_pack: parseFloat(quantity),
          is_active_product: true,
          is_discount: false,
          is_promo: false,
          image_gallery_urls: imageUrls
        }

        const createdProduct = await createProduct(productData)
        
        if (createdProduct) {
          toast.success("¡Producto creado exitosamente!")
          router.push("/admin/productos")
        }
      } else {
        toast.error("Creación de productos de restaurante no implementada aún")
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

      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Agregar Producto</h1>
          </div>
        </div>

        {/* Error Message */}
        {productError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {productError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Information Card */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  {/* Product Type */}
                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo de Producto</Label>
                    <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger>
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
                        <SelectTrigger>
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

                  {/* Category Selection - Show for both product types */}
                  {productType && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="category">Categoría</Label>
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
                            (productType === "bodegon-product" && bodegonCategories.loading) ||
                            (productType === "restaurant-product" && restaurantCategories.loading)
                              ? "Cargando categorías..." 
                              : "Seleccionar categoría"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {productType === "bodegon-product" && 
                            bodegonCategories.categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          }
                          {productType === "restaurant-product" && 
                            restaurantCategories.categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      {/* Show category loading error */}
                      {((productType === "bodegon-product" && bodegonCategories.error) ||
                        (productType === "restaurant-product" && restaurantCategories.error)) && (
                        <p className="text-xs text-red-500">
                          {productType === "bodegon-product" ? bodegonCategories.error : restaurantCategories.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Subcategory Selection - Show when category is selected */}
                  {categoryId && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subcategory">Subcategoría</Label>
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
                            (productType === "bodegon-product" && bodegonCategories.loading) ||
                            (productType === "restaurant-product" && restaurantCategories.loading)
                              ? "Cargando subcategorías..." 
                              : "Seleccionar subcategoría"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {productType === "bodegon-product" && 
                            bodegonCategories.subcategories.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </SelectItem>
                            ))
                          }
                          {productType === "restaurant-product" && 
                            restaurantCategories.subcategories.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      {/* Show subcategory loading error */}
                      {((productType === "bodegon-product" && bodegonCategories.error) ||
                        (productType === "restaurant-product" && restaurantCategories.error)) && (
                        <p className="text-xs text-red-500">
                          {productType === "bodegon-product" ? bodegonCategories.error : restaurantCategories.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre del producto"
                    />
                  </div>

                  {/* Measurements */}
                  <div className="space-y-2">
                    <Label htmlFor="measurements">Medidas</Label>
                    <Input
                      id="measurements"
                      value={measurements}
                      onChange={(e) => setMeasurements(e.target.value)}
                      placeholder="Ej: 500ml, 1kg, etc."
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripción del producto"
                      rows={4}
                    />
                  </div>

                  {/* Product Images */}
                  <div className="space-y-2">
                    <Label>Fotos del producto</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium">Cargar Fotos</span>
                        <span className="text-xs text-gray-500 mt-1">
                          Arrastra y suelta fotos aquí o haga clic para cargar
                        </span>
                        <span className="text-xs text-gray-500">
                          (Más 4 de link, png, jpg, jpeg y video)
                        </span>
                      </label>
                    </div>
                    
                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-6 gap-2 mt-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative"
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
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <div className="w-6 h-6 bg-red-400 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Price Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Precio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio <span className="text-red-500">*</span></Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="comparePrice">Precio de compra</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="comparePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={comparePrice}
                          onChange={(e) => setComparePrice(e.target.value)}
                          placeholder="0.00"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad <span className="text-red-500">*</span></Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPerItem">Costo por ítem <span className="text-xs text-gray-500">(Calculado)</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="costPerItem"
                          type="number"
                          step="0.01"
                          value={costPerItem}
                          readOnly
                          placeholder="0.00"
                          className="rounded-l-none bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit">Ganancia <span className="text-xs text-gray-500">(Calculado)</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="profit"
                          type="number"
                          step="0.01"
                          value={profit}
                          readOnly
                          placeholder="0.00"
                          className="rounded-l-none bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margin">Margen <span className="text-xs text-gray-500">(Calculado)</span></Label>
                      <div className="flex">
                        <Input
                          id="margin"
                          type="number"
                          step="0.01"
                          value={margin}
                          readOnly
                          placeholder="0"
                          className="rounded-r-none bg-gray-50 text-gray-700"
                        />
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Inventory Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Inventario
                    <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Este producto tiene un SKU o código de barras
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="flex items-center gap-2">
                      SKU
                      <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600">?</span>
                      </span>
                    </Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="SKU del producto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="flex items-center gap-2">
                      Código de barras
                      <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600">?</span>
                      </span>
                    </Label>
                    <Input
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Código de barras"
                    />
                  </div>
                  
                  {/* Bodegones List */}
                  {bodegonesLoading ? (
                    <div className="text-sm text-gray-500">Cargando bodegones...</div>
                  ) : bodegones.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Bodegones en el sistema:</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {bodegones.map((bodegon) => (
                          <div key={bodegon.id} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            <div className="font-medium">{bodegon.name}</div>
                            {bodegon.address && (
                              <div className="text-gray-500">{bodegon.address}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No hay bodegones registrados</div>
                  )}
                </CardContent>
              </Card>

              {/* Availability Section - Only show for Bodegon products */}
              {productType === "bodegon-product" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Disponibilidad</CardTitle>
                    <p className="text-sm text-gray-600">
                      Selecciona en qué bodegones estará disponible este producto
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bodegonesLoading ? (
                      <div className="text-sm text-gray-500">Cargando bodegones...</div>
                    ) : bodegones.length > 0 ? (
                      bodegones.map((bodegon) => (
                        <div key={bodegon.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`bodegon-${bodegon.id}`}
                              checked={bodegonAvailability[bodegon.id]?.available || false}
                              onCheckedChange={(checked) => 
                                handleBodegonAvailabilityChange(bodegon.id, checked === true)
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`bodegon-${bodegon.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                          <div className="ml-auto flex items-center gap-2">
                            <Label htmlFor={`quantity-${bodegon.id}`} className="text-sm">
                              Cantidad:
                            </Label>
                            <Input
                              id={`quantity-${bodegon.id}`}
                              type="number"
                              value={bodegonAvailability[bodegon.id]?.quantity || "0"}
                              onChange={(e) => handleBodegonQuantityChange(bodegon.id, e.target.value)}
                              disabled={!bodegonAvailability[bodegon.id]?.available}
                              className="w-20"
                              min="0"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No hay bodegones registrados en el sistema</div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              className="min-w-[120px]"
              disabled={creatingProduct || uploadingImages}
            >
              {uploadingImages ? "Subiendo imágenes..." : 
               creatingProduct ? "Guardando..." : 
               "Guardar producto"}
            </Button>
          </div>
        </form>

        {/* Category Creation Modal */}
        <AddCategoryModal
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          type="category"
          productType={productType === "bodegon-product" ? "bodegon" : "restaurant"}
          onSuccess={handleCategoryCreated}
          createCategory={
            productType === "bodegon-product" 
              ? bodegonCategories.createCategory 
              : restaurantCategories.createCategory
          }
        />

        {/* Subcategory Creation Modal */}
        <AddCategoryModal
          open={showSubcategoryModal}
          onOpenChange={setShowSubcategoryModal}
          type="subcategory"
          productType={productType === "bodegon-product" ? "bodegon" : "restaurant"}
          parentCategoryId={categoryId}
          onSuccess={handleSubcategoryCreated}
          createSubcategory={
            productType === "bodegon-product" 
              ? bodegonCategories.createSubcategory 
              : restaurantCategories.createSubcategory
          }
        />
      </div>
    </>
  )
}