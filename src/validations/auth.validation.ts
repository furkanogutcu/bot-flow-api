import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const passwordSchema = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).{8,}$/, {
  message:
    'Password to be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
});

export const emailSchema = z.string().email().max(255);

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = registerSchema.pick({ email: true, password: true });

export const resendEmailVerificationEmailSchema = z.object({
  email: emailSchema,
});

export const sendPasswordResetEmailSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string(),
  new_password: passwordSchema,
});

export const refreshTokensSchema = z.object({
  refresh_token: z.string(),
});

export const emailVerificationTokenSchema = z.object({
  token: z.string().min(1),
});

export class RegisterPayload extends createZodDto(registerSchema) {}
export class LoginPayload extends createZodDto(loginSchema) {}
export class ResendEmailVerificationEmailPayload extends createZodDto(resendEmailVerificationEmailSchema) {}
export class SendPasswordResetEmailPayload extends createZodDto(sendPasswordResetEmailSchema) {}
export class PasswordResetPayload extends createZodDto(passwordResetSchema) {}
export class RefreshTokensPayload extends createZodDto(refreshTokensSchema) {}
export class EmailVerificationTokenParam extends createZodDto(emailVerificationTokenSchema) {}
