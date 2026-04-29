import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly host = 'api.paystack.co';
  private readonly secret: string;
  private readonly callback_url = "http://localhost:3002/payments/verification"; 


  /*constructor(private dataSource: DataSource, private config: ConfigService) {
    this.secret = this.config.get<string>('PAYSTACK_SECRET_KEY') || '';
    if (!this.secret) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not set');
    }
  }*/
 
  //private hmacKey: Buffer;

  constructor(private dataSource: DataSource, 
    private config: ConfigService,
    private cryptoService: CryptoService) 
  {
    this.secret = this.config.get<string>('PAYSTACK_SECRET_KEY') || '';

    /*const hmacKey = this.config.get<string>('APP_HMAC_KEY');
    if (!hmacKey) {
      throw new Error('APP_HMAC_KEY is missing');
    }

    this.hmacKey = Buffer.from(hmacKey, 'hex');

    if (this.hmacKey.length < 32) {
      throw new Error('APP_HMAC_KEY must be at least 32 bytes');
    } */

    if (!this.secret) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not set');
    }
  }

  // SAME hashing logic as registration
  /* private hashData(value: string): string {
    return crypto
      .createHmac('sha256', this.hmacKey)
      .update(value.trim().toLowerCase())
      .digest('hex');
  } */

  

  private doRequest(options: https.RequestOptions, payload?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            this.logger.error('Failed to parse response', err as any);
            reject(err);
          }
        });
      });

      req.on('error', (err) => reject(err));
      if (payload) req.write(payload);
      req.end();
    });
  }

  /* async initializeWithValidation(payload: {
    reference: string;
    email: string;
    amount: number;
    currency_code: string;
    callback_url: string;
  }) {
    

    // Prepare Paystack initialize payload
    const params = JSON.stringify({
      reference: payload.reference,
      email: payload.email,
      amount: String(payload.amount),
      callback_url: payload.callback_url,
      currency: payload.currency_code,
    });

    const options = {
      hostname: this.host,
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secret}`,
        'Content-Type': 'application/json',
      },
    } as https.RequestOptions;

    const resp = await this.doRequest(options, params);

    // If Paystack returned success, persist initialize record
    if (resp && resp.status && resp.data && resp.data.reference) {
      try {
        await this.dataSource.query(
          `UPDATE initialized_transactions 
          SET access_code = ? 
          WHERE reference = ?`,
          [resp.data.access_code, resp.data.reference],
        );
      } catch (e) {
        this.logger.error('Failed inserting initialized_transactions', e as any);
        // don't fail the flow if DB insert fails - surface a 500
        throw new HttpException('Failed to record initialization', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return resp;
  }  */

  async verifyAndPersist(reference: string) {
    const path = `/transaction/verify/${encodeURIComponent(reference)}`;
    const options = {
      hostname: this.host,
      port: 443,
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secret}`,
      },
    } as https.RequestOptions;

    const resp = await this.doRequest(options);

    // Fetch initialized record (if any)
    const initRows = await this.dataSource.query(
      `SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1`,
      [reference],
    );
    const init = initRows && initRows.length ? initRows[0] : null;

    // Persist transaction row (paystack returns lots of fields; we store a subset + json fields)
    if (resp && resp.status && resp.data && resp.data.reference) {
      const d = resp.data;
      try {
        // Try inserting transaction; id from paystack is used as PK
        const insertSql = `INSERT INTO transactions (
          id, account_number, domain, status, reference, receipt_number, amount, message, gateway_response,
          paid_at, created_at, channel, currency, ip_address, metadata, log, authorization, customer_data, fees, requested_amount, transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await this.dataSource.query(insertSql, [
          d.id,
          init ? init.account_number : null,
          d.domain || null,
          d.status || null,
          d.reference || null,
          d.receipt_number || null,
          d.amount || null,
          d.message || null,
          d.gateway_response || null,
          d.paid_at ? new Date(d.paid_at) : null,
          d.created_at ? new Date(d.created_at) : null,
          d.channel || null,
          d.currency || null,
          d.ip_address || null,
          d.metadata ? JSON.stringify(d.metadata) : null,
          d.log ? JSON.stringify(d.log) : null,
          d.authorization ? JSON.stringify(d.authorization) : null,
          d.customer_data ? JSON.stringify(d.customer_data) : null,
          d.fees || null,
          d.requested_amount || null,
          d.transaction_date ? new Date(d.transaction_date) : null,
        ]);
      } catch (e: any) {
        this.logger.error('Failed inserting transaction: ' + (e && e.message ? e.message : String(e)));
        if (e && e.stack) this.logger.debug(e.stack);
        // continue; maybe duplicate insert or schema mismatch
      }

      // If success, insert ledger entry credit
      if (d.status === 'success') {
        try {
          await this.dataSource.query(
            `INSERT INTO ledger_entries (account_number, debit, credit, reference, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [init ? init.account_number : null, 0.0, d.amount || 0, d.reference || null],
          );
        } catch (e) {
          this.logger.error('Failed inserting ledger entry', e as any);
        }
      }
    }

    //return resp;
    return {
      ...resp, // Spreads Paystack's { status: true, message: "...", data: {...} }
      client_callback_url: init ? init.client_callback_url : null
    };

  }

  async verifyAndPersist_Flutterwave_OLD_NOT_TESTED(reference: string) {
    const path = `/transaction/verify/${encodeURIComponent(reference)}`;
    const options = {
      hostname: this.host,
      port: 443,
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secret}`,
      },
    } as https.RequestOptions;

    const resp = await this.doRequest(options);

    // Fetch initialized record (if any)
    const initRows = await this.dataSource.query(
      `SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1`,
      [reference],
    );
    const init = initRows && initRows.length ? initRows[0] : null;

    // Persist transaction row (paystack returns lots of fields; we store a subset + json fields)
    if (resp && resp.status && resp.data && resp.data.reference) {
      const d = resp.data;
      try {
        // Try inserting transaction; id from paystack is used as PK
        const insertSql = `INSERT INTO transactions (
          id, account_number, domain, status, reference, receipt_number, amount, message, gateway_response,
          paid_at, created_at, channel, currency, ip_address, metadata, log, authorization, customer_data, fees, requested_amount, transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await this.dataSource.query(insertSql, [
          d.id,
          init ? init.account_number : null,
          d.domain || null,
          d.status || null,
          d.reference || null,
          d.receipt_number || null,
          d.amount || null,
          d.message || null,
          d.gateway_response || null,
          d.paid_at ? new Date(d.paid_at) : null,
          d.created_at ? new Date(d.created_at) : null,
          d.channel || null,
          d.currency || null,
          d.ip_address || null,
          d.metadata ? JSON.stringify(d.metadata) : null,
          d.log ? JSON.stringify(d.log) : null,
          d.authorization ? JSON.stringify(d.authorization) : null,
          d.customer_data ? JSON.stringify(d.customer_data) : null,
          d.fees || null,
          d.requested_amount || null,
          d.transaction_date ? new Date(d.transaction_date) : null,
        ]);
      } catch (e: any) {
        this.logger.error('Failed inserting transaction: ' + (e && e.message ? e.message : String(e)));
        if (e && e.stack) this.logger.debug(e.stack);
        // continue; maybe duplicate insert or schema mismatch
      }

      // If success, insert ledger entry credit
      if (d.status === 'success') {
        try {
          await this.dataSource.query(
            `INSERT INTO ledger_entries (account_number, debit, credit, reference, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [init ? init.account_number : null, 0.0, d.amount || 0, d.reference || null],
          );
        } catch (e) {
          this.logger.error('Failed inserting ledger entry', e as any);
        }
      }
    }

    //return resp;
    return {
      ...resp, // Spreads Paystack's { status: true, message: "...", data: {...} }
      client_callback_url: init ? init.client_callback_url : null
    };

  }

  async validateAndCreateReference(
    //api_key: string,
    username: string,
    account_number: string,
    email: string,
    amount: number,
    currency_code: string,
    country_code: string,
    client_callback_url: string,
  ) {
    // Validate fields (same as your existing logic)
    /* const required = ['api_key', 'username', 'account_number', 'email', 'amount', 'currency_code', 'country_code', 'client_callback_url'];
    for (const k of required) {
      if (!payload[k as keyof typeof payload]) {
        throw new HttpException(`${k} is required`, HttpStatus.BAD_REQUEST);
      }
    } */

    // Create payload object
    const payload = {
      //api_key,
      username,
      account_number,
      email,
      amount,
      currency_code,
      country_code,
      client_callback_url,
    };

    // Validate fields
    const required: (keyof typeof payload)[] = [
      //'api_key',
      'username',
      'account_number',
      'email',
      'amount',
      'currency_code',
      'country_code',
      'client_callback_url'
    ];

    for (const k of required) {
      const value = payload[k];

      if (value === undefined || value === null || value === '') {
        throw new HttpException(`${k} is required`, HttpStatus.BAD_REQUEST);
      }
    }


    // Validate Api Key
    /*const apiClientRows = await this.dataSource.query(
      `SELECT api_key FROM api_clients WHERE api_key = ?`,
      [api_key],
    );
    if (!apiClientRows.length) {
      throw new HttpException('Invalid API Key', HttpStatus.BAD_REQUEST);
    }*/

    // Validate currency
    const currencyRows = await this.dataSource.query(
      `SELECT id FROM supported_currencies WHERE code = ?`,
      [currency_code],
    );
    if (!currencyRows.length) {
      throw new HttpException('Unsupported currency', HttpStatus.BAD_REQUEST);
    }

    // Hash inputs
    /* const accountNumberHash = crypto
      .createHash('sha256')
      .update(account_number)
      .digest('hex');

    const usernameHash = crypto
      .createHash('sha256')
      .update(username.toLowerCase())
      .digest('hex'); */

    /*const accountNumberHash = this.hashData(account_number);
    const usernameHash = this.hashData(username);
    const emailHash = this.hashData(email); */

    const accountNumberHash = this.cryptoService.hash(account_number);
    const usernameHash = this.cryptoService.hash(username);
    const emailHash = this.cryptoService.hash(email);

    // Validate user
    const clientRows = await this.dataSource.query(
      `SELECT username_hash, email_hash FROM clients WHERE account_number_hash = ?`,
      [accountNumberHash],
    );

    if (!clientRows.length) {
      throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
    }

    const client = clientRows[0];
    //const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');

    if (client.username_hash !== usernameHash || client.email_hash !== emailHash) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    /*if (client.email_hash !== emailHash) {
      throw new HttpException('Invalid email: Account Number and Email did not match', HttpStatus.BAD_REQUEST);
    }*/

    // ✅ Generate your own reference
    const reference = 'REF_' + account_number + Date.now() + amount + Math.floor(Math.random() * 1000);

    // Save WITHOUT Gateway
    await this.dataSource.query(
      `INSERT INTO initialized_transactions 
      (email, account_number, amount, currency_code, reference, client_callback_url, gateway_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        email,
        account_number,
        amount,
        currency_code,
        reference,
        client_callback_url,
        1,
      ],
    );

    return {
      status: 'success',
      reference,
    };
  }

  async performTransaction(//api_key: string, 
    reference: string) {
    // Validate Api Key
    /*const apiClientRows = await this.dataSource.query(
      `SELECT api_key FROM api_clients WHERE api_key = ?`,
      [api_key],
    );
    if (!apiClientRows.length) {
      throw new HttpException('Invalid API Key', HttpStatus.BAD_REQUEST);
    }*/

    const rows = await this.dataSource.query(
      `SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1`,
      [reference],
    );

    if (!rows.length) {
      throw new HttpException('Invalid reference', HttpStatus.BAD_REQUEST);
    }

    const trx = rows[0];

    const params = JSON.stringify({
      email: trx.email,
      amount: String(trx.amount),
      callback_url: this.callback_url,
      currency: trx.currency_code,
      reference: reference,
    });

    const options = {
      hostname: this.host,
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secret}`,
        'Content-Type': 'application/json',
      },
    };

    const resp = await this.doRequest(options, params);

    if (resp?.status && resp?.data?.authorization_url) {
      await this.dataSource.query(
        `UPDATE initialized_transactions SET access_code = ? WHERE reference = ?`,
        [resp.data.access_code, reference],
      );

      return {
        status: true,
        checkout_url: resp.data.authorization_url,
      };
    }

    return {
      status: false,
      message: 'Initialization failed',
      raw: resp,
    };
  }

   async handleVerifyResponse(reference: string) {
    try {
      const resp = await this.verifyAndPersist(reference);

      const statusStr = resp && resp.data && resp.data.status === 'success' ? 'successful' : 'failed';
      const email = resp && resp.data && resp.data.customer ? resp.data.customer.email : null;
      const amount = resp && resp.data ? resp.data.amount : null;
      const currency = resp && resp.data ? resp.data.currency : null;

      // Attempt to find account_number/username from initialized_transactions
      let account_number = null;
      let username = null;
      try {
        const rows = await (this as any).paymentsService.dataSource.query(
          `SELECT account_number FROM initialized_transactions WHERE reference = ? LIMIT 1`,
          [reference],
        );
        if (rows && rows.length) account_number = rows[0].account_number;

        if (account_number) {
          const clientRows = await (this as any).paymentsService.dataSource.query(
            `SELECT username FROM clients WHERE account_number = ? LIMIT 1`,
            [account_number],
          );
          if (clientRows && clientRows.length) username = clientRows[0].username;
        }
      } catch (e) {
        // ignore DB read errors here
      }

      return {
        status: statusStr,
        account_number,
        username,
        email,
        amount,
        currency,
        raw: resp,
      };
    } catch (err) {
      throw new HttpException('Paystack verification failed', HttpStatus.BAD_GATEWAY);
    }
  }

  async verifyTransaction(//api_key: string, 
    reference: string) {
    // Validate Api Key
    /*const apiClientRows = await this.dataSource.query(
      `SELECT api_key FROM api_clients WHERE api_key = ?`,
      [api_key],
    );
    if (!apiClientRows.length) {
      throw new HttpException('Invalid API Key', HttpStatus.BAD_REQUEST);
    } */

    // Fetch Transaction
    const transactionRows = await this.dataSource.query(
      `SELECT * FROM transactions WHERE reference = ? LIMIT 1`,
      [reference]
    );
    if (!transactionRows.length) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

      const transaction = transactionRows[0]; // ✅ FIX


    return {
      status: transaction.status,
      account_number: transaction.account_number,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      transaction_date: transaction.transaction_date,
      customer_data: typeof transaction.customer_data === 'string'
        ? JSON.parse(transaction.customer_data)
        : transaction.customer_data,
    };
 
  }

  async listClientTransactions(
    account_number: string,
    start_date?: string,
    end_date?: string,
  ) {
    const accountHash = this.cryptoService.hash(account_number);

    const clientRows = await this.dataSource.query(
      `SELECT account_number FROM clients WHERE account_number_hash = ? LIMIT 1`,
      [accountHash],
    );

    if (!clientRows.length) {
      throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
    }

    //const acct = clientRows[0].account_number;

    let query = `
      SELECT * FROM transactions 
      WHERE account_number = ?
    `;
    const params: any[] = [account_number];

    if (start_date && end_date) {
      query += ` AND transaction_date BETWEEN ? AND ? + INTERVAL 1 DAY`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY transaction_date DESC`;

    return await this.dataSource.query(query, params);
  }

  async clientTotalDeposits(account_number: string) {
    const accountHash = this.cryptoService.hash(account_number);

    const clientRows = await this.dataSource.query(
      `SELECT * FROM clients WHERE account_number_hash = ? LIMIT 1`,
      [accountHash],
    );

    if (!clientRows.length) {
      throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
    }

    //const acct = clientRows[0].account_number;

    const rows = await this.dataSource.query(
      `SELECT SUM(amount) as total 
      FROM transactions 
      WHERE account_number = ? AND status = 'successful'`,
      [account_number],
    );

    return {
      account_number,
      total_deposits: rows[0]?.total || 0,
    };
  }
    
  async listAllTransactions(start_date?: string, end_date?: string) {
    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params: any[] = [];

    if (start_date && end_date) {
      query += ` AND transaction_date BETWEEN ? AND ? + INTERVAL 1 DAY`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY transaction_date DESC`;

    return await this.dataSource.query(query, params);
  }

  async cumulativeDeposits() {
    const rows = await this.dataSource.query(
      `SELECT SUM(amount) as total 
      FROM transactions 
      WHERE status = 'successful'`,
    );

    return {
      total_deposits: rows[0]?.total || 0,
    };
  }

  async cumulativeDepositsByDateRange(start_date: string, end_date: string) {
    const rows = await this.dataSource.query(
      `SELECT SUM(amount) as total 
      FROM transactions 
      WHERE status = 'successful'
      AND transaction_date BETWEEN ? AND ? + INTERVAL 1 DAY`,
      [start_date, end_date],
    );

    return {
      start_date,
      end_date,
      total_deposits: rows[0]?.total || 0,
    };
  }

  async listTransactionByReference(reference: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM transactions WHERE reference = ? LIMIT 1`,
      [reference],
    );

    if (!rows.length) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    return rows[0];
  }

  async getCustomerBalance(account_number: string) {
    if (!account_number) {
      throw new HttpException('account_number is required', HttpStatus.BAD_REQUEST);
    }

    const rows = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(credit), 0) AS total_credit,
        COALESCE(SUM(debit), 0) AS total_debit,
        COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0) AS balance
      FROM ledger_entries
      WHERE account_number = ?
      `,
      [account_number],
    );

    const result = rows[0];

    return {
      account_number,
      total_credit: Number(result.total_credit),
      total_debit: Number(result.total_debit),
      balance: Number(result.balance),
    };
  }

  async getCumulativeBalance() {
    const rows = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(credit), 0) AS total_credit,
        COALESCE(SUM(debit), 0) AS total_debit,
        COALESCE(SUM(credit), 0) - COALESCE(SUM(debit), 0) AS balance
      FROM ledger_entries
      `,
    );

    const result = rows[0];

    return {
      total_credit: Number(result.total_credit),
      total_debit: Number(result.total_debit),
      balance: Number(result.balance),
    };
  }


  async performTransaction_flutterwave(reference: string) {
    const rows = await this.dataSource.query(
      `SELECT *, email AS customer_email,
      reference AS tx_ref
      FROM initialized_transactions WHERE reference = ? LIMIT 1`,
      [reference],
    );

    if (!rows.length) {
      return {
        status: false,
        message: 'Invalid reference',
      };
    }

    const trx = rows[0];

    return {
      status: true,
      data: {
        tx_ref: reference,
        amount: Number(trx.amount),
        currency: trx.currency_code,
        payment_options: "card, banktransfer, ussd",
        meta: {
          source: "api-service",
        },
        customer: {
          email: trx.email,
          phone_number: trx.phone,
          name: trx.name,
        },
        customizations: {
          title: "My Store",
          description: "Payment",
        },
      },
    };
 }

 async getPaymentConfig(reference: string) {
  const rows = await this.dataSource.query(
    `SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1`,
    [reference],
  );

  if (!rows.length) {
    throw new HttpException('Invalid reference', HttpStatus.BAD_REQUEST);
  }

  const trx = rows[0];

  return {
    status: true,
    data: {
      tx_ref: reference, // 🔥 IMPORTANT: use your DB reference
      amount: Number(trx.amount),
      currency: trx.currency_code,
      payment_options: "card, banktransfer, ussd",
      meta: {
        source: "api-service",
      },
      customer: {
        email: trx.email,
        phone_number: trx.phone,
        name: trx.name,
      },
      customizations: {
        title: "My Store",
        description: "Payment",
      },
    },
  };
}

async verifyFlutterwavePayment(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get initialized transaction
      const [initTx] = await queryRunner.query(
        `SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1 FOR UPDATE`,
        [data.tx_ref]
      );

      if (!initTx) {
        throw new Error("Original transaction not found");
      }

      // 2. Idempotency check - Prevent double processing
      const [existing] = await queryRunner.query(
        `SELECT id FROM transactions WHERE reference = ? LIMIT 1`,
        [data.tx_ref]
      );

      if (existing) {
        // already processed — DO NOT CREDIT AGAIN
        await queryRunner.rollbackTransaction();

        return {
          success: true,
          message: "Already processed",
          client_callback_url: initTx.client_callback_url
        };
      }

      // 3. Flutterwave verification
      const Flutterwave = require("flutterwave-node-v3");
      const flw = new Flutterwave(
        process.env.FLW_PUBLIC_KEY,
        process.env.FLW_SECRET_KEY
      );

      const response = await flw.Transaction.verify({
        id: data.transaction_id,
      });

      const flwData = response.data;

      // 4. Normalize values (VERY IMPORTANT)
      const flwAmount = Number(flwData.amount);
      const dbAmount = Number(initTx.amount);

      const flwCurrency = flwData.currency;
      const dbCurrency = initTx.currency_code;

      // 5. Validate payment
      if (flwData.status !== "successful") {
        throw new Error("Payment not successful");
      }

      if (flwAmount !== dbAmount) {
        throw new Error(
          `Amount mismatch: FLW=${flwAmount}, DB=${dbAmount}`
        );
      }

      if (flwCurrency !== dbCurrency) {
        throw new Error(
          `Currency mismatch: FLW=${flwCurrency}, DB=${dbCurrency}`
        );
      }

      const accountNumber = initTx.account_number;

      // 6. Ledger entry
      await queryRunner.query(
        `INSERT INTO ledger_entries 
          (account_number, debit, credit, reference, created_at)
        VALUES (?, 0, ?, ?, NOW())`,
        [accountNumber, flwAmount, data.tx_ref]
      );

      // 7. Transactions table
      const insertSql = `
        INSERT INTO transactions (
          id,
          account_number,
          domain,
          status,
          reference,
          gateway_reference,
          amount,
          message,
          gateway_response,
          paid_at,
          created_at,
          channel,
          currency,
          ip_address,
          metadata,
          log,
          authorization,
          customer_data,
          fees,
          requested_amount,
          transaction_date
        ) VALUES (
          ?, ?, 'test', ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, '0.0.0.0', ?, ?, ?, ?, 0, ?, NOW()
        )
        `;
      await queryRunner.query(insertSql, [
        flwData.id,                        // id
        accountNumber,                     // account_number
        flwData.status,                    // status
        flwData.tx_ref,                    // reference
        flwData.flw_ref,                   // gateway_reference
        flwAmount,                        // amount
        flwData.processor_response || "", // message
        flwData.gateway_response || "",   // gateway_response
        flwData.payment_type,             // channel
        flwCurrency,                      // currency
        JSON.stringify(initTx.metadata || {}),
        JSON.stringify([]),
        JSON.stringify(flwData.authorization || {}),
        JSON.stringify(flwData.customer || {}),
        dbAmount
      ]);

      // 8. Mark as completed
      await queryRunner.query(
        `UPDATE initialized_transactions 
        SET status = 'completed' 
        WHERE reference = ?`,
        [data.tx_ref]
      );

      // 9. Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Payment verified and recorded successfully",
          client_callback_url: initTx.client_callback_url
      };
    } catch (err: any) {
      // rollback on ANY error
      await queryRunner.rollbackTransaction();

      console.error("Flutterwave verification failed:", err.message);

      return {
        success: false,
        message: err.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  
}