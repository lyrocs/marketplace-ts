import { Module, OnModuleInit } from '@nestjs/common'
import { DiscussionsService } from './discussions.service.js'
import { DiscussionsResolver } from './discussions.resolver.js'
import { MatrixModule } from '../matrix/matrix.module.js'
import { MatrixService } from '../matrix/matrix.service.js'

@Module({
  imports: [MatrixModule],
  providers: [DiscussionsService, DiscussionsResolver],
  exports: [DiscussionsService],
})
export class DiscussionsModule implements OnModuleInit {
  constructor(
    private readonly matrixService: MatrixService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  onModuleInit() {
    // Wire MatrixService and DiscussionsService together to avoid circular dependency
    this.matrixService.setDiscussionsService(this.discussionsService)
  }
}
