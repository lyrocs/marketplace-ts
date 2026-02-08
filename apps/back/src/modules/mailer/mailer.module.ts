import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailerService } from './mailer.service.js';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT') || 587,
          secure: config.get<number>('SMTP_PORT') === 465, // true for 465, false for other ports
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
          // Optional: Additional configuration
          tls: {
            rejectUnauthorized: false, // For development, set to true in production
          },
        },
        defaults: {
          from: config.get<string>('SMTP_FROM') || config.get<string>('SMTP_USER'),
        },
        template: {
          dir: join(process.cwd(), 'src', 'templates', 'emails'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
