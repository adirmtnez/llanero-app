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
import { Upload, X, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useDemoMode } from "@/contexts/demo-mode-context"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useBodegones } from "@/hooks/use-bodegones"

const demoProducts = [
  {
    id: "1",
    name: "Hamburguesa Clásica",
    sku: "HAMBUR-001",
    status: "Active",
    inventory: "25 in stock",
    category: "Hamburguesas",
    price: "$8.99",
    measurements: "200g",
    description: "Deliciosa hamburguesa clásica con carne de res, lechuga, tomate y cebolla",
    barcode: "123456789012",
    comparePrice: "6.50",
    quantity: "25",
    costPerItem: "4.50",
    profit: "4.49",
    margin: "50",
    storeName: "Store Principal"
  },
  {
    id: "2", 
    name: "Pizza Margarita",
    sku: "PIZZA-002",
    status: "Active",
    inventory: "12 in stock",
    category: "Pizzas",
    price: "$12.50",
    measurements: "12 pulgadas",
    description: "Pizza tradicional italiana con salsa de tomate, mozzarella y albahaca fresca",
    barcode: "123456789013",
    comparePrice: "8.00",
    quantity: "12",
    costPerItem: "5.00",
    profit: "7.50",
    margin: "60",
    storeName: "Store Principal"
  }
]

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { isDemoMode } = useDemoMode()
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { bodegones, loading: bodegonesLoading } = useBodegones()
  const productId = params.id as string

  const [productType, setProductType] = useState("bodegon-product")
  const [selectedRestaurant, setSelectedRestaurant] = useState("")
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

  useEffect(() => {
    // Initialize bodegon availability when bodegones are loaded
    if (bodegones.length > 0) {
      initializeBodegonAvailability()
    }
  }, [bodegones, initializeBodegonAvailability])

  useEffect(() => {
    // Load product data based on ID
    if (isDemoMode && productId) {
      const product = demoProducts.find(p => p.id === productId)
      if (product) {
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
        
        // Set product type based on existing data (default to bodegon for demo)
        setProductType("bodegon-product")
      }
    }
  }, [isDemoMode, productId])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages].slice(0, 6))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Updated product data:", {
      id: productId,
      productType,
      selectedRestaurant: productType === "restaurant-product" ? selectedRestaurant : null,
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
      bodegonAvailability: productType === "bodegon-product" ? bodegonAvailability : null,
      images
    })
    // Redirect back to products page
    router.push("/admin/productos")
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

      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:pt-0 max-w-[1080px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Editar Producto</h1>
          </div>
        </div>

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
            <Button type="submit" className="min-w-[120px]">
              Actualizar producto
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}