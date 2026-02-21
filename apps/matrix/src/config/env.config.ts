import Joi from 'joi';

export const envValidation = Joi.object({
  DATABASE_URL: Joi.string().default(
    'postgresql://localhost:5432/marketplace-ts',
  ),

  // Matrix
  MATRIX_HOST: Joi.string().allow('').optional(),
  MATRIX_USER: Joi.string().allow('').optional(),
  MATRIX_PASSWORD: Joi.string().allow('').optional(),

  // Microservice
  MATRIX_SERVICE_PORT: Joi.number().default(3002),
}).options({ allowUnknown: true });
