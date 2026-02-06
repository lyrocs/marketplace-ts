import { Module } from '@nestjs/common'
import { SpecsService } from './specs.service'
import { SpecsResolver } from './specs.resolver'

@Module({
  providers: [SpecsService, SpecsResolver],
  exports: [SpecsService],
})
export class SpecsModule {}
