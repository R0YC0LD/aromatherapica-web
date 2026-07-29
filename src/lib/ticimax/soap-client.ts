import path from "node:path";
import { createClientAsync, type Client } from "soap";
import { resolveTicimaxCredentials } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { TicimaxServiceName, TicimaxSoapResult } from "@/lib/ticimax/types";

const clientCache = new Map<string, Client>();
const DEFAULT_TIMEOUT_MS = 30_000;

async function getClient(service: TicimaxServiceName): Promise<{ client: Client; uyeKodu: string }> {
  const creds = await resolveTicimaxCredentials();
  if (!creds.configured || !creds.baseUrl || !creds.uyeKodu) {
    throw new Error(
      "Ticimax bağlantı bilgileri eksik veya entegrasyon kapalı. Admin panelinden aktif edin veya .env dosyasını doldurun.",
    );
  }

  const base = creds.baseUrl.replace(/\/$/, "");
  const cacheKey = `${base}|${service}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return { client: cached, uyeKodu: creds.uyeKodu };

  const client = await createClientAsync(`${base}/${service}.svc?wsdl`, {
    wsdl_options: { timeout: DEFAULT_TIMEOUT_MS },
  });
  clientCache.set(cacheKey, client);
  return { client, uyeKodu: creds.uyeKodu };
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
  const includeAuth = options?.includeAuth !== false;
  const started = Date.now();

  try {
    const { client, uyeKodu } = await getClient(service);
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
  const creds = await resolveTicimaxCredentials();
  if (!creds.configured) {
    return {
      ok: false,
      message:
        "Ticimax yapılandırması eksik veya entegrasyon kapalı. Admin → Ayarlar’dan bilgileri girip aktif edin.",
    };
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
