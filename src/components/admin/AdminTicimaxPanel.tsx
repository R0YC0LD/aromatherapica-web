"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  CUSTOM_SITE_URL,
  TICIMAX_DINAMIK_URL,
  buildEmbedScript,
  buildRedirectScript,
} from "@/lib/ticimax/dinamik-script";
import type { CmsSettings } from "@/lib/cms/types";
import { saveCmsSettings } from "@/lib/cms/store";

export function AdminTicimaxPanel({
  settings,
  onSaved,
}: {
  settings: CmsSettings;
  onSaved: (next: CmsSettings, message: string) => void;
}) {
  const [mode, setMode] = useState<"redirect" | "embed">("redirect");
  const [customUrl, setCustomUrl] = useState(CUSTOM_SITE_URL);
  const [storeUrl, setStoreUrl] = useState(settings.ticimaxStoreUrl || "https://aromatherapica.com");
  const [copied, setCopied] = useState(false);

  const script = useMemo(
    () => (mode === "redirect" ? buildRedirectScript(customUrl) : buildEmbedScript(customUrl)),
    [mode, customUrl],
  );

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
      const ta = document.createElement("textarea");
      ta.value = script;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  function saveHybrid() {
    const next = saveCmsSettings({
      ticimaxStoreUrl: storeUrl.trim(),
      ticimaxAlanAdi: settings.ticimaxAlanAdi || "aromatherapica.com",
      ticimaxBaseUrl: settings.ticimaxBaseUrl || "https://aromatherapica.com/servis",
    });
    onSaved(next, "Ticimax mağaza URL kaydedildi. Sepet/ödeme hibrit linkleri bu adresi kullanır.");
  }

  return (
    <div className="cms-card">
      <h2>Ticimax canlı aktivasyon</h2>
      <p className="cms-help">
        SOAP kurmadan, hazır özel vitrini <strong>aromatherapica.com</strong> üzerinden açmak için
        Ticimax <em>Dinamik Script Yönetimi</em> paneline aşağıdaki kodu yapıştırın. Admin, üye
        girişi, sepet ve ödeme Ticimax’te kalır; vitrin özel siteye taşınır.
      </p>

      <ol className="cms-help" style={{ paddingLeft: "1.2rem", lineHeight: 1.7 }}>
        <li>
          Ticimax’e yönetici olarak giriş yapın →{" "}
          <a href={TICIMAX_DINAMIK_URL} target="_blank" rel="noreferrer">
            Dinamik Script Yönetimi <ExternalLink size={12} style={{ display: "inline" }} />
          </a>
        </li>
        <li>
          <strong>Yeni Script</strong> → Ad: <code>Aromatherapica Ozel Vitrin</code>
        </li>
        <li>
          Konum: <strong>Head</strong> (veya sayfa sonu) · Sayfalar: <strong>Tüm sayfalar</strong> ·
          Durum: <strong>Aktif</strong>
        </li>
        <li>Aşağıdaki kodu yapıştırıp kaydedin. Önbelleği temizleyip ana sayfayı kontrol edin.</li>
      </ol>

      <div className="cms-toolbar" style={{ marginTop: "1rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`cms-btn${mode === "redirect" ? "" : " secondary"}`}
          onClick={() => setMode("redirect")}
        >
          1) Yönlendirme (önerilen)
        </button>
        <button
          type="button"
          className={`cms-btn${mode === "embed" ? "" : " secondary"}`}
          onClick={() => setMode("embed")}
        >
          2) Iframe gömme
        </button>
      </div>

      <div className="cms-field" style={{ marginTop: "1rem" }}>
        <label>Özel site URL</label>
        <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
      </div>

      <div className="cms-field">
        <label>Yapıştırılacak Dinamik Script</label>
        <textarea
          readOnly
          rows={14}
          value={script}
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 12 }}
        />
      </div>

      <div className="cms-toolbar">
        <button type="button" className="cms-btn" onClick={copyScript}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
          {copied ? "Kopyalandı" : "Kodu kopyala"}
        </button>
        <a className="cms-btn secondary" href={TICIMAX_DINAMIK_URL} target="_blank" rel="noreferrer">
          Ticimax panele git
        </a>
      </div>

      <hr style={{ margin: "1.5rem 0", border: 0, borderTop: "1px solid var(--line, #ddd)" }} />

      <h3>Hibrit mağaza URL</h3>
      <p className="cms-help">
        Özel sitedeki “Ödemeye geç” gibi linkler istenirse Ticimax mağazasına yönlendirilir.
      </p>
      <div className="cms-field">
        <label>Ticimax mağaza adresi</label>
        <input
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
          placeholder="https://aromatherapica.com"
        />
      </div>
      <button type="button" className="cms-btn secondary" onClick={saveHybrid}>
        Mağaza URL kaydet
      </button>
    </div>
  );
}
