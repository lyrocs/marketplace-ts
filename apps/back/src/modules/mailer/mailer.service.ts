import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

export interface PasswordResetEmailData {
  email: string;
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

type EmailProvider = 'smtp' | 'resend';

@Injectable()
export class MailerService implements OnModuleInit {
  private resend: Resend | null = null;
  private emailProvider: EmailProvider;
  private emailFrom: string;
  private passwordResetTemplate: HandlebarsTemplateDelegate | null = null;

  constructor(
    @Optional() private readonly nestMailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {
    this.emailProvider = this.configService.get<EmailProvider>('EMAIL_PROVIDER') || 'resend';
    this.emailFrom =
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'noreply@marketplace.com';
  }

  onModuleInit() {
    // Initialize Resend if using resend provider
    if (this.emailProvider === 'resend') {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      if (!apiKey) {
        console.warn(
          '⚠️  RESEND_API_KEY not configured. Email sending will fail.',
        );
      } else {
        this.resend = new Resend(apiKey);
        console.log('✓ Resend email provider initialized');
      }

      // Load and compile Handlebars template for Resend
      try {
        const templatePath = join(
          process.cwd(),
          'src',
          'templates',
          'emails',
          'password-reset.hbs',
        );
        const templateSource = readFileSync(templatePath, 'utf-8');
        this.passwordResetTemplate = Handlebars.compile(templateSource);
      } catch (error) {
        console.error('Failed to load email template:', error);
      }
    } else {
      console.log('✓ SMTP email provider initialized');
    }
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    if (this.emailProvider === 'resend') {
      await this.sendPasswordResetEmailViaResend(data);
    } else {
      await this.sendPasswordResetEmailViaSMTP(data);
    }
  }

  private async sendPasswordResetEmailViaResend(
    data: PasswordResetEmailData,
  ): Promise<void> {
    if (!this.resend) {
      throw new Error('Resend is not initialized. Check RESEND_API_KEY.');
    }

    if (!this.passwordResetTemplate) {
      throw new Error('Email template not loaded');
    }

    try {
      const html = this.passwordResetTemplate({
        userName: data.userName,
        resetUrl: data.resetUrl,
        expiresIn: data.expiresIn,
        appName: 'Marketplace',
        year: new Date().getFullYear(),
      });

      await this.resend.emails.send({
        from: this.emailFrom,
        to: data.email,
        subject: 'Password Reset Request',
        html,
      });

      console.log(`✓ Password reset email sent via Resend to: ${data.email}`);
    } catch (error) {
      console.error('Failed to send password reset email via Resend:', error);
      throw new Error('Failed to send email');
    }
  }

  private async sendPasswordResetEmailViaSMTP(
    data: PasswordResetEmailData,
  ): Promise<void> {
    if (!this.nestMailerService) {
      throw new Error('SMTP is not configured. NestMailerService is not available.');
    }

    try {
      await this.nestMailerService.sendMail({
        to: data.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          userName: data.userName,
          resetUrl: data.resetUrl,
          expiresIn: data.expiresIn,
          appName: 'Marketplace',
          year: new Date().getFullYear(),
        },
      });

      console.log(`✓ Password reset email sent via SMTP to: ${data.email}`);
    } catch (error) {
      console.error('Failed to send password reset email via SMTP:', error);
      throw new Error('Failed to send email');
    }
  }

  // Method to test email configuration
  async testConnection(): Promise<boolean> {
    try {
      if (this.emailProvider === 'resend') {
        if (!this.resend) {
          return false;
        }
        // Resend doesn't have a test connection method, so we'll just verify it's initialized
        console.log('✓ Resend is initialized');
        return true;
      } else {
        if (!this.nestMailerService) {
          return false;
        }
        await this.nestMailerService.sendMail({
          to: this.configService.get<string>('SMTP_USER'),
          subject: 'Test Email',
          text: 'Email configuration is working!',
        });
        return true;
      }
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }

  getProvider(): EmailProvider {
    return this.emailProvider;
  }
}
