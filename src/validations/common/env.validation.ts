import { z } from 'zod';

export const ENVSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(['production', 'development']).default('development'),
  APP_URL: z.string().url(),

  DATABASE_URL: z.string().startsWith('postgres'),

  REDIS_URL: z.string().startsWith('redis'),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().positive().int().optional(),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  MAIL_SENDER_USERNAME: z.string(),

  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_SECRET_FOR_ACCESS_TOKEN: z.string(),
  JWT_SECRET_FOR_REFRESH_TOKEN: z.string(),
  JWT_EXPIRES_FOR_ACCESS_TOKEN: z.string().default('10m'),
  JWT_EXPIRES_FOR_REFRESH_TOKEN: z.string().default('7d'),

  EMAIL_VERIFICATION_TOKEN_DURATION: z.coerce.number().positive().int().multipleOf(60).default(180),
  PASSWORD_RESET_TOKEN_DURATION: z.coerce.number().positive().int().multipleOf(60).default(300),
  ENCRYPTION_KEY: z.string().length(32),
  FE_PASSWORD_RESET_URL: z.string().url(),
});

export type ENV = z.infer<typeof ENVSchema>;
