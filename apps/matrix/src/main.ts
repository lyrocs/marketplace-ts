import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const port = parseInt(process.env.MATRIX_SERVICE_PORT || '3002', 10)

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  )

  await app.listen()
  console.log(`Matrix microservice listening on TCP port ${port}`)
}

bootstrap()
