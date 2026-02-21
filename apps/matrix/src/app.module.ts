import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envValidation } from './config/env.config.js'
import { MatrixModule } from './matrix/matrix.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidation,
      envFilePath: ['.env', '../../.env'],
    }),
    MatrixModule,
  ],
})
export class AppModule {}
