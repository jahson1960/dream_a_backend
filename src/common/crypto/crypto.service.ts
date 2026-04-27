import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private encKey: Buffer;
  private hmacKey: Buffer;

  constructor(private config: ConfigService) {
    const encKey = this.config.get<string>('APP_ENCRYPTION_KEY');
    const hmacKey = this.config.get<string>('APP_HMAC_KEY');

    if (!encKey || !hmacKey) {
      throw new Error('Encryption keys missing');
    }

    this.encKey = Buffer.from(encKey, 'hex');
    this.hmacKey = Buffer.from(hmacKey, 'hex');

    if (this.encKey.length !== 32) {
      throw new Error('APP_ENCRYPTION_KEY must be 32 bytes');
    }

    if (this.hmacKey.length < 32) {
      throw new Error('APP_HMAC_KEY must be at least 32 bytes');
    }
  }

  normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  hash(value: string): string {
    return crypto
      .createHmac('sha256', this.hmacKey)
      .update(this.normalize(value))
      .digest('hex');
  }

  encrypt(value: string): string {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.encKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const hmac = crypto
      .createHmac('sha256', this.hmacKey)
      .update(Buffer.concat([iv, encrypted]))
      .digest();

    return Buffer.concat([iv, hmac, encrypted]).toString('base64');
  }

  decrypt(payload: string): string | false {
    try {
      const data = Buffer.from(payload, 'base64');

      const iv = data.slice(0, 16);
      const hmac = data.slice(16, 48);
      const ciphertext = data.slice(48);

      const calcHmac = crypto
        .createHmac('sha256', this.hmacKey)
        .update(Buffer.concat([iv, ciphertext]))
        .digest();

      if (!crypto.timingSafeEqual(hmac, calcHmac)) {
        return false;
      }

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encKey,
        iv,
      );

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      return false;
    }
  }
}