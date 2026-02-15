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
        dealProducts: {
          include: {
            deal: {
              include: { user: { select: { name: true } } },
            },
          },
          where: { deal: { status: 'PUBLISHED' } },
        },
      },
    });

    if (!product) return null;

    // Transform specs from ProductSpec[] to Spec[]
    return {
      ...product,
      features: this.normalizeFeatures(product.features),
      specs: product.specs.map((ps: any) => ps.spec),
      deals: (product as any).dealProducts.map((dp: any) => ({
        id: dp.deal.id,
        title: dp.deal.title,
        price: dp.deal.price ? Number(dp.deal.price) : null,
        currency: dp.deal.currency,
        condition: dp.deal.condition,
        sellerName: dp.deal.user?.name,
      })),
    };
  }

  private normalizeFeatures(features: any): string[] {
    if (!features || !Array.isArray(features)) return [];
    return features.map((f: any) =>
      typeof f === 'string' ? f : (f.value || `${f.label}: ${f.value}`),
    );
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
          dealProducts: {
            include: {
              deal: {
                include: { user: { select: { name: true } } },
              },
            },
            where: { deal: { status: 'PUBLISHED' } },
          },
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

    // Transform specs and deals from relations
    const transformedProducts = products.map((p: any) => ({
      ...p,
      features: this.normalizeFeatures(p.features),
      specs: p.specs.map((ps: any) => ps.spec),
      deals: (p.dealProducts || []).map((dp: any) => ({
        id: dp.deal.id,
        title: dp.deal.title,
        price: dp.deal.price ? Number(dp.deal.price) : null,
        currency: dp.deal.currency,
        condition: dp.deal.condition,
        sellerName: dp.deal.user?.name,
      })),
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
      features: any;
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

  async importFromJson(json: string): Promise<{ imported: number; failed: number; errors: string[] }> {
    let items: any[];
    try {
      items = JSON.parse(json);
    } catch {
      return { imported: 0, failed: 0, errors: ['Invalid JSON'] };
    }

    if (!Array.isArray(items)) {
      return { imported: 0, failed: 0, errors: ['JSON must be an array'] };
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Find or create brand
        let brandId: number | null = null;
        if (item.manufacturer_name) {
          const brand = await prisma.brand.upsert({
            where: { name: item.manufacturer_name },
            update: {},
            create: { name: item.manufacturer_name },
          });
          brandId = brand.id;
        }

        // Find category by name (case-insensitive match on key or name)
        let categoryId: number | null = null;
        if (item.category_name) {
          const category = await prisma.category.findFirst({
            where: {
              OR: [
                { key: { equals: item.category_name, mode: 'insensitive' } },
                { name: { equals: item.category_name, mode: 'insensitive' } },
              ],
            },
          });
          if (category) {
            categoryId = category.id;
          }
        }

        // If no category found, use a default or skip
        if (!categoryId) {
          // Try to find or create a generic category
          const defaultCat = await prisma.category.findFirst({
            where: { key: 'uncategorized' },
          });
          if (defaultCat) {
            categoryId = defaultCat.id;
          } else {
            const created = await prisma.category.create({
              data: { name: 'Uncategorized', key: 'uncategorized', description: 'Imported products without a category' },
            });
            categoryId = created.id;
          }
        }

        // Build features as string[] from the JSON structure
        const features: string[] = [];
        if (item.features && Array.isArray(item.features)) {
          for (const group of item.features) {
            if (Array.isArray(group.items)) {
              for (const val of group.items) {
                features.push(val);
              }
            } else if (typeof group === 'string') {
              features.push(group);
            }
          }
        }

        // Create product in draft status
        const product = await prisma.product.create({
          data: {
            name: item.name,
            categoryId,
            brandId,
            description: item.description || null,
            images: item.images || [],
            features: features.length > 0 ? features : undefined,
            status: 'draft',
          },
        });

        // Create shop entry
        if (item.url && item.shop) {
          await prisma.shop.create({
            data: {
              productId: product.id,
              name: item.shop,
              url: item.url,
              price: item.price ?? null,
              currency: item.currency || 'USD',
              available: item.available ?? true,
            },
          });
        }

        // Create specs
        if (item.specs && Array.isArray(item.specs)) {
          for (const specItem of item.specs) {
            if (!specItem.type || !specItem.value) continue;

            // Find or create spec type
            const specType = await prisma.specType.upsert({
              where: { key: specItem.type },
              update: {},
              create: { key: specItem.type, label: specItem.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) },
            });

            // Find or create spec value
            let spec = await prisma.spec.findFirst({
              where: { specTypeId: specType.id, value: specItem.value },
            });
            if (!spec) {
              spec = await prisma.spec.create({
                data: { specTypeId: specType.id, value: specItem.value },
              });
            }

            // Link to product
            await prisma.productSpec.create({
              data: { productId: product.id, specId: spec.id },
            }).catch(() => {}); // ignore duplicate
          }
        }

        imported++;
      } catch (e: any) {
        failed++;
        errors.push(`${item.name || 'Unknown'}: ${e.message}`);
      }
    }

    return { imported, failed, errors };
  }
}
