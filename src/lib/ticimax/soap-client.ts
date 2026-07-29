import path from "node:path";
import { createClientAsync, type Client } from "soap";
import { getEnv, requireTicimaxConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { TicimaxServiceName, TicimaxSoapResult } from "@/lib/ticimax/types";

const clientCache = new Map<TicimaxServiceName, Client>();
const DEFAULT_TIMEOUT_MS = 30_000;

function wsdlUrl(service: TicimaxServiceName): string {
  const base = getEnv().TICIMAX_BASE_URL!.replace(/\/$/, "");
  return `${base}/${service}.svc?wsdl`;
}

async function getClient(service: TicimaxServiceName): Promise<Client> {
  requireTicimaxConfig();
  const cached = clientCache.get(service);
  if (cached) return cached;

  const client = await createClientAsync(wsdlUrl(service), {
    wsdl_options: { timeout: DEFAULT_TIMEOUT_MS },
  });
  clientCache.set(service, client);
  return client;
}

function unwrapResult<T>(response: Record<string, unknown>, operation: string): T {
  const key = `${operation}Result`;
  const direct = response[key];
  if (direct !== undefined) return direct as T;

  const nested = response[`${operation}Response`] as Record<string, unknown> | undefined;
  if (nested && nested[key] !== undefined) return nested[key] as T;

  return response as T;
}

export async function callTicimax<T>(
  service: TicimaxServiceName,
  operation: string,
  args: Record<string, unknown>,
  options?: { includeAuth?: boolean },
): Promise<TicimaxSoapResult<T>> {
  requireTicimaxConfig();
  const includeAuth = options?.includeAuth !== false;
  const uyeKodu = getEnv().TICIMAX_UYE_KODU!;
  const started = Date.now();

  try {
    const client = await getClient(service);
    const method = (client as Client & Record<string, unknown>)[`${operation}Async`] as
      | ((payload: Record<string, unknown>) => Promise<[Record<string, unknown>]>)
      | undefined;

    if (!method) {
      throw new Error(`Ticimax operasyonu bulunamadı: ${service}.${operation}`);
    }

    const payload = includeAuth ? { UyeKodu: uyeKodu, ...args } : args;
    const [raw] = await method(payload);
    const durationMs = Date.now() - started;
    const data = unwrapResult<T>(raw, operation);

    logger.info("ticimax.request.success", {
      service,
      operation,
      durationMs,
    });

    return { data, durationMs };
  } catch (error) {
    const durationMs = Date.now() - started;
    logger.error("ticimax.request.failed", {
      service,
      operation,
      durationMs,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function testTicimaxConnection(): Promise<{ ok: boolean; message: string; durationMs?: number }> {
  if (!getEnv().TICIMAX_BASE_URL || !getEnv().TICIMAX_UYE_KODU) {
    return { ok: false, message: "Ticimax yapılandırması eksik" };
  }

  try {
    const { durationMs } = await callTicimax("UrunServis", "SelectKategori", {
      kategoriID: 0,
      dil: "",
    });
    return { ok: true, message: "Bağlantı başarılı", durationMs };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Bağlantı hatası",
    };
  }
}

export function getWsdlPath(service: TicimaxServiceName): string {
  return path.join(process.cwd(), "..", "TicimaxWebService", "TicimaxWebServicesSample", "Connected Services", mapServiceFolder(service), `${service}.wsdl`);
}

function mapServiceFolder(service: TicimaxServiceName): string {
  switch (service) {
    case "UrunServis":
      return "UrunServis";
    case "SiparisServis":
      return "SiparisServis";
    case "UyeServis":
      return "UyeServis";
    case "CustomServis":
      return "CustomServis";
  }
}
