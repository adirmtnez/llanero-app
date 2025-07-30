"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Trash2
} from "lucide-react"

import { useCategories } from "@/hooks/use-categories"
import { useBodegonProducts } from "@/hooks/use-bodegon-products"
import { useProductImages } from "@/hooks/use-product-images"
import { 
  BodegonProduct, 
  CreateBodegonProductData, 
  UpdateBodegonProductData 
} from "@/types/products"
import { formatPriceInput, inputToNumber, numberToInput } from "@/utils/price-formatter"

interface ProductFormProps {
  product?: BodegonProduct
  onSuccess?: (product: BodegonProduct) => void
  onCancel?: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!product

  // Estados del formulario
  const [formData, setFormData] = useState<CreateBodegonProductData>({
    name: '',
    description: '',
    image_gallery_urls: [],
    bar_code: '',
    sku: '',
    category_id: '',
    subcategory_id: '',
    price: 0,
    purchase_price: 0,
    quantity_in_pack: 1,
    is_active_product: true,
    is_discount: false,
    is_promo: false
  })

  const [priceInput, setPriceInput] = useState('')
  const [purchasePriceInput, setPurchasePriceInput] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const { categories, subcategories, loading: categoriesLoading, loadSubcategories } = useCategories('bodegon')
  const { createProduct, updateProduct, validateUniqueSKU, validateUniqueBarCode, error: productError } = useBodegonProducts()
  const { uploadMultipleImages, deleteMultipleImages, extractPathFromUrl, uploading: imageUploading } = useProductImages()

