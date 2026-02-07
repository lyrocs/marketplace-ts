import { Injectable } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class UsersService {
  async findById(id: string): Promise<any> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        matrixLogin: true,
        matrixToken: true,
      },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(
    id: string,
    data: { name?: string; image?: string },
  ): Promise<any> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserStats(id: string): Promise<any> {
    const [totalDeals, publishedDeals, soldDeals] = await Promise.all([
      prisma.deal.count({ where: { userId: id } }),
      prisma.deal.count({ where: { userId: id, status: 'PUBLISHED' } }),
      prisma.deal.count({ where: { userId: id, status: 'SOLD' } }),
    ]);

    return { totalDeals, publishedDeals, soldDeals };
  }

  async getPublicProfile(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    const stats = await this.getUserStats(id);
    return { ...user, ...stats };
  }
}
