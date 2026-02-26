import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { prisma } from '@marketplace/database';
import { MessagesService } from './messages.service.js';

interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const secret =
        this.configService.get<string>('JWT_SECRET') || 'default-secret';
      const payload = jwt.verify(token, secret) as { sub: string };
      client.userId = payload.sub;

      // Join personal room for direct notifications
      client.join(`user:${client.userId}`);

      // Auto-join all user's discussion rooms
      const discussions = await prisma.discussion.findMany({
        where: {
          OR: [
            { buyerId: client.userId },
            { sellerId: client.userId },
          ],
        },
        select: { id: true },
      });

      for (const d of discussions) {
        client.join(`discussion:${d.id}`);
      }

      console.log(`[Chat] User ${client.userId} connected`);
    } catch (err) {
      console.error('[Chat] Auth failed:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      console.log(`[Chat] User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { discussionId: number; content: string },
  ) {
    try {
      const message = await this.messagesService.create({
        discussionId: data.discussionId,
        senderId: client.userId,
        content: data.content,
      });

      // Broadcast to all participants in the discussion room
      this.server
        .to(`discussion:${data.discussionId}`)
        .emit('new_message', {
          id: message.id,
          discussionId: message.discussionId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        });

      // Send unread update to the other participant
      const participants =
        await this.messagesService.getDiscussionParticipants(
          data.discussionId,
        );
      if (participants) {
        const recipientId =
          participants.buyerId === client.userId
            ? participants.sellerId
            : participants.buyerId;

        this.server.to(`user:${recipientId}`).emit('unread_update', {
          discussionId: data.discussionId,
        });
      }

      return { success: true, messageId: message.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('join_discussion')
  async handleJoinDiscussion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { discussionId: number },
  ) {
    // Verify participant
    const participants =
      await this.messagesService.getDiscussionParticipants(
        data.discussionId,
      );
    if (
      !participants ||
      (participants.buyerId !== client.userId &&
        participants.sellerId !== client.userId)
    ) {
      return { success: false, error: 'Not a participant' };
    }

    client.join(`discussion:${data.discussionId}`);
    return { success: true };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { discussionId: number },
  ) {
    await prisma.discussionStatus.updateMany({
      where: {
        discussionId: data.discussionId,
        userId: client.userId,
      },
      data: { newMessage: false },
    });

    return { success: true };
  }
}
