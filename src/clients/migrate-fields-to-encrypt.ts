import 'dotenv/config';
import * as crypto from 'crypto';
import * as mysql from 'mysql2/promise';

// 🔑 Load keys
//const ENC_KEY = Buffer.from(process.env.APP_ENCRYPTION_KEY!, 'hex');
//const HMAC_KEY = Buffer.from(process.env.APP_HMAC_KEY!, 'hex');

const ENC_KEY = Buffer.from('c1e5f7a2b9d8e6f3c4a1b2d3e4f56789aabbccddeeff00112233445566778899', 'hex');
const HMAC_KEY = Buffer.from('8899aabbccddeeff0011223344556677c1e5f7a2b9d8e6f3c4a1b2d3e4f56789', 'hex');


// 🔐 Encrypt
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const hmac = crypto
    .createHmac('sha256', HMAC_KEY)
    .update(Buffer.concat([iv, encrypted]))
    .digest();

  return Buffer.concat([iv, hmac, encrypted]).toString('base64');
}

// 🔍 Hash
function hash(text: string): string {
  return crypto
    .createHmac('sha256', HMAC_KEY)
    .update(text.toLowerCase())
    .digest('hex');
}

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dream_virtual_account',
  });

  console.log('🚀 Starting migration...');

  // 🔍 Get only unmigrated users
  const [rows]: any[] = await connection.query(`
    SELECT id, username, account_number
    FROM clients
    WHERE username_hash IS NULL
       OR account_number_hash IS NULL
  `);

  console.log(`Found ${rows.length} users to migrate`);

  for (const user of rows) {
    try {
      const username_enc = encrypt(user.username);
      const username_hash = hash(user.username);

      const account_enc = encrypt(user.account_number);
      const account_hash = hash(user.account_number);

      await connection.query(
        `
        UPDATE clients SET
          username_enc = ?,
          username_hash = ?,
          account_number_enc = ?,
          account_number_hash = ?
        WHERE id = ?
        `,
        [
          username_enc,
          username_hash,
          account_enc,
          account_hash,
          user.id,
        ]
      );

      console.log(`✅ Migrated user ID: ${user.id}`);
    } catch (err) {
      console.error(`❌ Failed for ID ${user.id}`, err);
    }
  }

  await connection.end();

  console.log('🎉 Migration complete');
}

migrate().catch(console.error);