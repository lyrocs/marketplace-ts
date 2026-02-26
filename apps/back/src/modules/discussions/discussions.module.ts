import { Module } from '@nestjs/common'
import { DiscussionsService } from './discussions.service.js'
import { DiscussionsResolver } from './discussions.resolver.js'

@Module({
  providers: [DiscussionsService, DiscussionsResolver],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
