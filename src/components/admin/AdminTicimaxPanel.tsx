"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { withBasePath } from "@/lib/paths";

const TICIMAX_DINAMIK_URL =
  "https://aromatherapica.com/Admin/DinamikScriptYonetimi.aspx?adminlang=tr&lang=tr";

const PANEL_SCRIPTS: Array<{
  id: string;
  file: string;
  target: string;
  note?: string;
}> = [
  {
    id: "01",
    file: "01-tum-sayfalar.txt",
    target: "Tüm Sayfalar",
    note: "Global CSS+JS — header, footer, ürün kartları",
  },
  { id: "10", file: "10-tum-sayfalar-header.txt", target: "Tüm Sayfalar - Header" },
  {
    id: "02",
    file: "02-anasayfa.txt",
    target: "Anasayfa",
    note: "Hero + Ticimax .productItem otomatik vitrin",
  },
  { id: "03", file: "03-kategori.txt", target: "Kategori" },
  { id: "04", file: "04-marka.txt", target: "Marka" },
  { id: "05", file: "05-urun-detay.txt", target: "Ürün Detay" },
  { id: "07", file: "07-sepet.txt", target: "Sepet" },
  { id: "13", file: "13-arama.txt", target: "Arama" },
  { id: "08", file: "08-uye-ol-sayfasi.txt", target: "Üye Ol Sayfası" },
  { id: "09", file: "09-uyelik-tamamlandi.txt", target: "Üyelik Tamamlandı" },
  { id: "14", file: "14-siparis-tamamla.txt", target: "Sipariş Tamamla" },
  { id: "06", file: "06-siparis-tamamlandi.txt", target: "Sipariş Tamamlandı" },
];

export function AdminTicimaxPanel() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.all(
        PANEL_SCRIPTS.map(async (item) => {
          const res = await fetch(withBasePath(`/ticimax/final/${item.file}`));
          if (!res.ok) throw new Error(`${item.file} yüklenemedi (${res.status})`);
          return [item.file, await res.text()] as const;
        }),
      );
      setContents(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Panel dosyaları okunamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="cms-card">
      <h2>Ticimax canlı mağaza (eksiksiz)</h2>

      <div className="cms-flash error" style={{ marginBottom: "1rem" }}>
        <strong>Kritik:</strong> Yapıştırdığın GitHub yönlendirme scriptini (
        <code>location.replace(...github.io...)</code>) Dinamik Script’ten{" "}
        <strong>sil veya pasifleştir</strong>. Bu kod ürün/sepet/ödeme sayfalarını da GitHub’a
        atıyor; Ticimax alım-satımı çalışmaz.
      </div>

      <p className="cms-help">
        Doğru model: <strong>Yönetim = Ticimax Admin</strong>, <strong>vitrin = FINAL tema</strong>,
        ürün/görsel/sepet/ödeme = Ticimax native. GitHub Pages yalnızca yedek/önizleme olabilir.
      </p>

      <ol className="cms-help" style={{ paddingLeft: "1.2rem", lineHeight: 1.75 }}>
        <li>
          <a href={TICIMAX_DINAMIK_URL} target="_blank" rel="noreferrer">
            Dinamik Script Yönetimi <ExternalLink size={12} style={{ display: "inline" }} />
          </a>{" "}
          → yönlendirme scriptini sil
        </li>
        <li>Eski çakışan CSS/JS’leri kapat</li>
        <li>Aşağıdaki FINAL dosyaları sırayla kopyala → ilgili alana yapıştır → Kaydet</li>
        <li>Önbellek temizle · Anasayfada gerçek ürün vitrininin açık olduğunu kontrol et</li>
      </ol>

      {loading ? <p className="cms-help">Panel dosyaları yükleniyor…</p> : null}
      {error ? <p className="cms-flash error">{error}</p> : null}

      <div className="cms-table-wrap" style={{ marginTop: "1rem" }}>
        <table className="cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticimax alanı</th>
              <th>Not</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PANEL_SCRIPTS.map((item, index) => {
              const body = contents[item.file] || "";
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.target}</strong>
                    <div className="cms-help">{item.file}</div>
                  </td>
                  <td className="cms-help">{item.note || "Sayfa bağlamı"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      className="cms-btn secondary"
                      disabled={!body}
                      onClick={() => copyText(item.file, body)}
                    >
                      {copied === item.file ? <Check size={16} /> : <Copy size={16} />}{" "}
                      {copied === item.file ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cms-toolbar" style={{ marginTop: "1rem" }}>
        <a className="cms-btn" href={TICIMAX_DINAMIK_URL} target="_blank" rel="noreferrer">
          Ticimax panele git
        </a>
        <button type="button" className="cms-btn secondary" onClick={load}>
          Dosyaları yenile
        </button>
      </div>
    </div>
  );
}
