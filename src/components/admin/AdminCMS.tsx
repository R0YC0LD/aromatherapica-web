"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Download,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Save,
  Search,
  Settings2,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";
import { compressImageFile } from "@/lib/cms/image";
import {
  changeCmsPassword,
  clearCmsData,
  exportCmsBackup,
  getCmsState,
  importCmsBackup,
  isCmsLoggedIn,
  loginCms,
  logoutCms,
  saveCmsSettings,
  subscribeCms,
  upsertProductOverride,
} from "@/lib/cms/store";
import { DEFAULT_CMS_SETTINGS, type CmsSettings, type ProductOverride } from "@/lib/cms/types";
import { formatCurrency } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import "@/app/admin-panel.css";

type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  categoryName: string | null;
  categoryId: number | null;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  description: string | null;
  shortDesc: string | null;
  sku: string | null;
};

type Tab = "dashboard" | "products" | "orders" | "settings" | "guide";

function mergeProduct(base: CatalogProduct, ov?: ProductOverride): CatalogProduct {
  if (!ov) return base;
  return {
    ...base,
    name: ov.name ?? base.name,
    shortDesc: ov.shortDesc ?? base.shortDesc,
    description: ov.description ?? base.description,
    price: ov.price ?? base.price,
    salePrice: ov.salePrice !== undefined ? ov.salePrice : base.salePrice,
    stock: ov.stock ?? base.stock,
    active: ov.active ?? base.active,
    categoryName: ov.categoryName ?? base.categoryName,
    categoryId: ov.categoryId !== undefined ? ov.categoryId : base.categoryId,
    imageUrl: ov.imageUrl !== undefined ? ov.imageUrl : base.imageUrl,
  };
}

