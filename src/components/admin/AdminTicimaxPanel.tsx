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
    id: "00",
    file: "00-YONLENDIRMEYI-KAPAT.txt",
    target: "Tüm Sayfalar (önce bunu yapıştır — yönlendirmeyi kapat)",
    note: "GitHub location.replace’i siler; site Ticimax’ta kalır",
  },
  {
    id: "01",
    file: "01-tum-sayfalar.txt",
    target: "Tüm Sayfalar (sonra exact tema)",
    note: "WebSitesi birebir global CSS+JS (header, footer, ürün kartı)",
  },
  {
    id: "10",
    file: "10-tum-sayfalar-header.txt",
    target: "Tüm Sayfalar - Header",
    note: "Italiana + DM Sans fontları + ar-exact-shell",
  },
  {
    id: "02",
    file: "02-anasayfa.txt",
    target: "Anasayfa",
    note: "Hero, vitrin, ritüeller — gerçek .productItem",
  },
  { id: "03", file: "03-kategori.txt", target: "Kategori", note: "Liste + filtre stilleri" },
  { id: "04", file: "04-marka.txt", target: "Marka" },
  { id: "05", file: "05-urun-detay.txt", target: "Ürün Detay", note: "Galeri / varyant / sepete ekle" },
  { id: "07", file: "07-sepet.txt", target: "Sepet" },
  { id: "13", file: "13-arama.txt", target: "Arama" },
  { id: "08", file: "08-uye-ol-sayfasi.txt", target: "Üye Ol Sayfası" },
  { id: "09", file: "09-uyelik-tamamlandi.txt", target: "Üyelik Tamamlandı" },
  { id: "14", file: "14-siparis-tamamla.txt", target: "Sipariş Tamamla" },
  { id: "06", file: "06-siparis-tamamlandi.txt", target: "Sipariş Tamamlandı" },
];

const CATEGORY_BLOCKS: Array<{ file: string; label: string }> = [
  { file: "01-ucucu-yaglar.html", label: "Uçucu Yağlar" },
  { file: "02-cilt-bakimi.html", label: "Cilt Bakımı" },
  { file: "03-ozel-bakim.html", label: "Özel Bakım" },
  { file: "04-sac-bakimi.html", label: "Saç Bakımı" },
  { file: "05-vucut-bakimi.html", label: "Vücut Bakımı" },
  { file: "06-gul-sulari.html", label: "Gül Suları" },
  { file: "07-dogal-sabunlar.html", label: "Doğal Sabunlar" },
  { file: "08-hediye-secenekleri.html", label: "Hediye Seçenekleri" },
];

export function AdminTicimaxPanel() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const scriptEntries = await Promise.all(
        PANEL_SCRIPTS.map(async (item) => {
          const path =
            item.file.startsWith("00-")
              ? `/ticimax/${item.file}`
              : `/ticimax/final/${item.file}`;
          const res = await fetch(withBasePath(path));
          if (!res.ok) throw new Error(`${item.file} yüklenemedi (${res.status})`);
          return [item.file, await res.text()] as const;
        }),
      );
      const blockEntries = await Promise.all(
        CATEGORY_BLOCKS.map(async (item) => {
          const res = await fetch(withBasePath(`/ticimax/kategori-bloklari/${item.file}`));
          if (!res.ok) throw new Error(`${item.file} yüklenemedi (${res.status})`);
          return [item.file, await res.text()] as const;
        }),
      );
      setContents(Object.fromEntries(scriptEntries));
      setBlocks(Object.fromEntries(blockEntries));
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
      <h2>WebSitesi → Ticimax birebir yayın</h2>

      <div className="cms-flash error" style={{ marginBottom: "1rem" }}>
        <strong>Kritik:</strong> Dinamik Script’teki{" "}
        <code>location.replace(...github.io...)</code> yönlendirmesini{" "}
        <strong>sil</strong>. Silmeden canlıda WebSitesi tasarımı görünmez; ürün sayfaları
        GitHub’a kaçar.
      </div>

      <p className="cms-help">
        Kaynak: masaüstündeki <code>WebSitesi\zmetik</code> tasarımının Ticimax exact paketi.
        Yönetim Ticimax Admin’de kalır; ürün / görsel / sepet / ödeme native çalışır.
      </p>

      <ol className="cms-help" style={{ paddingLeft: "1.2rem", lineHeight: 1.75 }}>
        <li>
          <a href={TICIMAX_DINAMIK_URL} target="_blank" rel="noreferrer">
            Dinamik Script Yönetimi <ExternalLink size={12} style={{ display: "inline" }} />
          </a>{" "}
          → yönlendirme + eski tema / “önizleme” HTML’ini temizle
        </li>
        <li>
          Amblem yükle:{" "}
          <a href={withBasePath("/ticimax/assets/aromatherapica-emblem.png")} target="_blank" rel="noreferrer">
            aromatherapica-emblem.png
          </a>{" "}
          → <code>/Uploads/EditorUploads/aromatherapica-emblem.png</code>
        </li>
        <li>Aşağıdaki 12 dosyayı sırayla kopyala → ilgili alana yapıştır → Kaydet</li>
        <li>Kategori üst bloklarını ilgili kategori açıklama alanına yapıştır</li>
        <li>Anasayfa ürün vitrinini aç (≥4–8 gerçek ürün + görsel) · önbellek temizle · test et</li>
      </ol>

      {loading ? <p className="cms-help">Panel dosyaları yükleniyor…</p> : null}
      {error ? <p className="cms-flash error">{error}</p> : null}

      <h3 style={{ marginTop: "1.5rem" }}>Dinamik Script dosyaları</h3>
      <div className="cms-table-wrap" style={{ marginTop: "0.75rem" }}>
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
                  <td className="cms-help">{item.note || "Sayfa davranışı"}</td>
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

      <h3 style={{ marginTop: "1.5rem" }}>Kategori üst blokları</h3>
      <p className="cms-help">Her kategorinin açıklama / üst içerik alanına ilgili HTML’i yapıştırın.</p>
      <div className="cms-table-wrap" style={{ marginTop: "0.75rem" }}>
        <table className="cms-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Dosya</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_BLOCKS.map((item) => {
              const body = blocks[item.file] || "";
              return (
                <tr key={item.file}>
                  <td>
                    <strong>{item.label}</strong>
                  </td>
                  <td className="cms-help">{item.file}</td>
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
        <a
          className="cms-btn secondary"
          href={withBasePath("/ticimax/KURULUM.md")}
          target="_blank"
          rel="noreferrer"
        >
          Kurulum notu
        </a>
        <button type="button" className="cms-btn secondary" onClick={load}>
          Dosyaları yenile
        </button>
      </div>
    </div>
  );
}
