import { Module, OnModuleInit } from '@nestjs/common'
import { MatrixService } from './matrix.service.js'
import { MatrixController } from './matrix.controller.js'

@Module({
  controllers: [MatrixController],
  providers: [MatrixService],
})
export class MatrixModule implements OnModuleInit {
  constructor(private readonly matrixService: MatrixService) {}

  async onModuleInit() {
    await this.matrixService.start()
  }
}
