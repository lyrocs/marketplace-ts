import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-facebook'
import { AuthService } from './auth.service.js'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET') || 'placeholder',
      callbackURL: `${configService.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/facebook/callback`,
      scope: ['email'],
      profileFields: ['emails', 'displayName', 'photos'],
    })
  }

  async validate(accessToken: string, _refreshToken: string, profile: any, done: any) {
    const email = profile.emails?.[0]?.value
    if (!email) {
      return done(new Error('No email provided by Facebook'))
    }

    try {
      const result = await this.authService.validateOAuthUser({
        provider: 'facebook',
        providerId: profile.id,
        email,
        name: profile.displayName,
        image: profile.photos?.[0]?.value,
        accessToken,
      })
      done(null, result)
    } catch (err) {
      done(err)
    }
  }
}
