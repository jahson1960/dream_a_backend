import * as crypto from 'crypto';

const ENC_KEY = Buffer.from('c1e5f7a2b9d8e6f3c4a1b2d3e4f56789aabbccddeeff00112233445566778899', 'hex');
const HMAC_KEY = Buffer.from('8899aabbccddeeff0011223344556677c1e5f7a2b9d8e6f3c4a1b2d3e4f56789', 'hex');


const encrypted = "TTHafcibRDp1QD/ilISFwPOeT0Lrs9+gwokTVl7IZ8SpmRPDJWc1vQ5NwzILcOdGzsXzXJ272la4OrHq1LlfKA==";
console.log(decrypt(encrypted));

function decrypt(encrypted: string): string {
  const data = Buffer.from(encrypted, 'base64');

  const iv = data.slice(0, 16);
  const hmac = data.slice(16, 48);
  const ciphertext = data.slice(48);

  const calcHmac = crypto.createHmac('sha256', HMAC_KEY);
  calcHmac.update(Buffer.concat([iv, ciphertext]));
  if (!crypto.timingSafeEqual(hmac, calcHmac.digest())) return 'INVALID';

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}