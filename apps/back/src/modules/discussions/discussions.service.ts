import { Injectable } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class DiscussionsService {
  async findByUser(userId: string): Promise<any> {
    return prisma.discussion.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        deal: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
        statuses: { where: { userId } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<any> {
    return prisma.discussion.findUnique({
      where: { id },
      include: {
        deal: { select: { id: true, title: true } },
        buyer: {
          select: { id: true, name: true, image: true },
        },
        seller: {
          select: { id: true, name: true, image: true },
        },
        statuses: true,
      },
    });
  }

  async findByDealAndBuyer(dealId: number, buyerId: string): Promise<any> {
    return prisma.discussion.findFirst({
      where: { dealId, buyerId },
    });
  }

  async create(data: {
    dealId: number;
    buyerId: string;
    sellerId: string;
  }): Promise<any> {
    const discussion = await prisma.discussion.create({
      data: {
        dealId: data.dealId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
    });

    // Create statuses for both users
    await Promise.all([
      prisma.discussionStatus.create({
        data: {
          discussionId: discussion.id,
          userId: data.buyerId,
          newMessage: false,
        },
      }),
      prisma.discussionStatus.create({
        data: {
          discussionId: discussion.id,
          userId: data.sellerId,
          newMessage: false,
        },
      }),
    ]);

    return discussion;
  }

  async markRead(discussionId: number, userId: string): Promise<any> {
    return prisma.discussionStatus.updateMany({
      where: { discussionId, userId },
      data: { newMessage: false },
    });
  }

  async getUnreadCount(userId: string): Promise<any> {
    return prisma.discussionStatus.count({
      where: { userId, newMessage: true },
    });
  }
}
