import { cookies } from "next/headers";
import { getIronSession, unsealData, type IronSession, type SessionOptions } from "iron-session";
import { getEnv } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "arom_admin_session";

export interface AdminSessionData {
  userId?: string;
  username?: string;
  mustChangePassword?: boolean;
  csrfToken?: string;
  loggedInAt?: number;
}

export function getAdminSessionOptions(): SessionOptions {
  return {
    cookieName: ADMIN_SESSION_COOKIE,
    password: getEnv().SESSION_SECRET,
    ttl: 60 * 60 * 8, // 8 hours
    cookieOptions: {
      httpOnly: true,
      secure: getEnv().NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, getAdminSessionOptions());
}

export async function readAdminSessionFromCookieValue(
  cookieValue: string | undefined,
): Promise<AdminSessionData | null> {
  if (!cookieValue) return null;
  try {
    return await unsealData<AdminSessionData>(cookieValue, {
      password: getEnv().SESSION_SECRET,
      ttl: 60 * 60 * 8,
    });
  } catch {
    return null;
  }
}

export function isAdminSessionActive(data: AdminSessionData | null | undefined): boolean {
  return Boolean(data?.userId);
}
