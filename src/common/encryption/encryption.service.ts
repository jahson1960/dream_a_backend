import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private encryptionKey: Buffer;
  private hmacKey: Buffer;

  constructor(private config: ConfigService) {
    const encKey = this.config.get<string>('APP_ENCRYPTION_KEY');
    const hmacKey = this.config.get<string>('APP_HMAC_KEY');

    if (!encKey || !hmacKey) {
        throw new Error('Encryption keys missing in .env');
    }

    this.encryptionKey = Buffer.from(encKey, 'hex');
    this.hmacKey = Buffer.from(hmacKey, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const hmac = crypto
      .createHmac('sha256', this.hmacKey)
      .update(ciphertext)
      .digest();

    return Buffer.concat([iv, hmac, ciphertext]).toString('base64');
  }

  decrypt(encrypted: string): string | null {
    try {
      const data = Buffer.from(encrypted, 'base64');

      if (data.length < 48) return null;

      const iv = data.subarray(0, 16);
      const hmac = data.subarray(16, 48);
      const ciphertext = data.subarray(48);

      const calcHmac = crypto
        .createHmac('sha256', this.hmacKey)
        .update(ciphertext)
        .digest();

      if (!crypto.timingSafeEqual(hmac, calcHmac)) return null;

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv,
      );

      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      return null;
    }
  }
}