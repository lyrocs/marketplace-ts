import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class MatrixClientService {
  constructor(
    @Inject('MATRIX_SERVICE') private readonly client: ClientProxy,
  ) {}

  async createUser(): Promise<{ username: string; password: string } | null> {
    try {
      return await firstValueFrom(
        this.client.send<{ username: string; password: string } | null>(
          { cmd: 'create_user' },
          {},
        ).pipe(
          timeout(10000),
          catchError((err) => {
            console.error('Matrix createUser TCP error:', err?.message || err);
            return of(null);
          }),
        ),
      );
    } catch (err) {
      console.error('Matrix createUser error:', err);
      return null;
    }
  }

  async createRoom(data: {
    name: string;
    sellerName: string;
    buyerName: string;
  }): Promise<string> {
    try {
      return await firstValueFrom(
        this.client.send<string>(
          { cmd: 'create_room' },
          data,
        ).pipe(
          timeout(10000),
          catchError((err) => {
            console.error('Matrix createRoom TCP error:', err?.message || err);
            return of('');
          }),
        ),
      );
    } catch (err) {
      console.error('Matrix createRoom error:', err);
      return '';
    }
  }
}
