import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class DealsService {
  async findById(id: number): Promise<any> {
    return prisma.deal.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        products: {
          include: {
            product: {
              include: { category: true, brand: true },
            },
          },
        },
      },
    });
  }

  async findPublished(page = 1, limit = 12): Promise<any> {
    const where = { status: 'PUBLISHED' as const };
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          products: {
            include: {
              product: { include: { category: true, brand: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    return {
      data: deals,
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

  async findRecent(limit = 4): Promise<any> {
    return prisma.deal.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        products: {
          include: {
            product: { include: { category: true, brand: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId: string): Promise<any> {
    return prisma.deal.findMany({
      where: { userId },
      include: {
        products: {
          include: {
            product: { include: { category: true, brand: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search({
    title,
    categoryId,
    specIds,
    page = 1,
    limit = 12,
  }: {
    title?: string;
    categoryId?: number;
    specIds?: number[];
    page?: number;
    limit?: number;
  }): Promise<any> {
    const where: any = { status: 'PUBLISHED' };

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (categoryId || (specIds && specIds.length > 0)) {
      where.products = {
        some: {
          product: {
            ...(categoryId ? { categoryId } : {}),
            ...(specIds && specIds.length > 0
              ? { specs: { some: { specId: { in: specIds } } } }
              : {}),
          },
        },
      };
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          products: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                  specs: { include: { spec: { include: { specType: true } } } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    return {
      data: deals,
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

  async createDraft(userId: string): Promise<any> {
    // Reuse existing empty draft if present
    const existingDraft = await prisma.deal.findFirst({
      where: {
        userId,
        status: 'DRAFT',
        products: { none: {} },
      },
      include: { products: true },
    });

    if (existingDraft) return existingDraft;

    return prisma.deal.create({
      data: { userId, status: 'DRAFT' },
      include: { products: true },
    });
  }

  async update(
    id: number,
    data: {
      title?: string;
      description?: string;
      location?: string;
      currency?: string;
      price?: number;
      invoiceAvailable?: boolean;
      sellingReason?: string;
      canBeDelivered?: boolean;
      features?: { label: string; value: string }[];
      condition?: string;
      products?: { productId: number; quantity: number }[];
    },
  ): Promise<any> {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');

    const { products, ...dealData } = data;

    await prisma.deal.update({
      where: { id },
      data: {
        ...(dealData.title !== undefined && { title: dealData.title }),
        ...(dealData.description !== undefined && {
          description: dealData.description,
        }),
        ...(dealData.location !== undefined && { location: dealData.location }),
        ...(dealData.currency !== undefined && { currency: dealData.currency }),
        ...(dealData.price !== undefined && { price: dealData.price }),
        ...(dealData.invoiceAvailable !== undefined && {
          invoiceAvailable: dealData.invoiceAvailable,
        }),
        ...(dealData.sellingReason !== undefined && {
          sellingReason: dealData.sellingReason,
        }),
        ...(dealData.canBeDelivered !== undefined && {
          canBeDelivered: dealData.canBeDelivered,
        }),
        ...(dealData.features !== undefined && { features: dealData.features }),
        ...(dealData.condition !== undefined && {
          condition: dealData.condition as any,
        }),
      },
    });

    if (products !== undefined) {
      await prisma.dealProduct.deleteMany({ where: { dealId: id } });
      for (const product of products) {
        await prisma.dealProduct.create({
          data: {
            dealId: id,
            productId: product.productId,
            quantity: product.quantity,
          },
        });
      }
    }

    return prisma.deal.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: { include: { category: true, brand: true } } },
        },
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async updateStatus(
    id: number,
    status: string,
    reason?: string,
  ): Promise<any> {
    return prisma.deal.update({
      where: { id },
      data: {
        status: status as any,
        ...(reason ? { reasonDeclined: reason } : {}),
      },
    });
  }

  async addImage(id: number, imageUrl: string): Promise<any> {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');
    const images = (deal.images as string[]) || [];
    images.push(imageUrl);
    return prisma.deal.update({ where: { id }, data: { images } });
  }

  async deleteImage(id: number, url: string): Promise<any> {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');
    const images = ((deal.images as string[]) || []).filter(
      (img) => img !== url,
    );
    return prisma.deal.update({ where: { id }, data: { images } });
  }

  async getPaginatedByStatus(
    status: string,
    page = 1,
    limit = 20,
  ): Promise<any> {
    const where = { status: status as any };
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
          products: {
            include: { product: { include: { category: true, brand: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    return {
      data: deals,
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
}
