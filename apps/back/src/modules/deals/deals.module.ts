import { Module } from '@nestjs/common'
import { DealsService } from './deals.service'
import { DealsResolver } from './deals.resolver'
import { DiscussionsModule } from '../discussions/discussions.module'

@Module({
  imports: [DiscussionsModule],
  providers: [DealsService, DealsResolver],
  exports: [DealsService],
})
export class DealsModule {}
