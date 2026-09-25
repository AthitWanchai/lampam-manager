import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const keyFromEnv = () => {
  const value = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!value) throw new Error("META_TOKEN_ENCRYPTION_KEY ยังไม่ได้ตั้งค่า");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("META_TOKEN_ENCRYPTION_KEY ต้องเป็น base64 ของ 32 bytes");
  return key;
};

/** เก็บ token เป็น ciphertext ฝั่งเซิร์ฟเวอร์เท่านั้น ห้ามเรียกจาก Client Component */
export function encryptSecret(value: string) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", keyFromEnv(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  const [ivText, tagText, dataText] = value.split(".");
  if (!ivText || !tagText || !dataText) throw new Error("รูปแบบ secret ที่เข้ารหัสไม่ถูกต้อง");
  const decipher = createDecipheriv("aes-256-gcm", keyFromEnv(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataText, "base64url")), decipher.final()]).toString("utf8");
}
