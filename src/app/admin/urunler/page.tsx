"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatCurrency, formatDate } from "@/lib/format";
import { ImagePlus, Pencil, Save, Search, X } from "lucide-react";

type ProductRow = {
  id: number;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  categoryName: string | null;
  imageUrl: string | null;
  customImageUrl: string | null;
  shortDesc: string | null;
  hasCustomDescription: boolean;
  sku: string | null;
  syncedAt: string;
};

type ProductDetail = ProductRow & {
  ticimaxId?: number;
  customDescription: string | null;
  description: string | null;
  slug: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");
  const [csrf, setCsrf] = useState("");
  const [editing, setEditing] = useState<ProductDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(query = q) {
    const url = query ? `/api/admin/products?q=${encodeURIComponent(query)}` : "/api/admin/products";
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.data || []);
  }

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setCsrf(d.csrfToken || ""));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openEdit(id: number) {
    const res = await fetch(`/api/admin/products?id=${id}`);
    const data = await res.json();
    if (data.data) setEditing(data.data);
  }

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.ticimaxId ?? editing.id,
        csrfToken: csrf,
        name: form.get("name"),
        shortDesc: form.get("shortDesc"),
        customDescription: form.get("customDescription"),
        customImageUrl: form.get("customImageUrl"),
        active: form.get("active") === "on",
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Kayıt başarısız");
      return;
    }
    setMessage("Ürün güncellendi");
    setEditing(null);
    await load();
  }

  return (
    <AdminShell title="Ürünler">
      <p className="admin-muted">
        Ticimax export / senkronizasyondan gelen ürünler. Görsel ve açıklama alanlarını buradan
        özelleştirebilirsiniz; sonraki sync özel alanları korur.
      </p>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(q)}
            placeholder="Ürün, SKU veya kategori ara…"
          />
        </div>
        <button type="button" className="btn" onClick={() => load(q)}>
          Ara
        </button>
      </div>

      {message ? <p className="admin-flash">{message}</p> : null}

      <div className="admin-card">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Ürün</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-thumb">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" />
                    ) : (
                      <ImagePlus size={16} />
                    )}
                  </div>
                </td>
                <td>
                  <strong>{p.name}</strong>
                  <div className="admin-muted">{p.sku || `ID ${p.id}`}</div>
                </td>
                <td>{p.categoryName || "—"}</td>
                <td>{formatCurrency(p.salePrice ?? p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={p.active ? "badge-ok" : "badge-off"}>
                    {p.active ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(p.id)}>
                    <Pencil size={14} /> Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="admin-modal-backdrop" onClick={() => setEditing(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={onSave}>
            <div className="admin-modal-head">
              <h2>Ürün düzenle</h2>
              <button type="button" className="icon-ghost" onClick={() => setEditing(null)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <div className="form-field">
              <label htmlFor="name">Ürün adı</label>
              <input id="name" name="name" defaultValue={editing.name} required />
            </div>
            <div className="form-field">
              <label htmlFor="customImageUrl">Görsel URL (admin)</label>
              <input
                id="customImageUrl"
                name="customImageUrl"
                type="url"
                placeholder="https://..."
                defaultValue={editing.customImageUrl || ""}
              />
            </div>
            <div className="form-field">
              <label htmlFor="shortDesc">Kısa açıklama</label>
              <textarea id="shortDesc" name="shortDesc" rows={3} defaultValue={editing.shortDesc || ""} />
            </div>
            <div className="form-field">
              <label htmlFor="customDescription">Detay açıklama (admin override)</label>
              <textarea
                id="customDescription"
                name="customDescription"
                rows={8}
                defaultValue={editing.customDescription || editing.description || ""}
              />
            </div>
            <label className="admin-check">
              <input name="active" type="checkbox" defaultChecked={editing.active} /> Aktif
            </label>
            <p className="admin-muted">Ticimax fiyat/stok alanları senkron ile güncellenir; görsel/açıklama override kalır.</p>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Vazgeç
              </button>
              <button type="submit" className="btn" disabled={saving}>
                <Save size={16} /> {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  );
}
