import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagesService } from './messages.service.js';
import { MessagesGateway } from './messages.gateway.js';
import { MessagesResolver } from './messages.resolver.js';

@Module({
  imports: [ConfigModule],
  providers: [MessagesService, MessagesGateway, MessagesResolver],
  exports: [MessagesService],
})
export class MessagesModule {}
