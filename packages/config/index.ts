// Shared configuration constants

export const config = {
  auth: {
    jwtExpiresIn: '7d',
    passwordResetExpiresIn: 60 * 60 * 1000, // 1 hour
    rememberMeExpiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  rateLimit: {
    login: {
      maxAttempts: 10,
      windowMs: 3 * 60 * 60 * 1000, // 3 hours
      blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  pagination: {
    defaultLimit: 12,
    maxLimit: 100,
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  deals: {
    maxImages: 10,
  },
} as const

export type Config = typeof config
