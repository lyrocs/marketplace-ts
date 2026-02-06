import { Module } from '@nestjs/common'
import { DiscussionsService } from './discussions.service.js'
import { DiscussionsResolver } from './discussions.resolver.js'
import { MatrixModule } from '../matrix/matrix.module.js'

@Module({
  imports: [MatrixModule],
  providers: [DiscussionsService, DiscussionsResolver],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
