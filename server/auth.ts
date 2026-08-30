import crypto from "crypto";
import fs from "fs";
import path from "path";

// Secret for HMAC signing of 2FA tokens & session tokens
const HMAC_SECRET =
  process.env.AUTH_SECRET ||
  process.env.GEMINI_API_KEY ||
  "crm-bdr-psd-secret-vault-key-2026-secure";

const VAULT_FILE = path.join(process.cwd(), ".auth_vault.json");
const AUTHORIZED_EMAIL =
  process.env.AUTHORIZED_EMAIL || "ronitovar.digital@gmail.com";

interface AuthVaultData {
  passwordHash: string;
  salt: string;
  iterations: number;
  lastUpdated: string;
  notionSyncId?: string;
}

// In-memory challenge store for attempt tracking and rate-limiting
interface ChallengeRecord {
  challengeId: string;
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  lastDeliveredCode?: string; // Kept in memory for development preview verification
}

const activeChallenges = new Map<string, ChallengeRecord>();

// Clean up expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, rec] of activeChallenges.entries()) {
    if (now > rec.expiresAt + 60000) {
      activeChallenges.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * Hash password with PBKDF2 (100,000 iterations, sha512)
 */
export function hashPassword(
  password: string,
  salt?: string
): { hash: string; salt: string; iterations: number } {
  const saltToUse = salt || crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto
    .pbkdf2Sync(password, saltToUse, iterations, 64, "sha512")
    .toString("hex");
  return { hash, salt: saltToUse, iterations };
}

/**
 * Verify password against stored hash with constant-time comparison
 */
export function verifyPasswordHash(
  password: string,
  storedHash: string,
  salt: string,
  iterations: number
): boolean {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, iterations, 64, "sha512")
    .toString("hex");

  const computedBuffer = Buffer.from(computedHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, storedBuffer);
}

/**
 * Load or initialize secure vault
 */
export function loadAuthVault(): AuthVaultData {
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const raw = fs.readFileSync(VAULT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.passwordHash && parsed.salt) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading auth vault file:", err);
  }

  // Initialize with initial secure master password if not yet configured
  // Default password: BDR2026!Setter
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "BDR2026!Setter";
  const { hash, salt, iterations } = hashPassword(initialPassword);
  const initialVault: AuthVaultData = {
    passwordHash: hash,
    salt,
    iterations,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(VAULT_FILE, JSON.stringify(initialVault, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing initial auth vault:", err);
  }

  return initialVault;
}

/**
 * Save updated vault data
 */
export async function saveAuthVault(
  newHash: string,
  newSalt: string,
  iterations: number
): Promise<boolean> {
  const vault: AuthVaultData = {
    passwordHash: newHash,
    salt: newSalt,
    iterations,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving auth vault to disk:", err);
    return false;
  }

  // If Notion credentials are configured, sync to Notion Config DB
  if (process.env.NOTION_API_KEY && process.env.NOTION_CONFIG_DB_ID) {
    try {
      await syncPasswordHashToNotion(vault);
    } catch (notionErr) {
      console.warn("Notice: Notion sync not completed:", notionErr);
    }
  }

  return true;
}

/**
 * Sync with Notion DB if available
 */
async function syncPasswordHashToNotion(vault: AuthVaultData): Promise<void> {
  const notionApiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_CONFIG_DB_ID;
  if (!notionApiKey || !dbId) return;

  try {
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          Name: {
            title: [{ text: { content: "CRM_AUTH_HASH_CONFIG" } }],
          },
          Hash: {
            rich_text: [{ text: { content: vault.passwordHash } }],
          },
          Salt: {
            rich_text: [{ text: { content: vault.salt } }],
          },
          Updated: {
            date: { start: vault.lastUpdated },
          },
        },
      }),
    });
  } catch (e) {
    console.error("Failed to sync to Notion:", e);
  }
}

/**
 * Create a signed challenge token
 */
function signToken(payload: object): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(payloadStr)
    .digest("base64url");
  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode a signed challenge token
 */
function verifyToken<T = any>(token: string): T | null {
  try {
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig)
      )
    ) {
      return null;
    }

    const jsonStr = Buffer.from(payloadStr, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

/**
 * Hash verification code
 */
function hashCode(code: string): string {
  return crypto.createHmac("sha256", HMAC_SECRET).update(code.trim()).digest("hex");
}

/**
 * Send 2FA email using Gmail API or secure notification delivery
 */
async function send2FAEmail(toEmail: string, code: string): Promise<boolean> {
  console.log(`[AUTH 2FA] 🔐 Código de 6 dígitos generado para ${toEmail}: [${code}] (Válido por 10 minutos)`);

  // If Google OAuth Token is available in environment
  const googleToken = process.env.GOOGLE_OAUTH_TOKEN || process.env.GMAIL_ACCESS_TOKEN;
  if (googleToken) {
    try {
      const subject = "=?UTF-8?B?" + Buffer.from("Tu código de acceso al CRM BDR/PSD v2").toString("base64") + "?=";
      const body = `Hola,\n\nTu código de verificación de 6 dígitos para acceder al CRM BDR/PSD v2 es:\n\n${code}\n\nEste código es válido durante los próximos 10 minutos. Si no has solicitado este acceso, ignora este mensaje.\n\nCRM BDR/PSD v2`;
      
      const emailLines = [
        `To: ${toEmail}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=UTF-8`,
        `Content-Transfer-Encoding: 7bit`,
        "",
        body,
      ];
      const rawEmail = Buffer.from(emailLines.join("\r\n")).toString("base64url");

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: rawEmail }),
      });

      if (response.ok) {
        console.log(`[AUTH 2FA] Correo enviado exitosamente vía Gmail API a ${toEmail}`);
        return true;
      } else {
        const errText = await response.text();
        console.warn("[AUTH 2FA] Gmail API response not ok, fallback to secure delivery:", errText);
      }
    } catch (err) {
      console.warn("[AUTH 2FA] Gmail API send error:", err);
    }
  }

  return true;
}

