import { FormattedPrice } from "@/types/products"

/**
 * Formatea un precio numérico al formato colombiano: $1.250,00
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

/**
 * Parsea un string de precio formateado y devuelve el número
 * Ejemplo: "$1.250,00" -> 1250
 */
export function parsePrice(formattedPrice: string): number {
  // Remover símbolos de moneda y espacios
  const cleanPrice = formattedPrice
    .replace(/[$\s]/g, '')
    .replace(/\./g, '') // Remover separadores de miles
    .replace(',', '.') // Convertir coma decimal a punto
  
  return parseFloat(cleanPrice) || 0
}

/**
 * Valida si un string representa un precio válido
 */
export function isValidPrice(priceString: string): boolean {
  const parsed = parsePrice(priceString)
  return !isNaN(parsed) && parsed >= 0
}

/**
 * Formatea precio con información adicional
 */
export function formatPriceWithInfo(price: number): FormattedPrice {
  return {
    raw: price,
    formatted: formatPrice(price)
  }
}

/**
 * Formatea input de precio mientras el usuario escribe
 * Mantiene el cursor en la posición correcta
 */
export function formatPriceInput(value: string): string {
  // Remover todo excepto números y comas
  const numbers = value.replace(/[^\d,]/g, '')
  
  // Si está vacío, devolver vacío
  if (!numbers) return ''
  
  // Separar parte entera y decimal
  const parts = numbers.split(',')
  let integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Formatear parte entera con separadores de miles
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  
  // Reconstruir el número
  let result = integerPart
  if (decimalPart !== undefined) {
    result += ',' + decimalPart.slice(0, 2) // Máximo 2 decimales
  }
  
  return result
}

/**
 * Convierte input formateado a número para enviar al backend
 */
export function inputToNumber(input: string): number {
  if (!input) return 0
  
  // Remover puntos (separadores de miles) y convertir coma a punto decimal
  const normalized = input
    .replace(/\./g, '')
    .replace(',', '.')
  
  return parseFloat(normalized) || 0
}

/**
 * Convierte número a formato de input para mostrar en formularios
 */
export function numberToInput(num: number): string {
  if (num === 0) return ''
  
  return num.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/\s/g, '') // Remover espacios si los hay
}