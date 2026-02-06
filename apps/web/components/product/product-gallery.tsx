'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  defaultImage?: string
}

export function ProductGallery({
  images,
  defaultImage = 'https://placehold.co/400x300/475569/white?text=Image',
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const productImages = images && images.length > 0 ? images : [defaultImage]

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={productImages[selectedImageIndex]}
          alt="Main product image"
          fill
          className="object-cover"
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
                  ? 'border-slate-600 ring-2 ring-slate-300'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
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
