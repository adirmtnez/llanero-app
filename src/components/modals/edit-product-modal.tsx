"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Upload, X, ArrowLeft, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  sku: string
  status: string
  inventory: string
  category: string
  price: string
  measurements?: string
  description?: string
  barcode?: string
  comparePrice?: string
  quantity?: string
  costPerItem?: string
  profit?: string
  margin?: string
  storeName?: string
}

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

export function EditProductModal({ open, onOpenChange, product }: EditProductModalProps) {
  const [productType, setProductType] = useState("store-product")
  const [name, setName] = useState("")
  const [measurements, setMeasurements] = useState("")
  const [description, setDescription] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [price, setPrice] = useState("")
  const [comparePrice, setComparePrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [costPerItem, setCostPerItem] = useState("")
  const [profit, setProfit] = useState("")
  const [margin, setMargin] = useState("")
  const [storeName, setStoreName] = useState("")
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    if (product && open) {
      setName(product.name)
      setSku(product.sku)
      setPrice(product.price.replace('$', ''))
      setMeasurements(product.measurements || "")
      setDescription(product.description || "")
      setBarcode(product.barcode || "")
      setComparePrice(product.comparePrice || "")
      setQuantity(product.quantity || "")
      setCostPerItem(product.costPerItem || "")
      setProfit(product.profit || "")
      setMargin(product.margin || "")
      setStoreName(product.storeName || "")
      setImages([])
    }
  }, [product, open])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages].slice(0, 4))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Updated product data:", {
      id: product?.id,
      productType,
      name,
      measurements,
      description,
      sku,
      barcode,
      price,
      comparePrice,
      quantity,
      costPerItem,
      profit,
      margin,
      storeName,
      images
    })
    onOpenChange(false)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 pb-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-lg font-semibold">Editar Producto</DialogTitle>
          <div className="ml-auto">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Check className="h-3 w-3 mr-1" />
              Editando
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Type */}
              <div className="space-y-2">
                <Label htmlFor="productType">Tipo de Producto</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Producto de Tiendas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store-product">Producto de Tiendas</SelectItem>
                    <SelectItem value="restaurant-product">Producto de Restaurante</SelectItem>
                    <SelectItem value="service">Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  <div className="grid grid-cols-4 gap-2 mt-4">
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

              {/* Price Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Precio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="rounded-l-none"
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
                          value={comparePrice}
                          onChange={(e) => setComparePrice(e.target.value)}
                          placeholder="0.00"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPerItem">Costo por ítem</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="costPerItem"
                          type="number"
                          step="0.01"
                          value={costPerItem}
                          onChange={(e) => setCostPerItem(e.target.value)}
                          placeholder="0.00"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profit">Ganancia</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                          USD
                        </span>
                        <Input
                          id="profit"
                          type="number"
                          step="0.01"
                          value={profit}
                          onChange={(e) => setProfit(e.target.value)}
                          placeholder="0.00"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margin">Margen</Label>
                      <div className="flex">
                        <Input
                          id="margin"
                          type="number"
                          step="0.01"
                          value={margin}
                          onChange={(e) => setMargin(e.target.value)}
                          placeholder="0"
                          className="rounded-r-none"
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
                </CardContent>
              </Card>

              {/* Availability Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store name</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" className="min-w-[120px]">
              Actualizar producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}