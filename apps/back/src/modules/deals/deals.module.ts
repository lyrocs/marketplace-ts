import { Module } from '@nestjs/common'
import { DealsService } from './deals.service.js'
import { DealsResolver } from './deals.resolver.js'
import { DiscussionsModule } from '../discussions/discussions.module.js'

@Module({
  imports: [DiscussionsModule],
  providers: [DealsService, DealsResolver],
  exports: [DealsService],
})
export class DealsModule {}
