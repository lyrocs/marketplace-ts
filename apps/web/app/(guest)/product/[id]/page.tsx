'use client'

import { useQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import { PRODUCT_QUERY, CATEGORIES_QUERY } from '@/graphql/queries'
import { ProductGallery } from '@/components/product/product-gallery'
import { ShopList } from '@/components/product/shop-list'
import { ProductBreadcrumb } from '@/components/product/product-breadcrumb'
import { ProductSection } from '@/components/product/product-section'
import { Skeleton } from '@nextrade/ui'

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)

  // Fetch product
  const { data: productData, loading: productLoading } = useQuery(PRODUCT_QUERY, {
    variables: { id: productId },
    skip: !productId,
  })

  // Fetch categories for breadcrumb
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)

  const product = productData?.product
  const categories = categoriesData?.categories || []

  // Find parent category for breadcrumb
  const parentCategory = categories.find(
    (cat: any) => cat.id === product?.category?.parentId
  )

  const breadcrumb = product
    ? `${parentCategory?.name || ''} / ${product.category?.name || ''} - ${product.brand?.name || ''}`
    : ''

  if (productLoading) {
    return (
      <main className="container mx-auto bg-slate-100/50 px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12">
          <div className="space-y-8 lg:col-span-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="mt-8 lg:col-span-1 lg:mt-0">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container mx-auto bg-slate-100/50 px-4 py-8 md:py-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Product not found</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto bg-slate-100/50 px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12">
        {/* Left Column - Product Details */}
        <div className="space-y-8 lg:col-span-2">
          <ProductBreadcrumb breadcrumb={breadcrumb} title={product.name} />

          <ProductGallery images={product.images || []} />

          <ProductSection title="Description">
            <p className="mt-4 leading-relaxed text-gray-700">
              {product.description || 'No description available'}
            </p>
          </ProductSection>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <ProductSection title="Specifications">
              <div className="mt-4 grid grid-cols-2 gap-4">
                {product.specs.map((spec: any) => (
                  <div key={spec.id} className="border rounded-lg p-3 bg-white">
                    <dt className="text-sm font-medium text-gray-600">{spec.specType?.label}</dt>
                    <dd className="mt-1 text-base font-semibold text-gray-900">{spec.value}</dd>
                  </div>
                ))}
              </div>
            </ProductSection>
          )}

          {/* Technical Specifications */}
          {product.features && product.features.length > 0 && (
            <ProductSection title="Technical Specifications">
              <div className="mt-6 space-y-6">
                {product.features.map((feature: any) => (
                  <div key={feature.label}>
                    <h3 className="mb-3 border-b pb-2 text-lg font-bold text-gray-800">
                      {feature.label}
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">{feature.label}</dt>
                        <dd className="font-semibold text-gray-800">{feature.value}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </ProductSection>
          )}
        </div>

        {/* Right Column - Shops */}
        <div className="mt-8 lg:col-span-1 lg:mt-0">
          <div className="space-y-6 lg:sticky lg:top-28">
            <ShopList shops={product.shops || []} />
          </div>
        </div>
      </div>
    </main>
  )
}