  // Inicializar formulario si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        image_gallery_urls: product.image_gallery_urls || [],
        bar_code: product.bar_code || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        price: product.price,
        purchase_price: product.purchase_price || 0,
        quantity_in_pack: product.quantity_in_pack,
        is_active_product: product.is_active_product ?? true,
        is_discount: product.is_discount ?? false,
        is_promo: product.is_promo ?? false
      })

      setPriceInput(numberToInput(product.price))
      setPurchasePriceInput(numberToInput(product.purchase_price || 0))
      setImagePreviewUrls(product.image_gallery_urls || [])

      // Cargar subcategorías si hay categoría seleccionada
      if (product.category_id) {
        loadSubcategories(product.category_id)
      }
    }
  }, [product, loadSubcategories])

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      subcategory_id: '' // Reset subcategory when category changes
    }))
    
    if (categoryId) {
      loadSubcategories(categoryId)
    }
  }

  // Manejar cambio de precio
  const handlePriceChange = (value: string, field: 'price' | 'purchase_price') => {
    const formatted = formatPriceInput(value)
    const numericValue = inputToNumber(formatted)

    if (field === 'price') {
      setPriceInput(formatted)
      setFormData(prev => ({ ...prev, price: numericValue }))
    } else {
      setPurchasePriceInput(formatted)
      setFormData(prev => ({ ...prev, purchase_price: numericValue }))
    }
  }

  // Manejar selección de imágenes
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    // Validar que no excedan el límite total de imágenes
    const totalImages = imagePreviewUrls.length + files.length
    if (totalImages > 5) {
      setValidationErrors(prev => ({
        ...prev,
        images: 'Máximo 5 imágenes permitidas'
      }))
      return
    }

    setSelectedImages(prev => [...prev, ...files])

    // Crear previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Limpiar error de imágenes
    setValidationErrors(prev => {
      const { images, ...rest } = prev
      return rest
    })
  }

  // Remover imagen
  const removeImage = (index: number) => {
    const isNewImage = index >= (formData.image_gallery_urls?.length || 0)
    
    if (isNewImage) {
      // Es una imagen nueva, remover del array de archivos seleccionados
      const newImageIndex = index - (formData.image_gallery_urls?.length || 0)
      setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex))
    }
    
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
    
    if (!isNewImage) {
      // Es una imagen existente, marcarla para eliminación
      setFormData(prev => ({
        ...prev,
        image_gallery_urls: prev.image_gallery_urls?.filter((_, i) => i !== index) || []
      }))
    }
  }

  // Validar formulario
  const validateForm = async (): Promise<boolean> => {
    const errors: Record<string, string> = {}

    // Validaciones básicas
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    }

    if (formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0'
    }

    if (formData.quantity_in_pack <= 0) {
      errors.quantity_in_pack = 'La cantidad por paquete debe ser mayor a 0'
    }

    // Validar unicidad de SKU
    if (formData.sku && formData.sku.trim()) {
      const isSkuUnique = await validateUniqueSKU(
        formData.sku.trim(), 
        isEditing ? product!.id : undefined
      )
      if (!isSkuUnique) {
        errors.sku = 'Este SKU ya existe en el sistema'
      }
    }

    // Validar unicidad de código de barras
    if (formData.bar_code && formData.bar_code.trim()) {
      const isBarCodeUnique = await validateUniqueBarCode(
        formData.bar_code.trim(),
        isEditing ? product!.id : undefined
      )
      if (!isBarCodeUnique) {
        errors.bar_code = 'Este código de barras ya existe en el sistema'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Validar formulario
      const isValid = await validateForm()
      if (!isValid) return

      let finalImageUrls = [...(formData.image_gallery_urls || [])]

      // Subir nuevas imágenes si hay
      if (selectedImages.length > 0) {
        const uploadResults = await uploadMultipleImages(selectedImages, 'products')
        const successfulUploads = uploadResults.filter(result => !result.error)
        const newUrls = successfulUploads.map(result => result.url)
        finalImageUrls = [...finalImageUrls, ...newUrls]
      }

      const productData = {
        ...formData,
        image_gallery_urls: finalImageUrls,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        sku: formData.sku?.trim() || undefined,
        bar_code: formData.bar_code?.trim() || undefined
      }

      let result: BodegonProduct | null = null

      if (isEditing) {
        result = await updateProduct({
          id: product!.id,
          ...productData
        } as UpdateBodegonProductData)
      } else {
        result = await createProduct(productData)
      }

      if (result) {
        onSuccess?.(result)
      }

    } catch (error: any) {
      console.error('Error submitting form:', error)
      setValidationErrors(prev => ({
        ...prev,
        general: error.message || 'Error al guardar el producto'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Modifica la información del producto de bodegón'
            : 'Completa la información para crear un nuevo producto de bodegón'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error general */}
          {(validationErrors.general || productError) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.general || productError}
              </AlertDescription>
            </Alert>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Manzana Roja Premium"
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity_in_pack">Cantidad por Paquete *</Label>
                <Input
                  id="quantity_in_pack"
                  type="number"
                  min="1"
                  value={formData.quantity_in_pack}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity_in_pack: parseInt(e.target.value) || 1 
                  }))}
                  className={validationErrors.quantity_in_pack ? 'border-red-500' : ''}
                />
                {validationErrors.quantity_in_pack && (
                  <p className="text-sm text-red-500">{validationErrors.quantity_in_pack}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada del producto..."
                rows={3}
              />
            </div>
          </div>

          {/* Categorización */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Categorización</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoría</Label>
                <Select 
                  value={formData.subcategory_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
                  disabled={!formData.category_id || subcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Códigos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Códigos e Identificación</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Ej: MZN-RJA-001"
                  className={validationErrors.sku ? 'border-red-500' : ''}
                />
                {validationErrors.sku && (
                  <p className="text-sm text-red-500">{validationErrors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bar_code">Código de Barras</Label>
                <Input
                  id="bar_code"
                  value={formData.bar_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, bar_code: e.target.value }))}
                  placeholder="Ej: 1234567890123"
                  className={validationErrors.bar_code ? 'border-red-500' : ''}
                />
                {validationErrors.bar_code && (
                  <p className="text-sm text-red-500">{validationErrors.bar_code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Precios</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio de Venta *</Label>
                <Input
                  id="price"
                  value={priceInput}
                  onChange={(e) => handlePriceChange(e.target.value, 'price')}
                  placeholder="0,00"
                  className={validationErrors.price ? 'border-red-500' : ''}
                />
                {validationErrors.price && (
                  <p className="text-sm text-red-500">{validationErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">Precio de Compra</Label>
                <Input
                  id="purchase_price"
                  value={purchasePriceInput}
                  onChange={(e) => handlePriceChange(e.target.value, 'purchase_price')}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Imágenes del Producto</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="images" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <Upload className="h-4 w-4" />
                    Subir Imágenes
                  </div>
                </Label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">
                  Máximo 5 imágenes (JPEG, PNG, WebP)
                </span>
              </div>

              {validationErrors.images && (
                <p className="text-sm text-red-500">{validationErrors.images}</p>
              )}

              {/* Preview de imágenes */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estados */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estados del Producto</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Producto Activo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active_product}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_active_product: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_discount">En Descuento</Label>
                <Switch
                  id="is_discount"
                  checked={formData.is_discount}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_discount: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_promo">En Promoción</Label>
                <Switch
                  id="is_promo"
                  checked={formData.is_promo}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_promo: checked 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting || imageUploading || categoriesLoading}
              className="sm:w-auto w-full"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting 
                ? (isEditing ? 'Actualizando...' : 'Creando...')
                : (isEditing ? 'Actualizar Producto' : 'Crear Producto')
              }
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="sm:w-auto w-full"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}