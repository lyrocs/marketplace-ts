import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service.js'
import { AuthResolver } from './auth.resolver.js'
import { AuthController } from './auth.controller.js'
import { LocalStrategy } from './local.strategy.js'
import { JwtStrategy } from './jwt.strategy.js'
import { GoogleStrategy } from './google.strategy.js'
import { FacebookStrategy } from './facebook.strategy.js'
import { UsersModule } from '../users/users.module.js'
import { MatrixModule } from '../matrix/matrix.module.js'
import { MailerModule } from '../mailer/mailer.module.js'

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    MatrixModule,
    MailerModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
