import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" || v === undefined || v === null ? undefined : v);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(1).default("12345"),
  SESSION_SECRET: z.string().min(32).default("dev-only-change-me-before-production-32chars"),
  TICIMAX_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  TICIMAX_UYE_KODU: z.preprocess(emptyToUndefined, z.string().optional()),
  TICIMAX_ALAN_ADI: z.preprocess(emptyToUndefined, z.string().optional()),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  CRON_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  TICIMAX_STORE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}

export function isTicimaxConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.TICIMAX_BASE_URL && env.TICIMAX_UYE_KODU);
}

export function isProductionDefaultAdminPassword(): boolean {
  const env = getEnv();
  return env.NODE_ENV === "production" && env.ADMIN_PASSWORD === "12345";
}

export function requireTicimaxConfig() {
  if (!isTicimaxConfigured()) {
    throw new Error(
      "Ticimax bağlantı bilgileri eksik. TICIMAX_BASE_URL ve TICIMAX_UYE_KODU ortam değişkenlerini ayarlayın.",
    );
  }
}
