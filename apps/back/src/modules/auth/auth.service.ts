import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@nextrade/database'
import { UserRole, JwtPayload } from '@nextrade/types'
import { UsersService } from '../users/users.service.js'
import { MatrixService } from '../matrix/matrix.service.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly matrixService: MatrixService,
  ) {}

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      await this.recordLoginAttempt(email)
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check rate limit
    await this.checkRateLimit(email)

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      await this.recordLoginAttempt(email)
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  async login(user: any): Promise<any> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret'
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d'
    const accessToken = jwt.sign(payload, secret, { expiresIn })

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    }
  }

  async register(data: { name: string; email: string; password: string }): Promise<any> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw new BadRequestException('Email already in use')
    }

    // First user becomes admin
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.USER

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role,
      },
    })

    // Create Matrix user in background
    this.createMatrixUserForRegistration(user.id).catch(() => {
      console.warn('Matrix user creation failed for:', user.id)
    })

    return this.login(user)
  }

  async validateOAuthUser(oauthData: {
    provider: string
    providerId: string
    email: string
    name?: string
    image?: string
    accessToken?: string
    refreshToken?: string
  }) {
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: oauthData.provider,
          providerAccountId: oauthData.providerId,
        },
      },
      include: { user: true },
    })

    if (account) {
      return this.login(account.user)
    }

    // Check if user with this email exists
    let user = await prisma.user.findUnique({ where: { email: oauthData.email } })

    if (!user) {
      const userCount = await prisma.user.count()
      user = await prisma.user.create({
        data: {
          name: oauthData.name || null,
          email: oauthData.email,
          image: oauthData.image || null,
          role: userCount === 0 ? UserRole.ADMIN : UserRole.USER,
          emailVerified: new Date(),
        },
      })

      // Create Matrix user in background
      this.createMatrixUserForRegistration(user.id).catch(() => {})
    }

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: oauthData.provider,
        providerAccountId: oauthData.providerId,
        accessToken: oauthData.accessToken || null,
        refreshToken: oauthData.refreshToken || null,
      },
    })

    return this.login(user)
  }

  async requestPasswordReset(email: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Return success regardless to prevent email enumeration
      return { success: true }
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${token}`)

    return { success: true }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    })

    return { success: true }
  }

  private async recordLoginAttempt(_email: string): Promise<any> {
    const key = `login_attempts:${_email}`
    const now = Date.now()
    const windowStart = BigInt(now - 3 * 60 * 60 * 1000) // 3 hours

    const existing = await prisma.rateLimit.findUnique({ where: { key } })

    if (existing && existing.expire && existing.expire >= BigInt(now)) {
      await prisma.rateLimit.update({
        where: { key },
        data: { points: existing.points + 1 },
      })
    } else {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { points: 1, expire: BigInt(now + 3 * 60 * 60 * 1000) },
        create: { key, points: 1, expire: BigInt(now + 3 * 60 * 60 * 1000) },
      })
    }
  }

  private async checkRateLimit(email: string): Promise<any> {
    const key = `login_attempts:${email}`
    const now = Date.now()

    const record = await prisma.rateLimit.findUnique({ where: { key } })
    if (!record) return

    if (record.expire && record.expire < BigInt(now)) {
      await prisma.rateLimit.delete({ where: { key } })
      return
    }

    if (record.points >= 10) {
      // Block for 24 hours
      const blockKey = `login_blocked:${email}`
      await prisma.rateLimit.upsert({
        where: { key: blockKey },
        update: { points: 1, expire: BigInt(now + 24 * 60 * 60 * 1000) },
        create: { key: blockKey, points: 1, expire: BigInt(now + 24 * 60 * 60 * 1000) },
      })
      throw new UnauthorizedException('Account temporarily blocked. Try again later.')
    }

    // Check if blocked
    const blockKey = `login_blocked:${email}`
    const blockRecord = await prisma.rateLimit.findUnique({ where: { key: blockKey } })
    if (blockRecord && blockRecord.expire && blockRecord.expire >= BigInt(now)) {
      throw new UnauthorizedException('Account temporarily blocked. Try again later.')
    }
  }

  private async createMatrixUserForRegistration(userId: string): Promise<any> {
    const credentials = await this.matrixService.createUser()
    if (credentials) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          matrixLogin: credentials.username,
          matrixPassword: credentials.password,
        },
      })
    }
  }
}
