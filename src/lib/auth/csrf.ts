import { randomBytes } from "node:crypto";
import { getAdminSession } from "@/lib/auth/admin-session";

export function generateCsrfToken(): string {
  return randomBytes(24).toString("hex");
}

export async function ensureCsrfToken(): Promise<string> {
  const session = await getAdminSession();
  if (!session.csrfToken) {
    session.csrfToken = generateCsrfToken();
    await session.save();
  }
  return session.csrfToken;
}

export async function assertCsrf(token: string | null | undefined): Promise<boolean> {
  const session = await getAdminSession();
  if (!session.csrfToken || !token) return false;
  return session.csrfToken === token;
}
