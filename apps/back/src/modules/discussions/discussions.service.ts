import { Injectable } from '@nestjs/common'
import { prisma } from '@nextrade/database'
import { MatrixService } from '../matrix/matrix.service.js'

@Injectable()
export class DiscussionsService {
  constructor(private readonly matrixService: MatrixService) {}

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
    })
  }

  async findById(id: number): Promise<any> {
    return prisma.discussion.findUnique({
      where: { id },
      include: {
        deal: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, image: true, matrixLogin: true } },
        seller: { select: { id: true, name: true, image: true, matrixLogin: true } },
        statuses: true,
      },
    })
  }

  async findByDealAndBuyer(dealId: number, buyerId: string): Promise<any> {
    return prisma.discussion.findFirst({
      where: { dealId, buyerId },
    })
  }

  async create(data: { dealId: number; buyerId: string; sellerId: string }): Promise<any> {
    // Get user matrix logins
    const [buyer, seller] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.buyerId }, select: { matrixLogin: true, name: true } }),
      prisma.user.findUnique({ where: { id: data.sellerId }, select: { matrixLogin: true, name: true } }),
    ])

    const deal = await prisma.deal.findUnique({ where: { id: data.dealId }, select: { title: true } })

    // Create Matrix room
    const roomId = await this.matrixService.createRoom({
      name: `Deal #${data.dealId}: ${deal?.title || 'Untitled'}`,
      sellerName: seller?.matrixLogin || '',
      buyerName: buyer?.matrixLogin || '',
    })

    const discussion = await prisma.discussion.create({
      data: {
        dealId: data.dealId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        matrixRoomId: roomId,
      },
    })

    // Create statuses for both users
    await Promise.all([
      prisma.discussionStatus.create({
        data: { discussionId: discussion.id, userId: data.buyerId, newMessage: false },
      }),
      prisma.discussionStatus.create({
        data: { discussionId: discussion.id, userId: data.sellerId, newMessage: false },
      }),
    ])

    return discussion
  }

  async setNewMessage(roomId: string, sender: string): Promise<any> {
    // Find discussion by room ID
    const discussion = await prisma.discussion.findFirst({
      where: { matrixRoomId: roomId },
    })
    if (!discussion) return

    // Mark new message for all users except sender
    await prisma.discussionStatus.updateMany({
      where: {
        discussionId: discussion.id,
        NOT: { userId: sender },
      },
      data: { newMessage: true },
    })
  }

  async markRead(discussionId: number, userId: string): Promise<any> {
    return prisma.discussionStatus.updateMany({
      where: { discussionId, userId },
      data: { newMessage: false },
    })
  }

  async getUnreadCount(userId: string): Promise<any> {
    return prisma.discussionStatus.count({
      where: { userId, newMessage: true },
    })
  }
}
