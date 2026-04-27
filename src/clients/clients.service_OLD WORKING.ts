import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  private encryptData(plaintext: string): string {
    const key = this.config.get<string>('APP_ENCRYPTION_KEY');
    const hmacKey = this.config.get<string>('APP_HMAC_KEY');
    if (!key || !hmacKey) throw new HttpException('Encryption keys missing', 500);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'binary');
    encrypted += cipher.final('binary');

    const hmac = crypto.createHmac('sha256', Buffer.from(hmacKey, 'hex'));
    hmac.update(Buffer.from(encrypted, 'binary'));
    const hmacDigest = hmac.digest();

    const combined = Buffer.concat([iv, hmacDigest, Buffer.from(encrypted, 'binary')]);
    return combined.toString('base64');
  }

  private decryptData(encrypted: string): string | false {
    const key = this.config.get<string>('APP_ENCRYPTION_KEY');
    const hmacKey = this.config.get<string>('APP_HMAC_KEY');
    if (!key || !hmacKey) return false;

    const data = Buffer.from(encrypted, 'base64');
    const iv = data.slice(0, 16);
    const hmac = data.slice(16, 48);
    const ciphertext = data.slice(48);

    const calculatedHmac = crypto.createHmac('sha256', Buffer.from(hmacKey, 'hex'));
    calculatedHmac.update(ciphertext);
    if (!crypto.timingSafeEqual(hmac, calculatedHmac.digest())) return false;

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async register(dto: RegisterDto, req: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check duplicate username
      const existingUser = await queryRunner.query(
        `SELECT id FROM clients WHERE username = ?`,
        [dto.username],
      );
      if (existingUser.length) throw new HttpException('Username exists', 409);

      // Hash email
      const emailHash = crypto.createHash('sha256').update(dto.email.toLowerCase()).digest('hex');
      const existingEmail = await queryRunner.query(
        `SELECT id FROM clients WHERE email_hash = ?`,
        [emailHash],
      );
      if (existingEmail.length) throw new HttpException('Email exists', 409);

      // Encrypt sensitive data
      const emailEnc = this.encryptData(dto.email);
      const firstNameEnc = this.encryptData(dto.first_name);
      const middleNameEnc = dto.middle_name ? this.encryptData(dto.middle_name) : null;
      const lastNameEnc = this.encryptData(dto.last_name);

      // Generate unique account number
      let accountNumber: string;
      do {
        accountNumber = '88' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
        const existingAccount = await queryRunner.query(
          `SELECT id FROM clients WHERE account_number = ?`,
          [accountNumber],
        );
        if (existingAccount.length === 0) break;
      } while (true);

      // Insert client
      const insertResult = await queryRunner.query(
        `INSERT INTO clients
        (username, email_enc, email_hash, first_name_enc, middle_name_enc, last_name_enc, account_number, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [dto.username, emailEnc, emailHash, firstNameEnc, middleNameEnc, lastNameEnc, accountNumber],
      );

      // Log request
      await queryRunner.query(
        `INSERT INTO api_logs
        (api_client_id, endpoint, request_body, response_body, status_code, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1, // replace with API client ID from guard if needed
          'clients/register',
          JSON.stringify(dto),
          JSON.stringify({ status: 'success', account_number: accountNumber }),
          200,
          req.ip || req.connection.remoteAddress,
        ],
      );

      await queryRunner.commitTransaction();

      return {
        status: 'success',
        message: 'Registration successful',
        account_number: accountNumber,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}