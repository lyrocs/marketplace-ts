import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MatrixService } from './matrix.service.js';

@Controller()
export class MatrixController {
  constructor(private readonly matrixService: MatrixService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(): Promise<{ username: string; password: string } | null> {
    return this.matrixService.createUser();
  }

  @MessagePattern({ cmd: 'create_room' })
  async createRoom(data: {
    name: string;
    sellerName: string;
    buyerName: string;
  }): Promise<string> {
    return this.matrixService.createRoom(data);
  }
}
