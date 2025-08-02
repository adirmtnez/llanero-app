"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { AddSubcategoryModal } from "@/components/modals/add-subcategory-modal"
import { DeleteRestaurantProductModal } from "@/components/restaurants/delete-product-modal"
import { QuickAddCategoryPopover } from "@/components/quick-add-category-popover"
import { toast } from "sonner"
import { BodegonProduct } from "@/types/products"

interface RestaurantProductFormProps {
  product?: BodegonProduct | null // For edit mode
  mode: 'create' | 'edit'
}

export function RestaurantProductForm({ product, mode }: RestaurantProductFormProps) {
  const router = useRouter()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { createProduct, updateProduct, loading: creatingProduct, error: productError } = useRestaurantProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
  // Categories and subcategories hooks
  const { categories: restaurantCategories, loading: restaurantCategoriesLoading, createCategory } = useRestaurantCategories()
  const { subcategories: restaurantSubcategories, loading: restaurantSubcategoriesLoading, createSubcategory } = useRestaurantSubcategories()

  // State declarations - must come before useEffects that reference them
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
  const [productStatus, setProductStatus] = useState("active")
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Filter functions - must come before useEffects that reference them
  const getFilteredCategories = () => {
    if (!selectedRestaurant) {
      console.log('📂 getFilteredCategories: No restaurant selected')
      return []
    }
    
    const filtered = restaurantCategories.filter(category => category.restaurant_id === selectedRestaurant)
    console.log('📂 getFilteredCategories:', { 
      selectedRestaurant, 
      selectedRestaurantType: typeof selectedRestaurant,
      totalCategories: restaurantCategories.length,
      filteredCount: filtered.length,
      filtered: filtered.map(c => ({ id: c.id, idType: typeof c.id, name: c.name, restaurant_id: c.restaurant_id, restaurant_id_type: typeof c.restaurant_id }))
    })
    
    return filtered
  }

  const getFilteredSubcategories = () => {
    if (!categoryId) return []
    return restaurantSubcategories.filter(sub => sub.parent_category === categoryId)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Replace comma with decimal point for Spanish keyboard compatibility
    const processedValue = inputValue.replace(',', '.')
    setPrice(processedValue)
  }

  // Debug logs
  useEffect(() => {
    console.log('🏪 Restaurants loaded:', { count: restaurants.length, restaurants })
    console.log('📂 Categories loaded:', { count: restaurantCategories.length, categories: restaurantCategories })
    console.log('📁 Subcategories loaded:', { count: restaurantSubcategories.length, subcategories: restaurantSubcategories })
  }, [restaurants, restaurantCategories, restaurantSubcategories])

  // Debug current form state
  useEffect(() => {
    console.log('📋 Current form state:', {
      selectedRestaurant,
      categoryId,
      subcategoryId,
      isFormInitialized
    })
  }, [selectedRestaurant, categoryId, subcategoryId, isFormInitialized])

  // Debug Select values and options
  useEffect(() => {
    console.log('🔍 Select debugging:', {
      selectedRestaurant: selectedRestaurant,
      restaurantsArray: restaurants.map(r => ({ id: r.id, name: r.name })),
      categoryId: categoryId,
      filteredCategories: getFilteredCategories().map(c => ({ id: c.id, name: c.name })),
      subcategoryId: subcategoryId,
      filteredSubcategories: getFilteredSubcategories().map(s => ({ id: s.id, name: s.name }))
    })
  }, [selectedRestaurant, categoryId, subcategoryId, restaurants, restaurantCategories, restaurantSubcategories])

  // Initialize form with product data for edit mode (only once)
  useEffect(() => {
    // Wait for restaurants and categories data to be loaded before initializing
    const dataLoaded = restaurants.length > 0 && restaurantCategories.length > 0
    
    if (mode === 'edit' && product && !isFormInitialized && dataLoaded) {
      console.log('🔄 Initializing form with product data:', {
        productId: product.id,
        name: product.name,
        restaurant_id: product.restaurant_id,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        dataLoaded: { restaurants: restaurants.length, categories: restaurantCategories.length }
      })
      
      // Verify restaurant exists in the loaded data
      const restaurantExists = restaurants.find(r => r.id === product.restaurant_id)
      console.log('🏪 Restaurant verification:', { 
        productRestaurantId: product.restaurant_id, 
        restaurantExists: !!restaurantExists,
        restaurantName: restaurantExists?.name 
      })
      
      // Verify category exists in the loaded data
      const categoryExists = restaurantCategories.find(c => c.id === product.category_id)
      console.log('📂 Category verification:', { 
        productCategoryId: product.category_id, 
        productCategoryIdType: typeof product.category_id,
        categoryExists: !!categoryExists,
        categoryName: categoryExists?.name,
        productRestaurantId: product.restaurant_id,
        productRestaurantIdType: typeof product.restaurant_id,
        allCategoriesForThisRestaurant: restaurantCategories
          .filter(cat => cat.restaurant_id === product.restaurant_id)
          .map(cat => ({ id: cat.id, idType: typeof cat.id, name: cat.name })),
        allCategoriesGlobal: restaurantCategories.map(cat => ({ 
          id: cat.id, 
          idType: typeof cat.id, 
          name: cat.name, 
          restaurant_id: cat.restaurant_id,
          restaurant_id_type: typeof cat.restaurant_id,
          matchesProductCategory: cat.id === product.category_id,
          matchesProductRestaurant: cat.restaurant_id === product.restaurant_id
        }))
      })
      
      setName(product.name || "")
      setDescription(product.description || "")
      const priceValue = product.price?.toString() || ""
      setPrice(priceValue)
      setCategoryId(product.category_id || "")
      setSubcategoryId(product.subcategory_id || "")
      setProductStatus(product.is_active_product ? "active" : "inactive")
      setExistingImages(product.image_gallery_urls || [])
      setSelectedRestaurant(product.restaurant_id || "")
      setIsFormInitialized(true)
    } else if (mode === 'create' && !isFormInitialized) {
      // Reset form for create mode
      setName("")
      setDescription("")
      setPrice("")
      setCategoryId("")
      setSubcategoryId("")
      setProductStatus("active")
      setExistingImages([])
      setSelectedRestaurant("")
      setIsFormInitialized(true)
    } else if (mode === 'edit' && product && !isFormInitialized && !dataLoaded) {
      console.log('⏳ Waiting for data to load before initializing form:', {
        restaurants: restaurants.length,
        categories: restaurantCategories.length,
        restaurantsLoading,
        restaurantCategoriesLoading
      })
    }
  }, [mode, product, isFormInitialized, restaurants, restaurantCategories, restaurantsLoading, restaurantCategoriesLoading])

  // Reset initialization flag when product changes (for navigating between different products)
  useEffect(() => {
    setIsFormInitialized(false)
  }, [product?.id, mode])

  // Handle restaurant change
  const handleRestaurantChange = (newRestaurantId: string) => {
    setSelectedRestaurant(newRestaurantId)
    setCategoryId("") // Reset category when restaurant changes
    setSubcategoryId("") // Reset subcategory when restaurant changes
  }

  // Handle category change
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    setSubcategoryId("") // Reset subcategory when category changes
  }

  // Quick add category function
  const handleQuickAddCategory = async (name: string): Promise<string | null> => {
    if (!selectedRestaurant) {
      toast.error("Primero selecciona un restaurante")
      return null
    }

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

  // Quick add subcategory function
  const handleQuickAddSubcategory = async (name: string): Promise<string | null> => {
    if (!categoryId) {
      toast.error("Primero selecciona una categoría")
      return null
    }

    if (!selectedRestaurant) {
      toast.error("Primero selecciona un restaurante")
      return null
    }

    const result = await createSubcategory({
      name,
      parent_category: categoryId,
      restaurant_id: selectedRestaurant,
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

  const handleDeleteProduct = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    router.push("/admin/restaurantes/productos")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!name.trim()) {
      toast.error("El nombre del producto es requerido")
      return
    }
    
    if (!price || parseFloat(price) <= 0) {
      toast.error("El precio debe ser mayor a 0")
      return
    }

    if (!selectedRestaurant) {
      toast.error("Debe seleccionar un restaurante")
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
        category_id: categoryId || undefined,
        subcategory_id: subcategoryId || undefined,
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
        router.push("/admin/restaurantes/productos")
      }
    } catch (error) {
      console.error("Error saving restaurant product:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el producto")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full pb-12">
      {/* Error Message */}
      {productError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {productError}
        </div>
      )}

      {/* Debug Info (hidden but available for future use) */}
      {/* {process.env.NODE_ENV === 'development' && mode === 'edit' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-xs">
          <div><strong>Debug Info:</strong></div>
          <div>Form Initialized: {isFormInitialized ? 'Yes' : 'No'}</div>
          <div>Selected Restaurant: {selectedRestaurant || 'None'}</div>
          <div>Selected Category: {categoryId || 'None'}</div>
          <div>Selected Subcategory: {subcategoryId || 'None'}</div>
          <div>Restaurants Loaded: {restaurants.length}</div>
          <div>Categories Loaded: {restaurantCategories.length}</div>
          <div>Product Data: {product ? `${product.name} (${product.id})` : 'None'}</div>
        </div>
      )} */}

      {/* Header with Actions - Outside form to prevent submit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/admin/restaurantes/productos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Agregar' : 'Editar'} Producto de Restaurante
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'edit' && product && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleDeleteProduct}
              disabled={creatingProduct || uploadingImages}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button 
            form="product-form"
            type="submit" 
            disabled={creatingProduct || uploadingImages}
          >
            {uploadingImages ? "Subiendo imágenes..." : 
             creatingProduct ? "Guardando..." : 
             mode === 'create' ? "Crear Producto" : "Actualizar Producto"}
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

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
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Hamburguesa Premium"
                  />
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
            <Card>
              <CardHeader>
                <CardTitle>Restaurante</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecciona el restaurante donde estará disponible este producto
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Seleccionar restaurante *</Label>
                  <Select 
                    value={String(selectedRestaurant || "")} 
                    onValueChange={handleRestaurantChange} 
                    disabled={mode === 'edit'}
                    key={`restaurant-${isFormInitialized}`}
                    onOpenChange={(open) => {
                      if (open) {
                        console.log('🏪 Restaurant Select opened:', {
                          value: selectedRestaurant,
                          valueType: typeof selectedRestaurant,
                          options: restaurants.map(r => ({ 
                            id: r.id, 
                            idType: typeof r.id, 
                            name: r.name,
                            matchesCurrentValue: r.id === selectedRestaurant
                          }))
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        restaurantsLoading
                          ? "Cargando restaurantes..." 
                          : mode === 'edit'
                            ? "Restaurante (no se puede cambiar)"
                            : "Seleccionar un restaurante"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.length === 0 ? (
                        <SelectItem value="no-restaurants" disabled>
                          No hay restaurantes disponibles
                        </SelectItem>
                      ) : (
                        restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={String(restaurant.id)}>
                            <div className="flex flex-col items-start">
                              <span>{restaurant.name}</span>
                              {restaurant.address && (
                                <span className="text-xs text-muted-foreground">
                                  {restaurant.address}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Categories Card */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
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
                    value={String(categoryId || "")} 
                    onValueChange={handleCategoryChange} 
                    disabled={!selectedRestaurant}
                    key={`category-${selectedRestaurant}-${isFormInitialized}`}
                    onOpenChange={(open) => {
                      if (open) {
                        console.log('📂 Category Select opened:', {
                          value: categoryId,
                          valueType: typeof categoryId,
                          selectedRestaurant,
                          selectedRestaurantType: typeof selectedRestaurant,
                          filteredOptions: getFilteredCategories().map(c => ({ 
                            id: c.id, 
                            idType: typeof c.id, 
                            name: c.name, 
                            restaurant_id: c.restaurant_id,
                            restaurant_id_type: typeof c.restaurant_id,
                            matches: c.restaurant_id === selectedRestaurant,
                            matchesCurrentValue: c.id === categoryId
                          }))
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        restaurantCategoriesLoading
                          ? "Cargando categorías..." 
                          : selectedRestaurant
                            ? "Seleccionar una categoría"
                            : "Primero selecciona un restaurante"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredCategories().length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          {selectedRestaurant ? "No hay categorías para este restaurante" : "Selecciona un restaurante primero"}
                        </SelectItem>
                      ) : (
                        getFilteredCategories().map((category) => {
                          const isSelected = category.id === categoryId
                          console.log(`📂 Rendering SelectItem:`, {
                            categoryId: category.id,
                            categoryIdType: typeof category.id,
                            categoryName: category.name,
                            currentValue: categoryId,
                            currentValueType: typeof categoryId,
                            isSelected: isSelected,
                            stringMatch: String(category.id) === String(categoryId)
                          })
                          return (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name} {isSelected ? '✓' : ''}
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Selection */}
                {categoryId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subcategory">Seleccionar una subcategoría</Label>
                      <QuickAddCategoryPopover
                        type="subcategory"
                        onAdd={handleQuickAddSubcategory}
                        disabled={!categoryId}
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
                  <Label htmlFor="price">Precio *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      USD
                    </span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="rounded-l-none text-right"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Producto</CardTitle>
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
                    Activo: Disponible para pedidos. Inactivo: No disponible.
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
        }}
        categoryType="restaurant"
      />

      {/* Subcategory Creation Modal */}
      <AddSubcategoryModal
        open={showSubcategoryModal}
        onOpenChange={setShowSubcategoryModal}
        onSuccess={() => {
          setShowSubcategoryModal(false)
        }}
        subcategoryType="restaurant"
      />

      {/* Delete Product Modal */}
      {mode === 'edit' && product && (
        <DeleteRestaurantProductModal 
          open={showDeleteModal} 
          onOpenChange={setShowDeleteModal}
          product={product}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}