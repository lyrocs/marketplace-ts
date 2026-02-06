import { Injectable } from '@nestjs/common'
import { prisma } from '@nextrade/database'

@Injectable()
export class ProductsService {
  async findById(id: number): Promise<any> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        specs: { include: { spec: { include: { specType: true } } } },
        shops: true,
      },
    })
  }

  async search({
    name,
    categoryId,
    brandId,
    specIds,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  }: {
    name?: string
    categoryId?: number
    brandId?: number
    specIds?: number[]
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }): Promise<any> {
    const where: any = {}

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    if (brandId) {
      where.brandId = brandId
    }
    if (specIds && specIds.length > 0) {
      where.specs = {
        some: {
          specId: { in: specIds },
        },
      }
    }

    // Price filtering through shops
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.shops = {
        some: {
          AND: [
            minPrice !== undefined ? { price: { gte: minPrice } } : {},
            maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
          ],
        },
      }
    }

    // Determine sort order
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'price') {
      // For price sorting, we'll do it in-memory after fetching
      orderBy.createdAt = 'desc'
    } else {
      orderBy.createdAt = sortOrder
    }

    let [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          specs: { include: { spec: { include: { specType: true } } } },
          shops: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ])

    // Sort by price if requested (in-memory)
    if (sortBy === 'price') {
      products = products.sort((a, b) => {
        const priceA = a.shops.filter((s: any) => s.available && s.price).map((s: any) => s.price)[0] || 0
        const priceB = b.shops.filter((s: any) => s.available && s.price).map((s: any) => s.price)[0] || 0
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      })
    }

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    }
  }

  async create(data: {
    name: string
    categoryId: number
    brandId?: number
    images?: string[]
    description?: string
    status: string
  }): Promise<any> {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        images: data.images || [],
        description: data.description || null,
        status: data.status,
      },
      include: { category: true, brand: true },
    })
  }

  async update(id: number, data: Partial<{
    name: string
    categoryId: number
    brandId: number | null
    images: string[]
    description: string
    status: string
  }>): Promise<any> {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true, brand: true },
    })
  }

  async delete(id: number): Promise<any> {
    return prisma.product.delete({ where: { id } })
  }

  async addSpec(productId: number, specId: number): Promise<any> {
    return prisma.productSpec.create({
      data: { productId, specId },
    })
  }

  async removeSpec(productId: number, specId: number): Promise<any> {
    return prisma.productSpec.delete({
      where: { productId_specId: { productId, specId } },
    })
  }
}
