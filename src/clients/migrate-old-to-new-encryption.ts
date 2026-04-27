import * as crypto from 'crypto';
import * as mysql from 'mysql2/promise';

// 🔑 KEYS (same as your system)
const ENC_KEY = Buffer.from('c1e5f7a2b9d8e6f3c4a1b2d3e4f56789aabbccddeeff00112233445566778899', 'hex');
const HMAC_KEY = Buffer.from('8899aabbccddeeff0011223344556677c1e5f7a2b9d8e6f3c4a1b2d3e4f56789', 'hex');

// 🔓 OLD DECRYPT (PHP format: IV + ciphertext)
function decryptOld(enc: string): string | null {
  try {
    const data = Buffer.from(enc, 'base64');
    const iv = data.subarray(0, 16);
    const ciphertext = data.subarray(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    return null;
  }
}

// 🔐 NEW ENCRYPT (Node format: IV + HMAC + ciphertext)
function encryptNew(text: string): string {
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

// 🧠 Detect if already new format (has HMAC)
function isNewFormat(enc: string): boolean {
  try {
    const data = Buffer.from(enc, 'base64');

    const iv = data.subarray(0, 16);
    const hmac = data.subarray(16, 48);
    const ciphertext = data.subarray(48);

    const calcHmac = crypto
      .createHmac('sha256', HMAC_KEY)
      .update(Buffer.concat([iv, ciphertext]))
      .digest();

    return crypto.timingSafeEqual(hmac, calcHmac);
  } catch {
    return false;
  }
}

async function migrate() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dream_virtual_account',
  });

  console.log('🚀 Starting migration...');

  const [rows]: any[] = await db.query(`
    SELECT id, email_enc, first_name_enc, middle_name_enc, last_name_enc
    FROM clients
  `);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      let updates: any = {};
      let shouldUpdate = false;

      const fields = ['email_enc', 'first_name_enc', 'middle_name_enc', 'last_name_enc'];

      for (const field of fields) {
        const value = row[field];

        if (!value) continue;

        // Skip if already new format
        if (isNewFormat(value)) {
          continue;
        }

        // Decrypt old
        const decrypted = decryptOld(value);
        if (!decrypted) {
          console.log(`⚠️ Failed to decrypt ${field} for ID ${row.id}`);
          failed++;
          continue;
        }

        // Re-encrypt new
        updates[field] = encryptNew(decrypted);
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        const setClause = Object.keys(updates)
          .map(key => `${key} = ?`)
          .join(', ');

        await db.query(
          `UPDATE clients SET ${setClause} WHERE id = ?`,
          [...Object.values(updates), row.id]
        );

        console.log(`✅ Migrated ID ${row.id}`);
        migrated++;
      } else {
        skipped++;
      }

    } catch (err) {
      console.log(`❌ Error on ID ${row.id}`, err);
      failed++;
    }
  }

  console.log('\n🎉 DONE');
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  await db.end();
}

migrate();