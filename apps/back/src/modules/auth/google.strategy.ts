import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL: `${configService.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/google/callback`,
      scope: ['email', 'profile'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value
    if (!email) {
      return done(new Error('No email provided by Google'))
    }

    try {
      const result = await this.authService.validateOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email,
        name: profile.displayName,
        image: profile.photos?.[0]?.value,
        accessToken: _accessToken,
        refreshToken: _refreshToken,
      })
      done(null, result)
    } catch (err) {
      done(err)
    }
  }
}
