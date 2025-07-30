"use client"

import { useState } from "react"
import { ImageUploadResult } from "@/types/products"

export function useProductImages() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten archivos JPEG, PNG y WebP'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo no puede ser mayor a 5MB'
    }

    return null
  }

  // Generar nombre único para el archivo
  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  // Subir una imagen (mock implementation)
  const uploadImage = async (file: File, folder: string = 'general'): Promise<ImageUploadResult> => {
    try {
      setUploading(true)
      setError(null)

      // Validar archivo
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock implementation - generate a fake URL
      const fileName = generateFileName(file.name)
      const mockUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(fileName)}`

      return {
        url: mockUrl,
        path: `${folder}/${fileName}`
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      const errorMessage = err.message || 'Error al subir imagen'
      setError(errorMessage)
      return {
        url: '',
        path: '',
        error: errorMessage
      }
    } finally {
      setUploading(false)
    }
  }

  // Subir múltiples imágenes
  const uploadMultipleImages = async (files: File[], folder: string = 'general'): Promise<ImageUploadResult[]> => {
    try {
      setUploading(true)
      setError(null)

      const results: ImageUploadResult[] = []

      for (const file of files) {
        const result = await uploadImage(file, folder)
        results.push(result)
      }

      return results
    } catch (err: any) {
      console.error('Error uploading multiple images:', err)
      setError(err.message || 'Error al subir imágenes')
      return []
    } finally {
      setUploading(false)
    }
  }

  // Eliminar imagen (mock implementation)
  const deleteImage = async (filePath: string): Promise<boolean> => {
    try {
      setUploading(true)
      setError(null)

      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 300))

      return true
    } catch (err: any) {
      console.error('Error deleting image:', err)
      setError(err.message || 'Error al eliminar imagen')
      return false
    } finally {
      setUploading(false)
    }
  }

  // Eliminar múltiples imágenes
  const deleteMultipleImages = async (filePaths: string[]): Promise<boolean> => {
    try {
      setUploading(true)
      setError(null)

      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return true
    } catch (err: any) {
      console.error('Error deleting multiple images:', err)
      setError(err.message || 'Error al eliminar imágenes')
      return false
    } finally {
      setUploading(false)
    }
  }

  // Obtener URL pública de una imagen (mock implementation)
  const getPublicUrl = (filePath: string): string => {
    try {
      // Mock implementation - return placeholder URL
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(filePath)}`
    } catch (err) {
      console.error('Error getting public URL:', err)
      return ''
    }
  }

  // Extraer path del archivo desde una URL completa
  const extractPathFromUrl = (url: string): string => {
    try {
      // Mock implementation - extract from placeholder URL
      const urlObj = new URL(url)
      const textParam = urlObj.searchParams.get('text')
      return textParam || ''
    } catch (err) {
      console.error('Error extracting path from URL:', err)
      return ''
    }
  }

  // Validar si una URL es válida
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (err) {
      return false
    }
  }

  return {
    uploading,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages,
    getPublicUrl,
    extractPathFromUrl,
    isValidImageUrl,
    // Constants
    MAX_FILE_SIZE,
    ALLOWED_TYPES
  }
}