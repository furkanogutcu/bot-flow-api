import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

import { MFAMethod } from '../common/references/mfa.reference';

export const setupSchema = z.object({
  method: z.nativeEnum(MFAMethod),
});

export const verifySchema = z.object({
  verification_code: z.string(),
});

export class SetupMFAPayload extends createZodDto(setupSchema) {}
export class VerifyMFAPayload extends createZodDto(verifySchema) {}
