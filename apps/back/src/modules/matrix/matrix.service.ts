import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'matrix-js-sdk';
import { prisma } from '@marketplace/database';

@Injectable()
export class MatrixService {
  private client: sdk.MatrixClient | null = null;
  private accessToken: string | null = null;

  constructor(private configService: ConfigService) {}

  async init(): Promise<any> {
    const matrixHost = this.configService.get<string>('MATRIX_HOST');
    const matrixUser = this.configService.get<string>('MATRIX_USER');
    const matrixPassword = this.configService.get<string>('MATRIX_PASSWORD');

    if (!matrixHost || !matrixUser || !matrixPassword) {
      console.warn('Matrix env vars not configured, skipping Matrix init');
      return;
    }

    try {
      const response = await fetch(
        `https://${matrixHost}/_matrix/client/v3/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'm.login.password',
            user: matrixUser,
            password: matrixPassword,
          }),
        },
      );

      const data: any = await response.json();
      this.accessToken = data?.access_token || '';

      this.client = sdk.createClient({
        baseUrl: `https://${matrixHost}`,
        accessToken: this.accessToken ?? undefined,
        userId: data?.user_id ?? (undefined as any),
      });
    } catch (err) {
      console.warn('Matrix initialization failed:', err);
    }
  }

  async start(): Promise<any> {
    if (!this.client) {
      await this.init();
    }

    if (!this.client) return;

    this.client.startClient();

    this.client.on(
      'Room.timeline' as any,
      async (event: any, room: any, toStartOfTimeline: boolean) => {
        if (toStartOfTimeline || event.getType() !== 'm.room.message') return;

        const age = event.event?.unsigned?.age;
        if (age > 5000) return;

        const roomId = room?.roomId || '';
        const sender = event.getSender() || '';
        const body = event.getContent().body || '';

        if (!roomId || !sender || !body) return;

        try {
          // Mark new message for other participants
          const discussion = await prisma.discussion.findFirst({
            where: { matrixRoomId: roomId },
          });
          if (discussion) {
            await prisma.discussionStatus.updateMany({
              where: {
                discussionId: discussion.id,
                NOT: { userId: sender },
              },
              data: { newMessage: true },
            });
          }
        } catch (err) {
          console.error('Error processing Matrix message:', err);
        }
      },
    );
  }

  async createUser(): Promise<{ username: string; password: string } | null> {
    const matrixHost = this.configService.get<string>('MATRIX_HOST');
    if (!matrixHost || !this.accessToken) {
      console.warn('Matrix not initialized, skipping user creation');
      return null;
    }

    const randomString = (length: number) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const username = randomString(16);
    const password = randomString(16);
    const fullUsername = `@${username}:${matrixHost}`;
    const encodedUsername = encodeURIComponent(fullUsername);

    try {
      const response = await fetch(
        `https://${matrixHost}/_synapse/admin/v2/users/${encodedUsername}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            password,
            admin: false,
            displayname: username,
          }),
        },
      );

      if (response.ok) {
        return { username: fullUsername, password };
      }

      console.error('Matrix user creation failed:', response.statusText);
      return null;
    } catch (err) {
      console.error('Matrix user creation error:', err);
      return null;
    }
  }

  async createRoom({
    name,
    sellerName,
    buyerName,
  }: {
    name: string;
    sellerName: string;
    buyerName: string;
  }): Promise<string> {
    if (!this.client) return '';

    try {
      const invite = [sellerName, buyerName].filter(Boolean);
      const response = await this.client.createRoom({
        visibility: 'private' as any,
        name,
        topic: name,
        invite,
        preset: 'private_chat' as any,
        is_direct: false,
      });
      return response?.room_id || '';
    } catch (err) {
      console.error('Matrix room creation failed:', err);
      return '';
    }
  }
}
