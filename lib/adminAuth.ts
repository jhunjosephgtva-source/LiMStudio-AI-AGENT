import crypto from "crypto";

const COOKIE_NAME = "lim_admin_session";

function getSecret() {
  // Falls back to the admin password itself if no separate secret is set —
  // fine for a small internal tool, but you can set SESSION_SECRET too.
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Call after a correct password check to build the cookie value to set. */
export function createSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

/** Verifies a session token pulled from the request cookie. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [payload, signature] = decoded.split(".");
    if (!payload || !signature) return false;
    const expected = sign(payload);
    // Session tokens are valid for 30 days.
    const [, timestampStr] = payload.split(":");
    const timestamp = Number(timestampStr);
    if (!timestamp || Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  // Constant-time-ish comparison.
  if (candidate.length !== real.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(real));
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
