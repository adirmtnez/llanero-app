"use client"

import { useState } from "react"
import { ImageUploadResult } from "@/types/products"
import { uploadFileToStorage } from "@/lib/storage"

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

  // Subir una imagen usando Supabase Storage
  const uploadImage = async (file: File, folder: string = 'general'): Promise<ImageUploadResult> => {
    try {
      setUploading(true)
      setError(null)

      // Validar archivo
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Usar la función real de Supabase Storage
      const fileName = generateFileName(file.name)
      const result = await uploadFileToStorage(file, folder, fileName.split('.')[0])

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.url) {
        throw new Error('No se pudo obtener la URL de la imagen')
      }

      return {
        url: result.url,
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

  // Eliminar imagen usando Supabase Storage
  const deleteImage = async (filePath: string): Promise<boolean> => {
    try {
      setUploading(true)
      setError(null)

      // Usar la función real de Supabase Storage para eliminar
      const { deleteFileFromStorage } = await import('@/lib/storage')
      const result = await deleteFileFromStorage(filePath)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.success
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

  // Obtener URL pública de una imagen
  const getPublicUrl = (filePath: string): string => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'adminapp'
      
      if (!supabaseUrl) {
        console.error('Supabase URL not configured')
        return ''
      }
      
      const projectId = supabaseUrl.split('//')[1].split('.')[0]
      return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${filePath}`
    } catch (err) {
      console.error('Error getting public URL:', err)
      return ''
    }
  }

  // Extraer path del archivo desde una URL completa
  const extractPathFromUrl = (url: string): string => {
    try {
      // Extraer el path desde una URL de Supabase Storage
      const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'adminapp'
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // El formato es: /storage/v1/object/public/{bucket}/{path}
      const publicPrefix = `/storage/v1/object/public/${bucket}/`
      if (pathname.startsWith(publicPrefix)) {
        return pathname.substring(publicPrefix.length)
      }
      
      return ''
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