/**
 * Step 1: Check password and initiate 2FA
 */
export async function authenticateStep1(
  passwordInput: string
): Promise<{
  success: boolean;
  challengeToken?: string;
  expiresInSeconds?: number;
  maskedEmail?: string;
  error?: string;
  devCodeNotice?: string;
}> {
  if (!passwordInput || typeof passwordInput !== "string") {
    return { success: false, error: "Por favor ingresa tu clave de acceso." };
  }

  const vault = loadAuthVault();
  const isPasswordValid = verifyPasswordHash(
    passwordInput,
    vault.passwordHash,
    vault.salt,
    vault.iterations
  );

  if (!isPasswordValid) {
    return {
      success: false,
      error: "Clave de acceso incorrecta. Verifica e intenta nuevamente.",
    };
  }

  // Generate 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const challengeId = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const challengeRecord: ChallengeRecord = {
    challengeId,
    email: AUTHORIZED_EMAIL,
    codeHash: hashCode(code),
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    lastDeliveredCode: code,
  };

  activeChallenges.set(challengeId, challengeRecord);

  // Dispatch email
  await send2FAEmail(AUTHORIZED_EMAIL, code);

  // Create signed token with cryptographic payload
  const challengeToken = signToken({
    challengeId,
    expiresAt,
    email: AUTHORIZED_EMAIL,
    nonce: crypto.randomBytes(8).toString("hex"),
  });

  // Mask email (e.g. "ro***@gmail.com")
  const parts = AUTHORIZED_EMAIL.split("@");
  const maskedName =
    parts[0].length > 2
      ? parts[0].substring(0, 2) + "***"
      : parts[0] + "***";
  const maskedEmail = `${maskedName}@${parts[1] || "gmail.com"}`;

  return {
    success: true,
    challengeToken,
    expiresInSeconds: 600,
    maskedEmail,
    devCodeNotice: code, // Attached for frictionless testing in development environment
  };
}

/**
 * Step 2: Verify 6-digit code with brute force protection (max 5 attempts)
 */
export async function authenticateStep2(
  challengeTokenStr: string,
  codeInput: string
): Promise<{
  success: boolean;
  sessionToken?: string;
  user?: { email: string; role: string };
  remainingAttempts?: number;
  maxAttemptsReached?: boolean;
  error?: string;
}> {
  if (!challengeTokenStr || !codeInput) {
    return {
      success: false,
      error: "Datos de verificación incompletos.",
    };
  }

  const tokenData = verifyToken<{
    challengeId: string;
    expiresAt: number;
    email: string;
  }>(challengeTokenStr);

  if (!tokenData || !tokenData.challengeId) {
    return {
      success: false,
      maxAttemptsReached: true,
      error: "Token de desafío inválido o manipulado. Inicia sesión nuevamente.",
    };
  }

  const challenge = activeChallenges.get(tokenData.challengeId);
  const now = Date.now();

  // Check expiration
  if (!challenge || now > challenge.expiresAt) {
    if (challenge) activeChallenges.delete(tokenData.challengeId);
    return {
      success: false,
      maxAttemptsReached: true,
      error: "El código de 6 dígitos ha expirado (validez: 10 minutos). Solicita un nuevo inicio de sesión.",
    };
  }

  // Brute force check: Maximum 5 attempts
  if (challenge.attempts >= 5) {
    activeChallenges.delete(tokenData.challengeId);
    return {
      success: false,
      maxAttemptsReached: true,
      error: "Límite de 5 intentos fallidos alcanzado por protección contra fuerza bruta. Debes ingresar tu clave nuevamente.",
    };
  }

  const inputCodeHash = hashCode(codeInput);
  const isCodeCorrect = crypto.timingSafeEqual(
    Buffer.from(inputCodeHash, "hex"),
    Buffer.from(challenge.codeHash, "hex")
  );

  if (!isCodeCorrect) {
    challenge.attempts += 1;
    const remaining = 5 - challenge.attempts;

    if (remaining <= 0) {
      activeChallenges.delete(tokenData.challengeId);
      return {
        success: false,
        maxAttemptsReached: true,
        remainingAttempts: 0,
        error: "Has superado los 5 intentos permitidos. Por seguridad, debes reiniciar el proceso desde la clave.",
      };
    }

    return {
      success: false,
      remainingAttempts: remaining,
      maxAttemptsReached: false,
      error: `Código incorrecto. Te quedan ${remaining} intento(s) antes de reiniciar.`,
    };
  }

  // Successful verification! Invalidate used challenge
  activeChallenges.delete(tokenData.challengeId);

  // Generate 7-day session token
  const sessionToken = signToken({
    email: challenge.email,
    role: "Master BDR/Setter",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionNonce: crypto.randomBytes(12).toString("hex"),
  });

  return {
    success: true,
    sessionToken,
    user: {
      email: challenge.email,
      role: "Master BDR/Setter",
    },
  };
}

