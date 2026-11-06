import { createHmac, randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** TOTP RFC 6238 memakai HMAC-SHA1 tanpa dependensi tambahan. */
export function generateTotpSecret(bytes = 20) {
  const buffer = randomBytes(bytes);
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let secret = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) secret += ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  return secret;
}

function base32Decode(secret: string) {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) bits += ALPHABET.indexOf(char).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totpCode(secret: string, forTime = Date.now(), step = 30, digits = 6) {
  const counter = Math.floor(forTime / 1000 / step);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buffer.writeUInt32BE(counter % 2 ** 32, 4);
  const digest = createHmac("sha1", base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, "0");
}

/** Menerima satu langkah waktu sebelum/sesudah agar jam klien tidak harus presisi. */
export function verifyTotp(secret: string, code: string, window = 1) {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return false;
  for (let offset = -window; offset <= window; offset++) {
    if (totpCode(secret, Date.now() + offset * 30_000) === clean) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, account: string, issuer = "UMKM-AI") {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}