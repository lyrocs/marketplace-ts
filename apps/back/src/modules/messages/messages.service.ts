import { Injectable } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class MessagesService {
  async create(data: {
    discussionId: number;
    senderId: string;
    content: string;
  }) {
    // Validate sender is a participant
    const discussion = await prisma.discussion.findUnique({
      where: { id: data.discussionId },
      select: { buyerId: true, sellerId: true },
    });

    if (!discussion) throw new Error('Discussion not found');
    if (
      discussion.buyerId !== data.senderId &&
      discussion.sellerId !== data.senderId
    ) {
      throw new Error('Not a participant of this discussion');
    }

    const message = await prisma.message.create({
      data: {
        discussionId: data.discussionId,
        senderId: data.senderId,
        content: data.content,
      },
    });

    // Mark unread for the other participant
    const recipientId =
      discussion.buyerId === data.senderId
        ? discussion.sellerId
        : discussion.buyerId;

    await prisma.discussionStatus.updateMany({
      where: { discussionId: data.discussionId, userId: recipientId },
      data: { newMessage: true },
    });

    return message;
  }

  async findByDiscussion(
    discussionId: number,
    cursor?: string,
    limit: number = 50,
  ) {
    const messages = await prisma.message.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: items.reverse(),
      nextCursor: hasMore ? items[0]?.id : undefined,
    };
  }

  async getDiscussionParticipants(discussionId: number) {
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { buyerId: true, sellerId: true },
    });
    return discussion;
  }
}
