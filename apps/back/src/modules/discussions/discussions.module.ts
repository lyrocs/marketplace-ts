import { Module } from '@nestjs/common'
import { DiscussionsService } from './discussions.service'
import { DiscussionsResolver } from './discussions.resolver'
import { MatrixModule } from '../matrix/matrix.module'

@Module({
  imports: [MatrixModule],
  providers: [DiscussionsService, DiscussionsResolver],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
