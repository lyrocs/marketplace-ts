'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button, Card } from '@marketplace/ui'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  images: string[]
  onImageAdded: (url: string) => void
  onImageRemoved: (url: string) => void
  maxImages?: number
}

export function ImageUpload({ images, onImageAdded, onImageRemoved, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (images.length >= maxImages) return

    setUploading(true)
    try {
      // Upload via REST endpoint (GraphQL file upload is complex)
      const token = typeof window !== 'undefined' ? localStorage.getItem('marketplace_token') : null
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'deals')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onImageAdded(data.url)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onImageRemoved(url)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Upload className="h-6 w-6" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images uploaded. JPEG, PNG, WebP, GIF up to 10MB each.
      </p>
    </div>
  )
}
