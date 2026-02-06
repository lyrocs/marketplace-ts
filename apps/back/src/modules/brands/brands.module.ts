import { Module } from '@nestjs/common'
import { BrandsService } from './brands.service.js'
import { BrandsResolver } from './brands.resolver.js'

@Module({
  providers: [BrandsService, BrandsResolver],
  exports: [BrandsService],
})
export class BrandsModule {}
