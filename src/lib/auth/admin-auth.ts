import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getEnv, isProductionDefaultAdminPassword } from "@/lib/env";
import { logger } from "@/lib/logger";

const BCRYPT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function ensureAdminUser(): Promise<void> {
  const env = getEnv();
  const existing = await prisma.adminUser.findUnique({ where: { username: env.ADMIN_USERNAME } });
  if (existing) return;

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  await prisma.adminUser.create({
    data: {
      username: env.ADMIN_USERNAME,
      passwordHash,
      mustChangePassword: isProductionDefaultAdminPassword(),
    },
  });
  logger.info("admin.user.seeded", { username: env.ADMIN_USERNAME });
}

export interface RateLimitStatus {
  locked: boolean;
  remainingAttempts: number;
  retryAfterMs?: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitStatus> {
  const since = new Date(Date.now() - LOGIN_LOCKOUT_WINDOW_MS);
  const attempts = await prisma.loginAttempt.findMany({
    where: { ip, success: false, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });

  if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldest = attempts[0];
    const retryAfterMs = oldest.createdAt.getTime() + LOGIN_LOCKOUT_WINDOW_MS - Date.now();
    return { locked: true, remainingAttempts: 0, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  return { locked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts.length };
}

export async function recordLoginAttempt(ip: string, username: string | undefined, success: boolean): Promise<void> {
  await prisma.loginAttempt.create({ data: { ip, username, success } });
}

export interface AdminAuthResult {
  ok: boolean;
  reason?: "locked" | "invalid_credentials" | "not_found";
  user?: { id: string; username: string; mustChangePassword: boolean };
  retryAfterMs?: number;
}

export async function authenticateAdmin(username: string, password: string, ip: string): Promise<AdminAuthResult> {
  const rateLimit = await checkRateLimit(ip);
  if (rateLimit.locked) {
    logger.warn("admin.login.rate_limited", { ip });
    return { ok: false, reason: "locked", retryAfterMs: rateLimit.retryAfterMs };
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) {
    await recordLoginAttempt(ip, username, false);
    return { ok: false, reason: "not_found" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  await recordLoginAttempt(ip, username, valid);

  if (!valid) {
    return { ok: false, reason: "invalid_credentials" };
  }

  return {
    ok: true,
    user: { id: user.id, username: user.username, mustChangePassword: user.mustChangePassword },
  };
}

export async function changeAdminPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });
}
