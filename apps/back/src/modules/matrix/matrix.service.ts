import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'matrix-js-sdk';
import { prisma } from '@marketplace/database';

@Injectable()
export class MatrixService {
  private client: sdk.MatrixClient | null = null;
  private accessToken: string | null = null;
  private discussionsService: any = null;

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

  // Method to set discussions service (called from module to avoid circular dependency)
  setDiscussionsService(service: any): void {
    this.discussionsService = service;
  }

  async start(): Promise<any> {
    if (!this.client) {
      await this.init();
    }

    if (!this.client) {
      console.warn('Matrix client not initialized, cannot start');
      return;
    }

    try {
      this.client.startClient();

      this.client.on(
        'Room.timeline' as any,
        async (event: any, room: any, toStartOfTimeline: boolean) => {
          // Skip paginated history and non-message events
          if (toStartOfTimeline || event.getType() !== 'm.room.message')
            return;

          // Skip old messages (older than 5 seconds)
          const age = event.event?.unsigned?.age;
          if (age > 5000) return;

          const roomId = room?.roomId || '';
          const sender = event.getSender() || '';
          const body = event.getContent().body || '';

          if (!roomId || !sender || !body) return;

          try {
            // Use DiscussionsService to handle message tracking
            if (this.discussionsService) {
              await this.discussionsService.setNewMessage(roomId, sender);
            } else {
              console.warn('DiscussionsService not set in MatrixService');
            }
          } catch (err) {
            console.error('Error setting new message for room:', roomId, err);
          }
        },
      );

      console.log('✓ Matrix client started and listening for messages');
    } catch (err) {
      console.error('Failed to start Matrix client:', err);
      throw err;
    }
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
    if (!this.client) {
      console.warn('Matrix client not initialized, cannot create room');
      return '';
    }

    const invite = [sellerName, buyerName].filter(Boolean);

    if (invite.length === 0) {
      console.warn('No valid users to invite to Matrix room');
      return '';
    }

    // Retry logic - attempt up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.client.createRoom({
          visibility: 'private' as any,
          name,
          topic: name,
          invite,
          preset: 'private_chat' as any,
          is_direct: false,
        });

        const roomId = response?.room_id || '';
        if (roomId) {
          console.log(`✓ Matrix room created: ${roomId}`);
          return roomId;
        }
      } catch (err) {
        console.error(
          `Matrix room creation failed (attempt ${attempt}/3):`,
          err instanceof Error ? err.message : err,
        );

        if (attempt === 3) {
          return '';
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1000),
        );
      }
    }

    return '';
  }
}
