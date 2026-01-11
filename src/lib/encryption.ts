import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Use a consistent secret for the demo. In production, this must be in .env
// Ensure this key is exactly 32 bytes for aes-256-gcm
const SECRET_KEY =
  process.env.VAULT_SECRET || "fortress-notes-secure-key-32-byte";

// If the env var is not 32 bytes, we pad or truncate (for demo purposes)
// In production, simpler to just enforce .env length.
const getKey = () => {
  return Buffer.from(SECRET_KEY.padEnd(32, "0").slice(0, 32));
};

export function encrypt(text: string): string {
  const iv = randomBytes(12); // GCM standard IV size
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  // Handle unencrypted legacy data gracefully (if any)
  if (!text.includes(":")) return text;

  const [ivHex, authTagHex, encryptedHex] = text.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) return text;

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "[Encrypted Content - Decryption Failed]";
  }
}
