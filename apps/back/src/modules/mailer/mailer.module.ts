import { Module, DynamicModule } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailerService } from './mailer.service.js';

@Module({})
export class MailerModule {
  static forRoot(): DynamicModule {
    return {
      module: MailerModule,
      imports: [
        ConfigModule,
        NestMailerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (config: ConfigService) => {
            const provider = config.get<string>('EMAIL_PROVIDER') || 'resend';

            // If using Resend, return minimal config (won't be used)
            if (provider === 'resend') {
              return {
                transport: {
                  host: 'localhost',
                  port: 587,
                },
                defaults: {
                  from: 'noreply@localhost',
                },
              };
            }

            // SMTP configuration
            return {
              transport: {
                host: config.get<string>('SMTP_HOST'),
                port: config.get<number>('SMTP_PORT') || 587,
                secure: config.get<number>('SMTP_PORT') === 465,
                auth: {
                  user: config.get<string>('SMTP_USER'),
                  pass: config.get<string>('SMTP_PASS'),
                },
                tls: {
                  rejectUnauthorized: false, // For development, set to true in production
                },
              },
              defaults: {
                from:
                  config.get<string>('SMTP_FROM') ||
                  config.get<string>('SMTP_USER'),
              },
              template: {
                dir: join(process.cwd(), 'src', 'templates', 'emails'),
                adapter: new HandlebarsAdapter(),
                options: {
                  strict: true,
                },
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [MailerService],
      exports: [MailerService],
    };
  }
}
