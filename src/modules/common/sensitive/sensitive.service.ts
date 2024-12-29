import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

import { AppInternalException } from '../../../common/exceptions/internal.exception';
import { ENVService } from '../env/env.service';

@Injectable()
export class SensitiveService {
  private readonly algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private readonly secretKey: string;
  private readonly ivLength = 16;

  constructor(private readonly envService: ENVService) {
    this.secretKey = envService.get('ENCRYPTION_KEY');
  }

  encrypt(input: any): string {
    if (input === null || input === undefined) {
      throw new AppInternalException({ message: 'Input cannot be null or undefined' });
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv, {
      authTagLength: 16,
    });

    const encryptedText = Buffer.concat([
      cipher.update(JSON.stringify(input)),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString('hex');

    return iv.toString('hex') + ':' + encryptedText;
  }

  decrypt(input: string): string {
    if (!input || input.length === 0) return '';

    const [ivHex, dataHex] = input.split(':');

    if (!ivHex || !dataHex) throw new AppInternalException({ message: 'Invalid input format' });

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedRawBuffer = Buffer.from(dataHex, 'hex');

    if (encryptedRawBuffer.length <= 16) throw new AppInternalException({ message: 'Invalid input length' });

    const authTagBuff = encryptedRawBuffer.subarray(encryptedRawBuffer.length - 16);
    const encTextBuff = encryptedRawBuffer.subarray(0, encryptedRawBuffer.length - 16);

    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv, {
      authTagLength: 16,
    });

    decipher.setAuthTag(authTagBuff);

    const decrypted = Buffer.concat([decipher.update(encTextBuff), decipher.final()]);

    return decrypted.toString();
  }
}
