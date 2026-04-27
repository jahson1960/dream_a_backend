import { Injectable, HttpException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class ClientsService {
  //private encKey: Buffer;
  //private hmacKey: Buffer;

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly cryptoService: CryptoService
  ) {
    //const key = this.config.get<string>('APP_ENCRYPTION_KEY');
    //const hmacKey = this.config.get<string>('APP_HMAC_KEY');

    /*if (!key || !hmacKey) {
      throw new Error('Encryption keys missing');
    }

    this.encKey = Buffer.from(key, 'hex');
    this.hmacKey = Buffer.from(hmacKey, 'hex');

    // Validate key lengths
    if (this.encKey.length !== 32) {
      throw new Error('APP_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
    }
    if (this.hmacKey.length < 32) {
      throw new Error('APP_HMAC_KEY must be at least 32 bytes');
    }*/
  }

  // 🔐 Encrypt (AES-256-CBC + HMAC)
  /*private encryptData(plaintext: string): string {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.encKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // HMAC over IV + ciphertext
    const hmac = crypto
      .createHmac('sha256', this.hmacKey)
      .update(Buffer.concat([iv, encrypted]))
      .digest();

    return Buffer.concat([iv, hmac, encrypted]).toString('base64');
  } */

  // 🔓 Decrypt
  private decryptDataOld(payload: string): string | false {
    try {
      /*const data = Buffer.from(payload, 'base64');

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

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encKey, iv);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]); */

      return this.cryptoService.decrypt (payload) //decrypted.toString('utf8');
    } catch {
      return false;
    }
  } 

  // 🔍 HMAC hash (for searchable fields like email)
  /*private hashData(value: string): string {
    return crypto
      .createHmac('sha256', this.hmacKey)
      .update(value.toLowerCase())
      .digest('hex');
  }*/

  async register(dto: RegisterDto, req: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check duplicate username (hash-based search)
      const usernameHash = this.cryptoService.hash(dto.username);
      const existingUser = await queryRunner.query(
        `SELECT id FROM clients WHERE username_hash = ?`,
        [usernameHash],
      );
      if (existingUser.length) throw new HttpException('Username exists', 409);

      // Email hash check
      const emailHash = this.cryptoService.hash(dto.email);
      const existingEmail = await queryRunner.query(
        `SELECT id FROM clients WHERE email_hash = ?`,
        [emailHash],
      );
      if (existingEmail.length) throw new HttpException('Email exists', 409);

      // Encrypt sensitive data
      const usernameEnc = this.cryptoService.encrypt(dto.username);
      const emailEnc = this.cryptoService.encrypt(dto.email);
      const firstNameEnc = this.cryptoService.encrypt(dto.first_name);
      const middleNameEnc = dto.middle_name
        ? this.cryptoService.encrypt(dto.middle_name)
        : null;
      const lastNameEnc = this.cryptoService.encrypt(dto.last_name);

      // Generate account number
      let accountNumber: string;
      do {
        accountNumber =
          '88' +
          String(Math.floor(Math.random() * 1e8)).padStart(8, '0');

        const accountHash = this.cryptoService.hash(accountNumber);

        const existingAccount = await queryRunner.query(
          `SELECT id FROM clients WHERE account_number_hash = ?`,
          [accountHash],
        );

        if (existingAccount.length === 0) break;
      } while (true);

      const accountNumberEnc = this.cryptoService.encrypt(accountNumber);
      const accountNumberHash = this.cryptoService.hash(accountNumber);

      // Insert client
      await queryRunner.query(
        `INSERT INTO clients
        (username_enc, username_hash, email_enc, email_hash,
         first_name_enc, middle_name_enc, last_name_enc,
         account_number_enc, account_number_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          usernameEnc,
          usernameHash,
          emailEnc,
          emailHash,
          firstNameEnc,
          middleNameEnc,
          lastNameEnc,
          accountNumberEnc,
          accountNumberHash,
        ],
      );

      // ✅ SAFE LOGGING (sanitized)
      const safeLog = {
        username: dto.username,
        email: '***',
        status: 'success',
      };

      await queryRunner.query(
        `INSERT INTO api_logs
        (api_client_id, endpoint, request_body, response_body, status_code, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1,
          'clients/register',
          JSON.stringify(safeLog),
          JSON.stringify({ status: 'success' }),
          200,
          req.ip || req.connection?.remoteAddress,
        ],
      );

      await queryRunner.commitTransaction();

      return {
        status: 'success',
        message: 'Registration successful',
        account_number: accountNumber, // only return once
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /*async listClients(limit = 20, offset = 0) {
    const rows = await this.dataSource.query(
      `SELECT * FROM clients ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    

    return rows.map((c: any) => ({
      id: c.id,
      api_client_id: c.api_client_id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      kyc_status: c.kyc_status,
      status: c.status,
      created_at: c.created_at,
    }));
  }*/

  async listClients(limit = 20, offset = 0) {
    // Get paginated clients
    const rows = await this.dataSource.query(
      `SELECT * FROM clients ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    // Get total count
    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM clients`
    );

    const total = totalResult[0]?.total ?? 0;

    // Decrypt + map data
    const clients = rows.map((c: any) => ({
      id: c.id,
      api_client_id: c.api_client_id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      kyc_status: c.kyc_status,
      status: c.status,
      created_at: c.created_at,
    }));

    // Final response
    return {
      data: clients,
      total: Number(total),
      limit,
      offset,
    };
  }

  async findByAccountNumber(accountNumber: string) {
    const hash = this.cryptoService.hash(accountNumber);

    const rows = await this.dataSource.query(
      `SELECT * FROM clients WHERE account_number_hash = ? LIMIT 1`,
      [hash],
    );

    if (!rows.length) return null;

    const c = rows[0];

    return {
      id: c.id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      first_name: this.cryptoService.decrypt(c.first_name_enc),
      last_name: this.cryptoService.decrypt(c.last_name_enc),
      kyc_status: c.kyc_status,
      status: c.status,
    };
  }

  async findByEmail(email: string) {
    const hash = this.cryptoService.hash(email);

    const rows = await this.dataSource.query(
      `SELECT * FROM clients WHERE email_hash = ? LIMIT 1`,
      [hash],
    );

    if (!rows.length) return null;

    const c = rows[0];

    return {
      id: c.id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      status: c.status,
    };
  }

  async findByUsername(username: string) {
    const hash = this.cryptoService.hash(username);

    const rows = await this.dataSource.query(
      `SELECT * FROM clients WHERE username_hash = ? LIMIT 1`,
      [hash],
    );

    if (!rows.length) return null;

    const c = rows[0];

    return {
      id: c.id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      status: c.status,
    };
  }

  async findByLastName(lastName: string) {
    const hash = this.cryptoService.hash(lastName);

    const rows = await this.dataSource.query(
      `SELECT * FROM clients WHERE last_name_hash = ?`,
      [hash],
    );

    return rows.map((c: any) => ({
      id: c.id,
      username: this.cryptoService.decrypt(c.username_enc),
      email: this.cryptoService.decrypt(c.email_enc),
      account_number: this.cryptoService.decrypt(c.account_number_enc),
      last_name: this.cryptoService.decrypt(c.last_name_enc),
    }));
  }


  

}