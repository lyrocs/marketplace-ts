import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport will handle the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user as any
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'

    if (user && user.accessToken) {
      // Redirect to frontend with token in URL
      return res.redirect(`${frontendUrl}/auth/callback?token=${user.accessToken}`)
    }

    // On error, redirect to login with error
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Passport will handle the redirect to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user as any
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'

    if (user && user.accessToken) {
      // Redirect to frontend with token in URL
      return res.redirect(`${frontendUrl}/auth/callback?token=${user.accessToken}`)
    }

    // On error, redirect to login with error
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }
}
