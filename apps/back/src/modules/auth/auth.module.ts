import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { LocalStrategy } from './local.strategy'
import { JwtStrategy } from './jwt.strategy'
import { GoogleStrategy } from './google.strategy'
import { FacebookStrategy } from './facebook.strategy'
import { UsersModule } from '../users/users.module'
import { MatrixModule } from '../matrix/matrix.module'

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    MatrixModule,
  ],
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
