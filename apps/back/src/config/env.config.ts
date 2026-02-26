import Joi from 'joi';

export const envValidation = Joi.object({
  DATABASE_URL: Joi.string().default(
    'postgresql://localhost:5432/marketplace-ts',
  ),
  JWT_SECRET: Joi.string().default('marketplace-ts-dev-secret'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // OAuth
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  FACEBOOK_CLIENT_ID: Joi.string().allow('').optional(),
  FACEBOOK_CLIENT_SECRET: Joi.string().allow('').optional(),

  // S3
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().default('marketplace-ts-uploads'),

  // App
  API_PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Email (optional)
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'resend').default('resend'),
  EMAIL_FROM: Joi.string().email().allow('').optional(),

  // SMTP (for EMAIL_PROVIDER=smtp)
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().email().allow('').optional(),

  // Resend (for EMAIL_PROVIDER=resend)
  RESEND_API_KEY: Joi.string().allow('').optional(),
}).options({ allowUnknown: true });
