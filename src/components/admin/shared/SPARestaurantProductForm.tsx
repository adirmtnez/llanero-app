"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useNavigate } from "react-router-dom"
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
import { Upload, X, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useRestaurantCategories } from "@/hooks/restaurants/use-restaurant-categories"
import { useRestaurantSubcategories } from "@/hooks/restaurants/use-restaurant-subcategories"
import { useRestaurantProducts } from "@/hooks/restaurants/use-restaurant-products"
import { useProductImages } from "@/hooks/use-product-images"
import { QuickAddCategoryPopover } from "@/components/quick-add-category-popover"
import { toast } from "sonner"
import { BodegonProduct } from "@/types/products"

interface SPARestaurantProductFormProps {
  product?: BodegonProduct | null
  mode: 'create' | 'edit'
}

function SPARestaurantProductFormComponent({ product, mode }: SPARestaurantProductFormProps) {
  const navigate = useNavigate()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { createProduct, updateProduct, loading: creatingProduct, error: productError } = useRestaurantProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
  const { categories: restaurantCategories, loading: restaurantCategoriesLoading, createCategory } = useRestaurantCategories()
  const { subcategories: restaurantSubcategories, loading: restaurantSubcategoriesLoading, createSubcategory } = useRestaurantSubcategories()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [categoryId, setCategoryId] = useState("none")
  const [subcategoryId, setSubcategoryId] = useState("none")
  const [productStatus, setProductStatus] = useState("active")
  const [inStock, setInStock] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({})

  // Initialize form with product data if editing
  useEffect(() => {
    const dataLoaded = restaurants.length > 0 && restaurantCategories.length > 0
    
    if (mode === 'edit' && product && !isFormInitialized && dataLoaded) {
      setName(product.name || "")
      setDescription(product.description || "")
      const priceValue = product.price?.toString() || ""
      setPrice(priceValue)
      setSelectedRestaurant(product.restaurant_id || "")
      setCategoryId(product.category_id || "none")
      setSubcategoryId(product.subcategory_id || "none")
      setProductStatus(product.is_active_product ? "active" : "inactive")
      setInStock(product.is_active_product !== false)
      setExistingImages(product.image_gallery_urls || [])
      setIsFormInitialized(true)
    } else if (mode === 'create' && !isFormInitialized) {
      // Reset form for create mode
      setName("")
      setDescription("")
      setPrice("")
      setSelectedRestaurant("")
      setCategoryId("none")
      setSubcategoryId("none")
      setProductStatus("active")
      setInStock(true)
      setExistingImages([])
      setIsFormInitialized(true)
    }
  }, [mode, product, isFormInitialized, restaurants, restaurantCategories, restaurantsLoading, restaurantCategoriesLoading])

  // Reset initialization flag when product changes
  useEffect(() => {
    setIsFormInitialized(false)
  }, [product?.id])

  // Handle restaurant change - reset categories when restaurant changes
  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId)
    setCategoryId("none") // Reset category when restaurant changes
    setSubcategoryId("none") // Reset subcategory when restaurant changes
    
    // Clear restaurant validation error when user selects one
    if (restaurantId && validationErrors.restaurant) {
      setValidationErrors(prev => ({ ...prev, restaurant: false }))
    }
  }

  const getFilteredCategories = () => {
    if (!selectedRestaurant || selectedRestaurant === "none") return []
    return restaurantCategories.filter(category => category.restaurant_id === selectedRestaurant)
  }

  const getFilteredSubcategories = () => {
    if (!categoryId || categoryId === "none") return []
    return restaurantSubcategories.filter(sub => sub.parent_category === categoryId)
  }

  // Handle category change
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    setSubcategoryId("none") // Reset subcategory when category changes
  }

  // Quick add category function for restaurants
  const handleQuickAddCategory = async (name: string): Promise<string | null> => {
    const result = await createCategory({
      name,
      restaurant_id: selectedRestaurant,
      is_active: true
    })

    if (result.data) {
      const newCategoryId = result.data.id
      setCategoryId(newCategoryId) // Auto-select the new category
      return newCategoryId
    } else {
      toast.error(result.error || "Error al crear categoría")
      return null
    }
  }

  // Quick add subcategory function for restaurants
  const handleQuickAddSubcategory = async (name: string): Promise<string | null> => {
    if (!categoryId || categoryId === "none") {
      toast.error("Primero selecciona una categoría")
      return null
    }

    const result = await createSubcategory({
      name,
      parent_category: categoryId,
      is_active: true
    })

    if (result.data) {
      const newSubcategoryId = result.data.id
      setSubcategoryId(newSubcategoryId) // Auto-select the new subcategory
      return newSubcategoryId
    } else {
      toast.error(result.error || "Error al crear subcategoría")
      return null
    }
  }


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const processedValue = inputValue.replace(',', '.')
    setPrice(processedValue)
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
        const totalImages = existingImages.length + images.length + validImages.length
        if (totalImages > 4) {
          toast.warning("Máximo 4 imágenes permitidas")
          return
        }
        setImages(prev => [...prev, ...validImages])
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
    
    // Reset validation errors
    setValidationErrors({})
    
    // Validar campos requeridos
    const errors: {[key: string]: boolean} = {}
    
    if (!name.trim()) {
      errors.name = true
      toast.error("El nombre del producto es requerido")
    }
    
    if (!price || parseFloat(price) <= 0) {
      errors.price = true
      toast.error("El precio debe ser mayor a 0")
    }
    
    // Get selected restaurants (only those marked as available)
    const selectedRestaurants = Object.keys(restaurantAvailability).filter(
      restaurantId => restaurantAvailability[restaurantId] === true
    )

    if (selectedRestaurants.length === 0) {
      errors.restaurants = true
      toast.error("Debe seleccionar al menos un restaurante donde el producto estará disponible")
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      // Subir imágenes nuevas si las hay
      let newImageUrls: string[] = []
      if (images.length > 0) {
        toast.info("Subiendo imágenes...")
        const uploadResults = await uploadMultipleImages(images, 'products')
        
        // Filtrar solo las imágenes que se subieron correctamente
        newImageUrls = uploadResults
          .filter(result => result.url && !result.error)
          .map(result => result.url)
        
        if (uploadResults.some(result => result.error)) {
          toast.warning("Algunas imágenes no se pudieron subir")
        }
      }

      // Combinar imágenes existentes con nuevas
      const allImageUrls = [...existingImages, ...newImageUrls]

      const productData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category_id: categoryId && categoryId !== "none" ? categoryId : undefined,
        subcategory_id: subcategoryId && subcategoryId !== "none" ? subcategoryId : undefined,
        price: parseFloat(price),
        restaurant_id: selectedRestaurant,
        is_available: productStatus === "active",
        image_gallery_urls: allImageUrls
      }

      let result
      if (mode === 'create') {
        result = await createProduct(productData)
      } else if (mode === 'edit' && product?.id) {
        result = await updateProduct(product.id, productData)
      }
      
      if (result) {
        toast.success(`¡Producto de restaurante ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente!`)
        navigate("/restaurantes/productos")
      }
    } catch (error) {
      console.error("Error saving restaurant product:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el producto")
    }
  }

  const isLoading = creatingProduct || uploadingImages || restaurantsLoading

  return (
    <div className="relative flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full pb-12">
      {/* Error Message */}
      {productError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {productError}
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/restaurantes/productos")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Agregar' : 'Editar'} Producto de Restaurante
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Removed buttons - now using sticky buttons */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Left Column - Product Details */}
          <div className="space-y-6">
            {/* Product Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={validationErrors.name ? "text-red-600" : ""}>Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (validationErrors.name) {
                        setValidationErrors(prev => ({ ...prev, name: false }))
                      }
                    }}
                    placeholder="Ej: Pizza Margherita"
                    className={validationErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-600">El nombre del producto es requerido</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del producto de restaurante"
                    rows={4}
                  />
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
                      PNG, JPG o WebP (máx. 5MB)
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
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {/* Existing Images */}
                    {existingImages.map((imageUrl, index) => (
                      <div
                        key={`existing-${index}`}
                        className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative"
                      >
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
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
                    
                    {/* New Images */}
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
                    
                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, 4 - existingImages.length - images.length) }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center"
                      >
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restaurant Selection Card */}
            <Card className={validationErrors.restaurant ? "border-red-500" : ""}>
              <CardHeader>
                <CardTitle className={validationErrors.restaurant ? "text-red-600" : ""}>Restaurante *</CardTitle>
                <p className={`text-sm ${validationErrors.restaurant ? "text-red-600" : "text-muted-foreground"}`}>
                  Selecciona el restaurante al que pertenece este producto
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Seleccionar Restaurante *</Label>
                  <Select value={selectedRestaurant} onValueChange={handleRestaurantChange}>
                    <SelectTrigger className={validationErrors.restaurant ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
                      <SelectValue placeholder={
                        restaurantsLoading 
                          ? "Cargando restaurantes..." 
                          : "Selecciona un restaurante"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{restaurant.name}</span>
                            {restaurant.address && (
                              <span className="text-xs text-muted-foreground">{restaurant.address}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.restaurant && (
                    <p className="text-sm text-red-600">Debe seleccionar un restaurante</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {!selectedRestaurant || selectedRestaurant === "none" 
                    ? "Primero selecciona un restaurante para ver las categorías disponibles"
                    : "Selecciona una categoría para organizar el producto"
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">Seleccionar una categoría</Label>
                    <QuickAddCategoryPopover
                      type="category"
                      onAdd={handleQuickAddCategory}
                      disabled={!selectedRestaurant}
                    />
                  </div>
                  <Select 
                    value={categoryId} 
                    onValueChange={handleCategoryChange}
                    disabled={!selectedRestaurant || selectedRestaurant === "none"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        !selectedRestaurant || selectedRestaurant === "none"
                          ? "Selecciona un restaurante primero"
                          : restaurantCategoriesLoading
                          ? "Cargando categorías..." 
                          : "Seleccionar una categoría"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {getFilteredCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Selection */}
                {categoryId && categoryId !== "none" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subcategory">Seleccionar una subcategoría</Label>
                      <QuickAddCategoryPopover
                        type="subcategory"
                        onAdd={handleQuickAddSubcategory}
                        disabled={!categoryId || categoryId === "none"}
                      />
                    </div>
                    <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          restaurantSubcategoriesLoading
                            ? "Cargando subcategorías..." 
                            : "Seleccionar una subcategoría"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin subcategoría</SelectItem>
                        {getFilteredSubcategories().length === 0 ? (
                          <SelectItem value="no-subcategories" disabled>
                            No hay subcategorías para esta categoría
                          </SelectItem>
                        ) : (
                          getFilteredSubcategories().map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <Label htmlFor="price" className={validationErrors.price ? "text-red-600" : ""}>Precio *</Label>
                  <div className="flex">
                    <span className={`inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 rounded-l-md ${
                      validationErrors.price ? "border-red-500" : "border-gray-300"
                    }`}>
                      USD
                    </span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => {
                        handlePriceChange(e)
                        if (validationErrors.price) {
                          setValidationErrors(prev => ({ ...prev, price: false }))
                        }
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`rounded-l-none text-right ${
                        validationErrors.price ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-sm text-red-600">El precio debe ser mayor a 0</p>
                  )}
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
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Activo
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Inactivo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Establece el estado del producto de restaurante.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 flex items-center gap-3">
        <Button 
          type="submit" 
          form="product-form"
          size="lg"
          disabled={creatingProduct || uploadingImages}
          className="shadow-lg min-w-[140px] rounded-full"
        >
          {uploadingImages ? "Subiendo..." : 
           creatingProduct ? "Guardando..." : 
           mode === 'create' ? "Crear Producto" : "Actualizar"}
        </Button>
      </div>
    </div>
  )
}

// Use a simple browser check to prevent hydration issues
export function SPARestaurantProductForm({ product, mode }: SPARestaurantProductFormProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="relative flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full pb-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }
  
  return <SPARestaurantProductFormComponent product={product} mode={mode} />
}