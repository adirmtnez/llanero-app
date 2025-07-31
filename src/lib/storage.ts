import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * Generate a simple unique ID using timestamp and random number
 */
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const randomNum = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomNum}`
}

/**
 * Create S3 client for Supabase
 */
function createS3Client() {
  const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  console.log('🔍 S3 Environment Check:', {
    hasAccessKeyId: !!accessKeyId,
    hasSecretAccessKey: !!secretAccessKey,
    region,
    hasSupabaseUrl: !!supabaseUrl,
  })

  if (!accessKeyId || !secretAccessKey || !supabaseUrl) {
    console.error('❌ Missing credentials:', {
      accessKeyId: accessKeyId ? 'Present' : 'Missing',
      secretAccessKey: secretAccessKey ? 'Present' : 'Missing',
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing'
    })
    throw new Error('Missing S3 credentials or Supabase URL')
  }

  // Use the S3 endpoint from your dashboard
  const endpoint = 'https://zykwuzuukrmgztpgnbth.supabase.co/storage/v1/s3'

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint,
    forcePathStyle: true, // Required for Supabase
  })
}

/**
 * Upload a file using AWS S3 SDK directly to Supabase Storage
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
  console.log('🔧 Starting S3 file upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    folder, 
    customFilename: filename 
  })

  try {
    // Create S3 client
    const s3Client = createS3Client()
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'adminapp'

    // Generate filename if not provided
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = filename ? `${filename}.${fileExt}` : `file-${generateUniqueId()}.${fileExt}`
    const key = `${folder}/${fileName}`

    console.log('📁 S3 Upload key:', key)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Prepare upload command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=3600',
    })

    // Upload to S3
    const result = await s3Client.send(command)
    console.log('✅ S3 upload successful:', result)

    // Generate public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectId = supabaseUrl.split('//')[1].split('.')[0]
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${key}`
    
    console.log('🔗 Public URL generated:', publicUrl)
    return { url: publicUrl }

  } catch (error: any) {
    console.error('💥 S3 upload error:', error)
    return { url: null, error: `Error S3: ${error.message}` }
  }
}

/**
 * Delete a file using AWS S3 SDK
 * @param filePath - Full path to the file in storage
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function deleteFileFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create S3 client
    const s3Client = createS3Client()
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'adminapp'

    // Extract the key from the full URL
    const key = filePath.replace(/.*\/public\/[^/]+\//, '')
    console.log('🗑️ Deleting S3 key:', key)

    // Prepare delete command
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    // Delete from S3
    const result = await s3Client.send(command)
    console.log('✅ S3 delete successful:', result)
    
    return { success: true }

  } catch (error: any) {
    console.error('Error in S3 deleteFileFromStorage:', error)
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
  return uploadFileToStorage(file, 'bodegons', `bodegon-${bodegonId}-logo`)
}

/**
 * Upload logo for a restaurant
 * @param file - Logo file
 * @param restaurantId - ID of the restaurant
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadRestaurantLogo(file: File, restaurantId: string) {
  return uploadFileToStorage(file, 'restaurants', `restaurant-${restaurantId}-logo`)
}

/**
 * Upload cover image for a restaurant
 * @param file - Cover image file
 * @param restaurantId - ID of the restaurant
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadRestaurantCover(file: File, restaurantId: string) {
  return uploadFileToStorage(file, 'restaurants', `restaurant-${restaurantId}-cover`)
}

/**
 * Upload product image
 * @param file - Product image file
 * @param productId - ID of the product
 * @param imageIndex - Index of the image (for multiple images)
 * @returns Promise<{url: string, error?: string}>
 */
export function uploadProductImage(file: File, productId: string, imageIndex?: number) {
  const filename = imageIndex !== undefined 
    ? `product-${productId}-${imageIndex}` 
    : `product-${productId}`
  return uploadFileToStorage(file, 'products', filename)
}

/**
 * Upload file to a specific S3 bucket
 * @param file - The file to upload
 * @param folder - Folder within the bucket
 * @param filename - Custom filename
 * @param bucketName - Override the default bucket
 * @returns Promise<{url: string, error?: string}>
 */
export async function uploadToCustomBucket(
  file: File, 
  folder: string, 
  filename: string, 
  bucketName: string
): Promise<{ url: string | null; error?: string }> {
  console.log('🔧 Starting custom bucket S3 file upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    folder, 
    customFilename: filename,
    bucketName 
  })

  try {
    // Create S3 client
    const s3Client = createS3Client()

    // Generate filename if not provided
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = filename ? `${filename}.${fileExt}` : `file-${generateUniqueId()}.${fileExt}`
    const key = `${folder}/${fileName}`

    console.log('📁 S3 Upload key:', key)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Prepare upload command with custom bucket
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=3600',
    })

    // Upload to S3
    const result = await s3Client.send(command)
    console.log('✅ S3 upload successful:', result)

    // Generate public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectId = supabaseUrl.split('//')[1].split('.')[0]
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${key}`
    
    console.log('🔗 Public URL generated:', publicUrl)
    return { url: publicUrl }

  } catch (error: any) {
    console.error('💥 S3 upload error:', error)
    return { url: null, error: `Error S3: ${error.message}` }
  }
}