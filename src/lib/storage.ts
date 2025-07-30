import { supabase } from "./supabase"

/**
 * Generate a simple unique ID using timestamp and random number
 */
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const randomNum = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomNum}`
}

/**
 * Upload a file to Supabase Storage bucket 'adminapp'
 * @param file - The file to upload
 * @param folder - Folder within the bucket (e.g., 'bodegons', 'restaurants')
 * @param filename - Custom filename (optional, will generate UUID if not provided)
 * @returns Promise<{url: string, error?: string}>
 */
export async function uploadFileToStorage(
  file: File,
  folder: string,
  filename?: string
): Promise<{ url: string | null; error?: string }> {
  console.log('🔧 Starting file upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    folder, 
    customFilename: filename 
  })

  try {
    if (!supabase) {
      console.error('❌ Supabase client not configured')
      return { url: null, error: "Supabase no está configurado" }
    }

    // Validate file
    if (!file || file.size === 0) {
      return { url: null, error: "Archivo inválido o vacío" }
    }

    // Generate filename if not provided
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = filename || `file-${generateUniqueId()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    console.log('📁 Upload path:', filePath)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('adminapp')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      
      // Check if it's a storage policy error
      if (error.message.includes('row-level security policy') || error.message.includes('policy')) {
        return { 
          url: null, 
          error: `Políticas de Storage no configuradas: ${error.message}` 
        }
      }
      
      // Check if it's a bucket error
      if (error.message.includes('bucket')) {
        return { 
          url: null, 
          error: `Error de bucket: ${error.message}` 
        }
      }
      
      return { url: null, error: error.message }
    }

    console.log('✅ File uploaded successfully:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('adminapp')
      .getPublicUrl(filePath)

    console.log('🔗 Public URL generated:', urlData.publicUrl)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    console.error('💥 Unexpected error in uploadFileToStorage:', error)
    return { url: null, error: `Error inesperado: ${error.message}` }
  }
}

/**
 * Delete a file from Supabase Storage bucket 'adminapp'
 * @param filePath - Full path to the file in storage
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function deleteFileFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado" }
    }

    // Extract the path without the base URL
    const pathOnly = filePath.replace(/.*\/adminapp\//, '')

    const { error } = await supabase.storage
      .from('adminapp')
      .remove([pathOnly])

    if (error) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteFileFromStorage:', error)
    return { success: false, error: error.message || 'Error desconocido al eliminar archivo' }
  }
}

/**
 * Upload logo for a bodegon
 * @param file - Logo file
 * @param bodegonId - ID of the bodegon
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadBodegonLogo(file: File, bodegonId: string) {
  return uploadFileToStorage(file, 'bodegons/logos', `bodegon-${bodegonId}-logo`)
}

/**
 * Upload logo for a restaurant
 * @param file - Logo file
 * @param restaurantId - ID of the restaurant
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadRestaurantLogo(file: File, restaurantId: string) {
  return uploadFileToStorage(file, 'restaurants/logos', `restaurant-${restaurantId}-logo`)
}

/**
 * Upload cover image for a restaurant
 * @param file - Cover image file
 * @param restaurantId - ID of the restaurant
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadRestaurantCover(file: File, restaurantId: string) {
  return uploadFileToStorage(file, 'restaurants/covers', `restaurant-${restaurantId}-cover`)
}