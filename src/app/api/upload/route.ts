import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary once per lambda
const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // If Cloudinary is configured, always use it (works locally + on Vercel)
    if (hasCloudinaryConfig) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'merokitab-books',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result as any)
          }
        )

        stream.end(buffer)
      })

      return NextResponse.json({ success: true, imageUrl: uploadResult.secure_url })
    }

    // If running on Vercel without Cloudinary configured, fail fast with a clear message.
    if (process.env.VERCEL === '1') {
      return NextResponse.json(
        {
          error:
            'Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel environment variables.',
        },
        { status: 500 }
      )
    }

    // Fallback: local disk (only for local dev)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${randomStr}.${extension}`

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Failed to upload image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
