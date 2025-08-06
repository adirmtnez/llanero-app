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
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useBodegones } from "@/hooks/use-bodegones"
import { useBodegonCategories } from "@/hooks/bodegones/use-bodegon-categories"
import { useBodegonSubcategories } from "@/hooks/bodegones/use-bodegon-subcategories"
import { useBodegonProducts } from "@/hooks/bodegones/use-bodegon-products"
import { useProductImages } from "@/hooks/use-product-images"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { AddSubcategoryModal } from "@/components/modals/add-subcategory-modal"
import { DeleteBodegonProductModal } from "@/components/bodegones/delete-product-modal"
import { QuickAddCategoryPopover } from "@/components/quick-add-category-popover"
import { toast } from "sonner"
import { BodegonProduct } from "@/types/products"

interface BodegonProductFormProps {
  product?: BodegonProduct | null // For edit mode
  mode: 'create' | 'edit'
}

export function BodegonProductForm({ product, mode }: BodegonProductFormProps) {
  const router = useRouter()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const { createProductWithInventory, updateProductWithInventory, getProductInventory, loading: creatingProduct, error: productError } = useBodegonProducts()
  const { uploadMultipleImages, uploading: uploadingImages } = useProductImages()
  
  // Categories and subcategories hooks
  const { categories: bodegonCategories, loading: bodegonCategoriesLoading, createCategory } = useBodegonCategories()
  const { subcategories: bodegonSubcategories, loading: bodegonSubcategoriesLoading, createSubcategory } = useBodegonSubcategories()
  
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [price, setPrice] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])  
  const [bodegonAvailability, setBodegonAvailability] = useState<{[key: string]: boolean}>({})
  const [productStatus, setProductStatus] = useState("active")
  const [inStock, setInStock] = useState(true)
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({})

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Replace comma with decimal point for Spanish keyboard compatibility
    const processedValue = inputValue.replace(',', '.')
    setPrice(processedValue)
  }

  const handleDeleteProduct = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    router.push("/admin/bodegones/productos")
  }

  // Initialize form with product data for edit mode (only once)
  useEffect(() => {
    // Wait for bodegones and categories data to be loaded before initializing
    const dataLoaded = bodegones.length > 0 && bodegonCategories.length > 0
    
    if (mode === 'edit' && product && !isFormInitialized && dataLoaded) {
      setName(product.name || "")
      setDescription(product.description || "")
      setSku(product.sku || "")
      setBarcode(product.bar_code || "")
      const priceValue = product.price?.toString() || ""
      setPrice(priceValue)
      setCategoryId(product.category_id || "")
      setSubcategoryId(product.subcategory_id || "")
      setProductStatus(product.is_active_product ? "active" : "inactive")
      setInStock(product.is_active_product !== false)
      setExistingImages(product.image_gallery_urls || [])
      
      // Load existing inventory
      if (product.id) {
        loadProductInventory(product.id)
      }
      
      setIsFormInitialized(true)
    } else if (mode === 'create' && !isFormInitialized) {
      // Reset form for create mode
      setName("")
      setDescription("")
      setSku("")
      setBarcode("")
      setPrice("")
      setCategoryId("")
      setSubcategoryId("")
      setProductStatus("active")
      setInStock(true)
      setExistingImages([])
      setIsFormInitialized(true)
    }
  }, [mode, product, isFormInitialized, bodegones, bodegonCategories, bodegonesLoading, bodegonCategoriesLoading])

  // Reset initialization flag when product changes (for navigating between different products)
  useEffect(() => {
    setIsFormInitialized(false)
  }, [product?.id])

  // Load product inventory for edit mode
  const loadProductInventory = async (productId: string) => {
    try {
      const availableBodegones = await getProductInventory(productId)
      const initialAvailability: {[key: string]: boolean} = {}
      
      bodegones.forEach(bodegon => {
        initialAvailability[bodegon.id] = availableBodegones.includes(bodegon.id)
      })
      
      setBodegonAvailability(initialAvailability)
    } catch (error) {
      console.error('Error loading product inventory:', error)
    }
  }

  // Initialize bodegon availability when bodegones are loaded
  const initializeBodegonAvailability = useCallback(() => {
    if (mode === 'create') {
      const initialAvailability: {[key: string]: boolean} = {}
      bodegones.forEach(bodegon => {
        initialAvailability[bodegon.id] = false
      })
      setBodegonAvailability(initialAvailability)
    }
  }, [bodegones, mode])

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

  // Filter subcategories based on selected category
  const getFilteredSubcategories = () => {
    if (!categoryId) return []
    return bodegonSubcategories.filter(sub => sub.parent_category === categoryId)
  }

  // Quick add category function for bodegones
  const handleQuickAddCategory = async (name: string): Promise<string | null> => {
    const result = await createCategory({
      name,
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

  // Quick add subcategory function for bodegones
  const handleQuickAddSubcategory = async (name: string): Promise<string | null> => {
    if (!categoryId) {
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

  const handleBodegonAvailabilityChange = (bodegonId: string, available: boolean) => {
    setBodegonAvailability(prev => ({
      ...prev,
      [bodegonId]: available
    }))
    
    // Clear bodegones validation error when user selects at least one
    if (available && validationErrors.bodegones) {
      setValidationErrors(prev => ({ ...prev, bodegones: false }))
    }
  }

  const handleSelectAllBodegones = (selectAll: boolean) => {
    const newAvailability: {[key: string]: boolean} = {}
    bodegones.forEach(bodegon => {
      newAvailability[bodegon.id] = selectAll
    })
    setBodegonAvailability(newAvailability)
  }

  const areAllBodegonesSelected = bodegones.length > 0 && bodegones.every(bodegon => bodegonAvailability[bodegon.id] === true)

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
    
    // Get selected bodegones (only those marked as available)
    const selectedBodegones = Object.keys(bodegonAvailability).filter(
      bodegonId => bodegonAvailability[bodegonId] === true
    )

    if (selectedBodegones.length === 0) {
      errors.bodegones = true
      toast.error("Debe seleccionar al menos un bodegón donde el producto estará disponible")
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
        sku: sku.trim() || undefined,
        bar_code: barcode.trim() || undefined,
        category_id: categoryId || undefined,
        subcategory_id: subcategoryId || undefined,
        price: parseFloat(price),
        is_active_product: productStatus === "active",
        is_discount: false,
        is_promo: false,
        discounted_price: null,
        image_gallery_urls: allImageUrls
      }

      // selectedBodegones already calculated above

      let result
      if (mode === 'create') {
        result = await createProductWithInventory(productData, selectedBodegones)
      } else if (mode === 'edit' && product?.id) {
        result = await updateProductWithInventory(product.id, productData, selectedBodegones)
      }
      
      if (result) {
        toast.success(`¡Producto de bodegón ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente!`)
        router.push("/admin/bodegones/productos")
      }
    } catch (error) {
      console.error("Error saving bodegon product:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el producto")
    }
  }

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
              onClick={() => router.push("/admin/bodegones/productos")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Agregar' : 'Editar'} Producto de Bodegón
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
                    placeholder="Ej: Salsa de Tomate Premium"
                    className={validationErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-600">El nombre del producto es requerido</p>
                  )}
                </div>

                {/* SKU and Barcode */}
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del producto de bodegón"
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
                    />
                  </div>
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        bodegonCategoriesLoading
                          ? "Cargando categorías..." 
                          : "Seleccionar una categoría"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {bodegonCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
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
                          bodegonSubcategoriesLoading
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

            {/* Availability Section */}
            <Card className={validationErrors.bodegones ? "border-red-500" : ""}>
              <CardHeader>
                <CardTitle className={validationErrors.bodegones ? "text-red-600" : ""}>Disponibilidad en Bodegones *</CardTitle>
                <p className={`text-sm ${validationErrors.bodegones ? "text-red-600" : "text-muted-foreground"}`}>
                  Selecciona en qué bodegones estará disponible este producto
                </p>
                {bodegones.length > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="select-all-bodegones"
                      checked={areAllBodegonesSelected}
                      onCheckedChange={(checked) => handleSelectAllBodegones(checked === true)}
                    />
                    <label
                      htmlFor="select-all-bodegones"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Seleccionar todo
                    </label>
                  </div>
                )}
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
                {validationErrors.bodegones && (
                  <p className="text-sm text-red-600 mt-2">Debe seleccionar al menos un bodegón donde el producto estará disponible</p>
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
                    Establece el estado del producto de bodegón.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 flex items-center gap-3">
        {mode === 'edit' && product && (
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={handleDeleteProduct}
            disabled={creatingProduct || uploadingImages}
            className="shadow-lg rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
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

      {/* Category Creation Modal */}
      <AddCategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        onSuccess={() => {
          setShowCategoryModal(false)
        }}
        categoryType="bodegon"
      />

      {/* Subcategory Creation Modal */}
      <AddSubcategoryModal
        open={showSubcategoryModal}
        onOpenChange={setShowSubcategoryModal}
        onSuccess={() => {
          setShowSubcategoryModal(false)
        }}
        subcategoryType="bodegon"
      />

      {/* Delete Product Modal */}
      {mode === 'edit' && product && (
        <DeleteBodegonProductModal 
          open={showDeleteModal} 
          onOpenChange={setShowDeleteModal}
          product={product}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}