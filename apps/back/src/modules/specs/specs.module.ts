import { Module } from '@nestjs/common'
import { SpecsService } from './specs.service.js'
import { SpecsResolver } from './specs.resolver.js'

@Module({
  providers: [SpecsService, SpecsResolver],
  exports: [SpecsService],
})
export class SpecsModule {}