export function AdminCMS() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [settings, setSettings] = useState<CmsSettings>(DEFAULT_CMS_SETTINGS);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [serverMode, setServerMode] = useState(false);

  const refreshLocal = useCallback(() => {
    const state = getCmsState();
    setOverrides(state.products);
    setSettings(state.settings);
  }, []);

  useEffect(() => {
    setAuthed(isCmsLoggedIn());
    refreshLocal();
    return subscribeCms(refreshLocal);
  }, [refreshLocal]);

  useEffect(() => {
    const staticMode = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
    setServerMode(!staticMode);

    fetch(withBasePath("/data/catalog.json"))
      .then((r) => r.json())
      .then((data) => {
        const products = (data.products || []) as CatalogProduct[];
        setCatalog(products);
      })
      .catch(() => setCatalog([]));

    try {
      setOrders(JSON.parse(localStorage.getItem("arom_orders") || "[]"));
    } catch {
      setOrders([]);
    }
  }, []);

  const products = useMemo(
    () => catalog.map((p) => mergeProduct(p, overrides[String(p.id)])),
    [catalog, overrides],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLocaleLowerCase("tr").includes(needle) ||
        (p.categoryName || "").toLocaleLowerCase("tr").includes(needle) ||
        (p.sku || "").toLocaleLowerCase("tr").includes(needle) ||
        p.slug.includes(needle),
    );
  }, [products, q]);

  const stats = useMemo(() => {
    const withImage = products.filter((p) => Boolean(p.imageUrl)).length;
    const edited = Object.keys(overrides).length;
    return {
      total: products.length,
      withImage,
      edited,
      orders: orders.length,
      active: products.filter((p) => p.active).length,
    };
  }, [products, overrides, orders]);

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");

    // Prefer server login when APIs exist
    if (serverMode) {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          await loginCms(username, password).catch(() => undefined);
          setAuthed(true);
          return;
        }
      } catch {
        /* fall through to local */
      }
    }

    const ok = await loginCms(username, password);
    if (!ok) {
      setError("Kullanıcı adı veya şifre hatalı");
      return;
    }
    setAuthed(true);
  }

  function onLogout() {
    logoutCms();
    setAuthed(false);
  }

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFlash(null);
    setError(null);
    const form = new FormData(e.currentTarget);
    const patch: ProductOverride = {
      name: String(form.get("name") || editing.name),
      shortDesc: String(form.get("shortDesc") || ""),
      description: String(form.get("description") || ""),
      price: Number(form.get("price") || editing.price),
      salePrice: form.get("salePrice") === "" ? null : Number(form.get("salePrice")),
      stock: Number(form.get("stock") || 0),
      active: form.get("active") === "on",
      categoryName: String(form.get("categoryName") || editing.categoryName || ""),
      imageUrl: editing.imageUrl,
    };

    upsertProductOverride(editing.id, patch);

    if (serverMode) {
      try {
        const session = await fetch("/api/admin/session").then((r) => r.json());
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            csrfToken: session.csrfToken,
            name: patch.name,
            shortDesc: patch.shortDesc,
            customDescription: patch.description,
            customImageUrl: patch.imageUrl,
            active: patch.active,
          }),
        });
      } catch {
        /* local already saved */
      }
    }

    setSaving(false);
    setFlash("Ürün kaydedildi — vitrinde hemen görünür.");
    setEditing(null);
    refreshLocal();
  }

  async function onPickImage(file: File | null) {
    if (!file || !editing) return;
    try {
      setSaving(true);
      const dataUrl = await compressImageFile(file);
      setEditing({ ...editing, imageUrl: dataUrl });
      setSaving(false);
      setFlash("Görsel yüklendi. Kaydet’e basmayı unutmayın.");
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    }
  }

  async function onSaveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = saveCmsSettings({
      siteName: String(form.get("siteName") || ""),
      freeShippingThreshold: Number(form.get("freeShippingThreshold") || 100000),
      contactEmail: String(form.get("contactEmail") || ""),
      contactPhone: String(form.get("contactPhone") || ""),
      ticimaxBaseUrl: String(form.get("ticimaxBaseUrl") || ""),
      ticimaxUyeKodu: String(form.get("ticimaxUyeKodu") || ""),
      ticimaxAlanAdi: String(form.get("ticimaxAlanAdi") || ""),
      ticimaxStoreUrl: String(form.get("ticimaxStoreUrl") || ""),
      integrationEnabled: form.get("integrationEnabled") === "on",
    });
    setSettings(next);

    if (serverMode) {
      try {
        const session = await fetch("/api/admin/session").then((r) => r.json());
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...next, csrfToken: session.csrfToken }),
        });
      } catch {
        /* ignore */
      }
    }

    setFlash(
      next.integrationEnabled
        ? "Ayarlar kaydedildi. Ticimax entegrasyonu işaretlendi — Node sunucusunda aktif olur."
        : "Ayarlar kaydedildi.",
    );
  }

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await changeCmsPassword(String(form.get("current") || ""), String(form.get("next") || ""));
      setFlash("Yönetim paneli şifresi güncellendi.");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre değiştirilemedi");
    }
  }

  if (!authed) {
    return (
      <div className="cms-root cms-login">
        <form className="cms-login-card" onSubmit={onLogin}>
          <h1>Yönetim Paneli</h1>
          <p>Ürün görselleri, içerik ve Ticimax ayarlarını buradan yönetin.</p>
          {error ? <p className="cms-flash error">{error}</p> : null}
          <div className="cms-fields">
            <div className="cms-field">
              <label htmlFor="username">Kullanıcı adı</label>
              <input id="username" name="username" defaultValue="admin" required autoComplete="username" />
            </div>
            <div className="cms-field">
              <label htmlFor="password">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue="12345"
                required
                autoComplete="current-password"
              />
            </div>
            <button className="cms-btn" type="submit">
              Giriş yap
            </button>
          </div>
          <p className="cms-help" style={{ marginTop: "1rem" }}>
            Varsayılan: <code>admin</code> / <code>12345</code> — paneldan değiştirin.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="cms-root">
      <div className="cms-shell">
        <aside className="cms-sidebar">
          <div className="cms-brand">
            <strong>Aromatherapica</strong>
            <span>Yönetim Merkezi</span>
          </div>
          <nav className="cms-nav" aria-label="Yönetim menüsü">
            <button type="button" className={tab === "dashboard" ? "is-active" : ""} onClick={() => setTab("dashboard")}>
              <LayoutDashboard size={18} /> Özet
            </button>
            <button type="button" className={tab === "products" ? "is-active" : ""} onClick={() => setTab("products")}>
              <Package size={18} /> Ürünler & görseller
            </button>
            <button type="button" className={tab === "orders" ? "is-active" : ""} onClick={() => setTab("orders")}>
              <ShoppingBag size={18} /> Siparişler
            </button>
            <button type="button" className={tab === "settings" ? "is-active" : ""} onClick={() => setTab("settings")}>
              <Settings2 size={18} /> Ayarlar / Ticimax
            </button>
            <button type="button" className={tab === "guide" ? "is-active" : ""} onClick={() => setTab("guide")}>
              <Boxes size={18} /> Kurulum rehberi
            </button>
          </nav>
          <div className="cms-sidebar-foot">
            <Link href="/">Mağazaya dön</Link>
            <button type="button" onClick={onLogout}>
              <LogOut size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Çıkış
            </button>
          </div>
        </aside>

        <main className="cms-main">
          <div className="cms-topbar">
            <div>
              <h1>
                {tab === "dashboard" && "Özet"}
                {tab === "products" && "Ürünler"}
                {tab === "orders" && "Siparişler"}
                {tab === "settings" && "Ayarlar"}
                {tab === "guide" && "Kurulum"}
              </h1>
              <p>
                {serverMode
                  ? "Node modu: yerel CMS + sunucu API birlikte çalışır."
                  : "GitHub Pages modu: tüm düzenlemeler bu cihazda saklanır ve vitrine yansır."}
              </p>
            </div>
            <span className={`cms-badge ${settings.integrationEnabled ? "on" : "off"}`}>
              Ticimax {settings.integrationEnabled ? "aktif işaretli" : "pasif"}
            </span>
          </div>

          {flash ? <p className="cms-flash">{flash}</p> : null}
          {error ? <p className="cms-flash error">{error}</p> : null}

          {tab === "dashboard" && (
            <>
              <div className="cms-grid">
                <article className="cms-stat">
                  <span>Toplam ürün</span>
                  <strong>{stats.total}</strong>
                </article>
                <article className="cms-stat">
                  <span>Görselli ürün</span>
                  <strong>{stats.withImage}</strong>
                </article>
                <article className="cms-stat">
                  <span>Düzenlenen</span>
                  <strong>{stats.edited}</strong>
                </article>
                <article className="cms-stat">
                  <span>Yerel sipariş</span>
                  <strong>{stats.orders}</strong>
                </article>
              </div>
              <div className="cms-card">
                <h2>Hızlı başlangıç</h2>
                <p className="cms-help">
                  1) <strong>Ürünler</strong> sekmesinden galeriden görsel seçin (telefon veya bilgisayar).
                  <br />
                  2) Fiyat, stok, açıklama ve kategoriyi düzenleyin.
                  <br />
                  3) <strong>Ayarlar</strong> içine Ticimax bilgilerinizi girip entegrasyonu işaretleyin.
                  <br />
                  4) Canlı SOAP için Node sunucusunda `.env` ile aynı bilgileri kullanın.
                </p>
                <div className="cms-toolbar" style={{ marginTop: "1rem" }}>
                  <button type="button" className="cms-btn" onClick={() => setTab("products")}>
                    Ürünleri yönet
                  </button>
                  <button type="button" className="cms-btn secondary" onClick={() => setTab("settings")}>
                    Ticimax ayarları
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <div className="cms-card">
              <div className="cms-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ürün, kategori veya SKU ara…"
                  />
                </div>
                <button
                  type="button"
                  className="cms-btn secondary"
                  onClick={() => {
                    const blob = new Blob([exportCmsBackup()], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `aromatherapica-cms-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={16} /> Yedek al
                </button>
                <label className="cms-btn secondary" style={{ cursor: "pointer" }}>
                  <Upload size={16} /> Yedek yükle
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        importCmsBackup(await file.text());
                        refreshLocal();
                        setFlash("Yedek içe aktarıldı.");
                      } catch {
                        setError("Yedek okunamadı");
                      }
                    }}
                  />
                </label>
              </div>

              <div className="cms-table-wrap">
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün</th>
                      <th>Kategori</th>
                      <th>Fiyat</th>
                      <th>Stok</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="cms-thumb" src={p.imageUrl} alt="" />
                          ) : (
                            <span className="cms-thumb placeholder">Yok</span>
                          )}
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div className="cms-help">{p.sku || p.slug}</div>
                        </td>
                        <td>{p.categoryName || "—"}</td>
                        <td>{formatCurrency(p.salePrice ?? p.price)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <button type="button" className="cms-btn secondary" onClick={() => setEditing(p)}>
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="cms-card">
              <h2>Yerel siparişler</h2>
              <p className="cms-help">
                GitHub Pages’te siparişler tarayıcıda tutulur. Node + Ticimax modunda siparişler SOAP ile
                Ticimax’e iletilir.
              </p>
              {orders.length === 0 ? (
                <p className="cms-help">Henüz sipariş yok.</p>
              ) : (
                <div className="cms-table-wrap">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Müşteri</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orders as Array<Record<string, unknown>>).map((o) => (
                        <tr key={String(o.id)}>
                          <td>{String(o.id).slice(0, 8)}…</td>
                          <td>
                            {String(o.customerName || "—")}
                            <div className="cms-help">{String(o.customerEmail || "")}</div>
                          </td>
                          <td>{formatCurrency(Number(o.totalAmount || 0))}</td>
                          <td>{String(o.status || "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <form className="cms-card" onSubmit={onSaveSettings}>
                <h2>Site & Ticimax</h2>
                <div className="cms-fields two">
                  <div className="cms-field">
                    <label>Site adı</label>
                    <input name="siteName" defaultValue={settings.siteName} />
                  </div>
                  <div className="cms-field">
                    <label>Ücretsiz kargo eşiği (TL)</label>
                    <input
                      name="freeShippingThreshold"
                      type="number"
                      defaultValue={settings.freeShippingThreshold}
                    />
                  </div>
                  <div className="cms-field">
                    <label>İletişim e-posta</label>
                    <input name="contactEmail" defaultValue={settings.contactEmail} />
                  </div>
                  <div className="cms-field">
                    <label>Telefon</label>
                    <input name="contactPhone" defaultValue={settings.contactPhone} />
                  </div>
                  <div className="cms-field">
                    <label>Ticimax Base URL</label>
                    <input
                      name="ticimaxBaseUrl"
                      placeholder="https://magaza.com/servis"
                      defaultValue={settings.ticimaxBaseUrl}
                    />
                  </div>
                  <div className="cms-field">
                    <label>Üye / Yetki Kodu</label>
                    <input name="ticimaxUyeKodu" defaultValue={settings.ticimaxUyeKodu} />
                  </div>
                  <div className="cms-field">
                    <label>Alan adı</label>
                    <input name="ticimaxAlanAdi" defaultValue={settings.ticimaxAlanAdi} />
                  </div>
                  <div className="cms-field">
                    <label>Mağaza URL</label>
                    <input name="ticimaxStoreUrl" defaultValue={settings.ticimaxStoreUrl} />
                  </div>
                </div>
                <label className="cms-check" style={{ margin: "1rem 0" }}>
                  <input
                    type="checkbox"
                    name="integrationEnabled"
                    defaultChecked={settings.integrationEnabled}
                  />
                  Ticimax entegrasyonunu aktif et (Node sunucusunda SOAP senkronunu açar)
                </label>
                <button className="cms-btn" type="submit">
                  <Save size={16} /> Ayarları kaydet
                </button>
              </form>

              <form className="cms-card" onSubmit={onChangePassword}>
                <h3>Panel şifresi</h3>
                <div className="cms-fields two">
                  <div className="cms-field">
                    <label>Mevcut şifre</label>
                    <input name="current" type="password" required />
                  </div>
                  <div className="cms-field">
                    <label>Yeni şifre</label>
                    <input name="next" type="password" required minLength={5} />
                  </div>
                </div>
                <button className="cms-btn secondary" type="submit" style={{ marginTop: "0.85rem" }}>
                  Şifreyi değiştir
                </button>
              </form>

              <div className="cms-card">
                <h3>Tehlikeli alan</h3>
                <p className="cms-help">Yerel CMS verisini (görseller ve düzenlemeler) temizler.</p>
                <button
                  type="button"
                  className="cms-btn danger"
                  onClick={() => {
                    if (confirm("Tüm yerel düzenlemeler silinsin mi?")) {
                      clearCmsData();
                      refreshLocal();
                      setFlash("Yerel CMS temizlendi.");
                    }
                  }}
                >
                  Yerel veriyi sıfırla
                </button>
              </div>
            </div>
          )}

          {tab === "guide" && (
            <div className="cms-card">
              <h2>Kurulum — neyi nereye koyacaksınız?</h2>
              <div className="cms-help">
                <p>
                  <strong>1. GitHub Pages (şimdiki yayın)</strong>
                  <br />
                  Site: <code>https://r0yc0ld.github.io/aromatherapica-web/</code>
                  <br />
                  Yönetim: <code>.../admin/</code> veya <code>.../admin.html</code>
                  <br />
                  Ürün görselleri ve düzenlemeler tarayıcıda saklanır. Aynı cihazda / aynı tarayıcıda
                  kalır; yedek alıp başka cihaza yükleyebilirsiniz.
                </p>
                <p>
                  <strong>2. Ticimax canlı entegrasyon (Node)</strong>
                  <br />
                  Projede <code>.env</code> oluşturun (<code>.env.example</code> kopyası):
                </p>
                <pre style={{ whiteSpace: "pre-wrap", background: "#efe9df", padding: "1rem", borderRadius: 12 }}>
{`ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu-sifre
SESSION_SECRET=en-az-32-karakter-gizli-anahtar
DATABASE_URL=file:./dev.db
TICIMAX_BASE_URL=https://MAGAZA-ALANI/servis
TICIMAX_UYE_KODU=YetkiKodu
TICIMAX_ALAN_ADI=magaza-alani
TICIMAX_STORE_URL=https://magaza-alani`}
                </pre>
                <p>
                  Sonra: <code>npm install && npx prisma db push && npm run db:seed && npm run dev</code>
                  <br />
                  Admin’den entegrasyonu işaretleyin → test/sync (Node API ile).
                </p>
                <p>
                  <strong>Onay:</strong> SOAP istemcisi <code>src/lib/ticimax/*</code> altında; ürün,
                  stok, sipariş ve üye servisleri bağlanmıştır. Pages’te SOAP çalışmaz (tarayıcı
                  kısıtı); Node/Vercel’de çalışır.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {editing ? (
        <div className="cms-modal-backdrop" role="presentation" onClick={() => setEditing(null)}>
          <div
            className="cms-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Ürün düzenle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cms-modal-head">
              <div>
                <h2>Ürünü düzenle</h2>
                <p className="cms-help">{editing.slug}</p>
              </div>
              <button type="button" className="cms-btn secondary" onClick={() => setEditing(null)}>
                <X size={16} />
              </button>
            </div>

            <form className="cms-fields" onSubmit={saveProduct}>
              <div className="cms-image-picker">
                {editing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editing.imageUrl} alt="" />
                ) : (
                  <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
                    Görsel yok
                  </span>
                )}
                <div>
                  <p className="cms-help" style={{ marginTop: 0 }}>
                    Telefondan veya bilgisayardan galeri / dosya seçin.
                  </p>
                  <label className="cms-btn secondary" style={{ cursor: "pointer" }}>
                    <ImagePlus size={16} /> Görsel seç
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <div className="cms-field">
                <label>Ürün adı</label>
                <input name="name" defaultValue={editing.name} required />
              </div>
              <div className="cms-fields two">
                <div className="cms-field">
                  <label>Fiyat</label>
                  <input name="price" type="number" step="0.01" defaultValue={editing.price} required />
                </div>
                <div className="cms-field">
                  <label>İndirimli fiyat</label>
                  <input
                    name="salePrice"
                    type="number"
                    step="0.01"
                    defaultValue={editing.salePrice ?? ""}
                  />
                </div>
                <div className="cms-field">
                  <label>Stok</label>
                  <input name="stock" type="number" defaultValue={editing.stock} required />
                </div>
                <div className="cms-field">
                  <label>Kategori adı</label>
                  <input name="categoryName" defaultValue={editing.categoryName || ""} />
                </div>
              </div>
              <div className="cms-field">
                <label>Kısa açıklama</label>
                <textarea name="shortDesc" rows={2} defaultValue={editing.shortDesc || ""} />
              </div>
              <div className="cms-field">
                <label>Detaylı açıklama</label>
                <textarea name="description" rows={5} defaultValue={editing.description || ""} />
              </div>
              <label className="cms-check">
                <input type="checkbox" name="active" defaultChecked={editing.active} /> Satışta
              </label>
              <button className="cms-btn" type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
