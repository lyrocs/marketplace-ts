import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { envValidation } from './config/env.config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { ProductsModule } from './modules/products/products.module'
import { DealsModule } from './modules/deals/deals.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { BrandsModule } from './modules/brands/brands.module'
import { SpecsModule } from './modules/specs/specs.module'
import { DiscussionsModule } from './modules/discussions/discussions.module'
import { MatrixModule } from './modules/matrix/matrix.module'
import { UploadModule } from './modules/upload/upload.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidation,
      envFilePath: ['.env', '../../.env'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: any) => ({ req, res }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    DealsModule,
    CategoriesModule,
    BrandsModule,
    SpecsModule,
    DiscussionsModule,
    MatrixModule,
    UploadModule,
  ],
})
export class AppModule {}
