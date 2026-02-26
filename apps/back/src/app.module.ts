import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { envValidation } from './config/env.config.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { UsersModule } from './modules/users/users.module.js'
import { ProductsModule } from './modules/products/products.module.js'
import { DealsModule } from './modules/deals/deals.module.js'
import { CategoriesModule } from './modules/categories/categories.module.js'
import { BrandsModule } from './modules/brands/brands.module.js'
import { SpecsModule } from './modules/specs/specs.module.js'
import { DiscussionsModule } from './modules/discussions/discussions.module.js'
import { MessagesModule } from './modules/messages/messages.module.js'
import { UploadModule } from './modules/upload/upload.module.js'
import { MailerModule } from './modules/mailer/mailer.module.js'

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
    MailerModule.forRoot(),
    AuthModule,
    UsersModule,
    ProductsModule,
    DealsModule,
    CategoriesModule,
    BrandsModule,
    SpecsModule,
    DiscussionsModule,
    MessagesModule,
    UploadModule,
  ],
})
export class AppModule {}