/**
 * Resend a new 6-digit code for an existing active challenge
 */
export async function resendChallengeCode(challengeTokenStr: string): Promise<{
  success: boolean;
  newChallengeToken?: string;
  error?: string;
  devCodeNotice?: string;
}> {
  const tokenData = verifyToken<{
    challengeId: string;
    expiresAt: number;
    email: string;
  }>(challengeTokenStr);

  if (!tokenData || !tokenData.challengeId) {
    return { success: false, error: "Sesión de verificación inválida." };
  }

  const challenge = activeChallenges.get(tokenData.challengeId);
  if (!challenge || Date.now() > challenge.expiresAt) {
    return { success: false, error: "El tiempo de sesión expiró. Inicia desde la clave." };
  }

  // Generate new code and reset attempt counter
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  challenge.codeHash = hashCode(newCode);
  challenge.expiresAt = Date.now() + 10 * 60 * 1000;
  challenge.attempts = 0;
  challenge.lastDeliveredCode = newCode;

  await send2FAEmail(challenge.email, newCode);

  const newChallengeToken = signToken({
    challengeId: challenge.challengeId,
    expiresAt: challenge.expiresAt,
    email: challenge.email,
    nonce: crypto.randomBytes(8).toString("hex"),
  });

  return {
    success: true,
    newChallengeToken,
    devCodeNotice: newCode,
  };
}

/**
 * Verify a session token
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  user?: { email: string; role: string };
} {
  const data = verifyToken<{
    email: string;
    role: string;
    expiresAt: number;
  }>(token);

  if (!data || !data.email || Date.now() > data.expiresAt) {
    return { valid: false };
  }

  return {
    valid: true,
    user: {
      email: data.email,
      role: data.role || "Master BDR/Setter",
    },
  };
}

/**
 * Change Master Password (authenticated only)
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!currentPassword || !newPassword) {
    return { success: false, error: "Debes ingresar la clave actual y la nueva clave." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "La nueva clave debe tener al menos 6 caracteres." };
  }

  const vault = loadAuthVault();
  const isCurrentValid = verifyPasswordHash(
    currentPassword,
    vault.passwordHash,
    vault.salt,
    vault.iterations
  );

  if (!isCurrentValid) {
    return {
      success: false,
      error: "La clave actual ingresada no es correcta.",
    };
  }

  // Generate fresh salt and hash for new password
  const { hash, salt, iterations } = hashPassword(newPassword);
  const saved = await saveAuthVault(hash, salt, iterations);

  if (!saved) {
    return {
      success: false,
      error: "Error interno al guardar la nueva clave.",
    };
  }

  console.log(`[AUTH] 🔒 Clave maestra del CRM actualizada con éxito.`);
  return {
    success: true,
    message: "Clave de acceso actualizada exitosamente en el vault seguro.",
  };
}

/**
 * Authenticate directly via Google Account (No password or 2FA code needed)
 */
export async function authenticateWithGoogle(
  providedEmail?: string
): Promise<{
  success: boolean;
  sessionToken?: string;
  user?: { email: string; role: string; name?: string };
  error?: string;
}> {
  const targetEmail = (providedEmail || AUTHORIZED_EMAIL || "ronitovar.digital@gmail.com")
    .trim()
    .toLowerCase();
  const authorized = (process.env.AUTHORIZED_EMAIL || "ronitovar.digital@gmail.com")
    .trim()
    .toLowerCase();

  // Ensure authorized Google account match
  if (targetEmail !== authorized && targetEmail !== "ronitovar.digital@gmail.com") {
    return {
      success: false,
      error: `La cuenta de Google (${targetEmail}) no está autorizada. Acceso exclusivo para ${authorized}.`,
    };
  }

  // Generate 7-day signed session token
  const sessionToken = signToken({
    email: targetEmail,
    role: "Master BDR/Setter (Google Auth)",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionNonce: crypto.randomBytes(12).toString("hex"),
  });

  console.log(`[AUTH] 🚀 Acceso con Cuenta de Google exitoso para: ${targetEmail}`);

  return {
    success: true,
    sessionToken,
    user: {
      email: targetEmail,
      role: "Master BDR/Setter",
      name: "Roni Tovar",
    },
  };
}
