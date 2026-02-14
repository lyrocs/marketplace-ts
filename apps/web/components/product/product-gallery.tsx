'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  defaultImage?: string
}

export function ProductGallery({
  images,
  defaultImage = 'https://placehold.co/400x300/161822/7c8599?text=Image',
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const productImages = images && images.length > 0 ? images : [defaultImage]

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={productImages[selectedImageIndex]}
          alt="Main product image"
          fill
          className="object-cover"
          unoptimized
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>

      {productImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 rounded-lg border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-border'
              }`}
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="80px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
