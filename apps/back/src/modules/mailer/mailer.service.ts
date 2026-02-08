import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

export interface PasswordResetEmailData {
  email: string;
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

@Injectable()
export class MailerService {
  constructor(
    private readonly nestMailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    try {
      await this.nestMailerService.sendMail({
        to: data.email,
        subject: 'Password Reset Request',
        template: 'password-reset', // references password-reset.hbs
        context: {
          userName: data.userName,
          resetUrl: data.resetUrl,
          expiresIn: data.expiresIn,
          appName: 'Marketplace',
          year: new Date().getFullYear(),
        },
      });

      console.log(`✓ Password reset email sent to: ${data.email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Method to test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.nestMailerService.sendMail({
        to: this.configService.get<string>('SMTP_USER'),
        subject: 'Test Email',
        text: 'Email configuration is working!',
      });
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}
