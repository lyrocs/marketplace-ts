import * as Joi from 'joi'

export const envValidation = Joi.object({
  DATABASE_URL: Joi.string().default('postgresql://localhost:5432/nextrade'),
  JWT_SECRET: Joi.string().default('nextrade-dev-secret'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // OAuth
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  FACEBOOK_CLIENT_ID: Joi.string().allow('').optional(),
  FACEBOOK_CLIENT_SECRET: Joi.string().allow('').optional(),

  // Matrix
  MATRIX_HOST: Joi.string().allow('').optional(),
  MATRIX_USER: Joi.string().allow('').optional(),
  MATRIX_PASSWORD: Joi.string().allow('').optional(),

  // S3
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().default('nextrade-uploads'),

  // App
  API_PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // Email (optional)
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
}).options({ allowUnknown: true })
