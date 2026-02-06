import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { MatrixService } from './modules/matrix/matrix.service.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  app.setGlobalPrefix('api', {
    exclude: [
      '/graphql',
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
    ]
  })

  // Initialize Matrix service listener
  try {
    const matrixService = app.get(MatrixService)
    await matrixService.start()
  } catch (err) {
    console.warn('Matrix service initialization skipped:', err)
  }

  const port = process.env.API_PORT || 3001
  await app.listen(port)
  console.log(`NexTrade API listening on port ${port}`)
  console.log(`GraphQL playground: http://localhost:${port}/graphql`)
}

bootstrap()
