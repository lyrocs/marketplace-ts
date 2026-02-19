import { Module } from '@nestjs/common'
import { ProductsService } from './products.service.js'
import { ProductsResolver } from './products.resolver.js'
import { UploadModule } from '../upload/upload.module.js'

@Module({
  imports: [UploadModule],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}
