import { Injectable } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class ProductsService {
  async findById(id: number): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        specs: { include: { spec: { include: { specType: true } } } },
        shops: true,
      },
    });

    if (!product) return null;

    // Transform specs from ProductSpec[] to Spec[]
    return {
      ...product,
      specs: product.specs.map((ps: any) => ps.spec),
    };
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
    name?: string;
    categoryId?: number;
    brandId?: number;
    specIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (brandId) {
      where.brandId = brandId;
    }
    if (specIds && specIds.length > 0) {
      where.specs = {
        some: {
          specId: { in: specIds },
        },
      };
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
      };
    }

    // Determine sort order
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'price') {
      // For price sorting, we'll do it in-memory after fetching
      orderBy.createdAt = 'desc';
    } else {
      orderBy.createdAt = sortOrder;
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
    ]);

    // Sort by price if requested (in-memory)
    if (sortBy === 'price') {
      products = products.sort((a, b) => {
        const priceA =
          a.shops
            .filter((s: any) => s.available && s.price)
            .map((s: any) => s.price)[0] || 0;
        const priceB =
          b.shops
            .filter((s: any) => s.available && s.price)
            .map((s: any) => s.price)[0] || 0;
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Transform specs from ProductSpec[] to Spec[]
    const transformedProducts = products.map((p: any) => ({
      ...p,
      specs: p.specs.map((ps: any) => ps.spec),
    }));

    return {
      data: transformedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async create(data: {
    name: string;
    categoryId: number;
    brandId?: number;
    images?: string[];
    description?: string;
    status: string;
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
    });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      categoryId: number;
      brandId: number | null;
      images: string[];
      description: string;
      status: string;
    }>,
  ): Promise<any> {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true, brand: true },
    });
  }

  async delete(id: number): Promise<any> {
    return prisma.product.delete({ where: { id } });
  }

  async addSpec(productId: number, specId: number): Promise<any> {
    await prisma.productSpec.create({
      data: { productId, specId },
    });
    return this.findById(productId);
  }

  async removeSpec(productId: number, specId: number): Promise<any> {
    await prisma.productSpec.delete({
      where: { productId_specId: { productId, specId } },
    });
    return this.findById(productId);
  }

  async updateSpecs(productId: number, specIds: number[]): Promise<any> {
    // Delete all existing specs for this product
    await prisma.productSpec.deleteMany({
      where: { productId },
    });

    // Create new specs
    if (specIds.length > 0) {
      await prisma.productSpec.createMany({
        data: specIds.map((specId) => ({ productId, specId })),
      });
    }

    return this.findById(productId);
  }

  async addImage(productId: number, imageUrl: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    const images = Array.isArray(product.images) ? product.images : [];
    const updatedImages = [...images, imageUrl];

    await prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    });

    return this.findById(productId);
  }

  async deleteImage(productId: number, imageUrl: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    const images = Array.isArray(product.images) ? product.images : [];
    const updatedImages = images.filter((img: any) => img !== imageUrl);

    await prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    });

    return this.findById(productId);
  }
}
