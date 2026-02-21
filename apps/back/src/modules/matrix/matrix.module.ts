import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MatrixClientService } from './matrix-client.service.js'

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MATRIX_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MATRIX_SERVICE_HOST') || 'localhost',
            port: configService.get<number>('MATRIX_SERVICE_PORT') || 3002,
          },
        }),
      },
    ]),
  ],
  providers: [MatrixClientService],
  exports: [MatrixClientService],
})
export class MatrixModule {}
