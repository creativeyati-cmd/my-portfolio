import "server-only";

import crypto from "node:crypto";

const DEFAULT_SESSION_SECRET = "change-this-session-secret-in-production";
const RUNTIME_FALLBACK_SECRET =
  globalThis.__portfolioRuntimeSessionSecret ||
  (globalThis.__portfolioRuntimeSessionSecret = crypto.randomBytes(32).toString("hex"));
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production" ? RUNTIME_FALLBACK_SECRET : DEFAULT_SESSION_SECRET);
let warnedAboutSessionSecret = false;

function assertProductionSecret() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    if (!warnedAboutSessionSecret) {
      warnedAboutSessionSecret = true;
      console.warn(
        "SESSION_SECRET is not set in production. Using a temporary runtime secret; admin sessions will reset on cold starts until SESSION_SECRET is configured.",
      );
    }
  }
}

function safeHexEqual(left, right) {
  if (!left || !right) return false;
  if (left.length !== right.length) return false;
  if (left.length % 2 !== 0 || right.length % 2 !== 0) return false;
  if (!/^[0-9a-f]+$/i.test(left) || !/^[0-9a-f]+$/i.test(right)) return false;

  return crypto.timingSafeEqual(
    Buffer.from(left, "hex"),
    Buffer.from(right, "hex"),
  );
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return safeHexEqual(actual, expected);
}

function sign(value) {
  assertProductionSecret();
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function encodeSessionPart(value) {
  return Buffer.from(String(value || ""), "utf8").toString("base64url");
}

function decodeSessionPart(value) {
  if (!value) return "";

  try {
    return Buffer.from(String(value), "base64url").toString("utf8");
  } catch {
    return "";
  }
}

export function createSessionValue(username, ttlSeconds = 60 * 60 * 24 * 7) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const encodedUsername = encodeSessionPart(username);
  const payload = `${encodedUsername}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(sessionValue) {
  if (!sessionValue) return null;
  const parts = String(sessionValue).split(".");
  if (parts.length !== 3) return null;

  const [encodedUsername, expiresAt, signature] = parts;
  if (!encodedUsername || !expiresAt || !signature) return null;

  const payload = `${encodedUsername}.${expiresAt}`;
  const expected = sign(payload);
  if (!safeHexEqual(signature, expected)) {
    return null;
  }
  if (Number(expiresAt) <= Date.now()) return null;

  const username = decodeSessionPart(encodedUsername);
  if (!username) return null;

  return { username, expiresAt: Number(expiresAt) };
}
