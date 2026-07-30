"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { compressImageFile } from "@/lib/cms/image";
import { saveCmsSettings } from "@/lib/cms/store";
import type { CmsSettings, RitualCardSetting } from "@/lib/cms/types";
import { withBasePath } from "@/lib/paths";

function previewSrc(url?: string | null) {
  if (!url) return "";
  return url.startsWith("data:") ? url : withBasePath(url);
}

export function AdminStorefrontPanel({
  settings,
  onSaved,
}: {
  settings: CmsSettings;
  onSaved: (next: CmsSettings, message: string) => void;
}) {
  const [draft, setDraft] = useState<CmsSettings>(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function patch(partial: Partial<CmsSettings>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function patchCard(index: number, partial: Partial<RitualCardSetting>) {
    setDraft((d) => {
      const cards = [...(d.ritualCards || [])];
      cards[index] = { ...cards[index], ...partial };
      return { ...d, ritualCards: cards };
    });
  }

  async function pickImage(
    file: File | null,
    apply: (dataUrl: string) => void,
  ) {
    if (!file) return;
    setBusy(true);
    try {
      apply(await compressImageFile(file, { maxWidth: 1400, quality: 0.85 }));
    } finally {
      setBusy(false);
    }
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = saveCmsSettings(draft);
    onSaved(next, "Vitrin ayarları kaydedildi — ana sayfa hemen güncellenir.");
  }

  return (
    <form className="cms-card" onSubmit={onSave} style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <h2>Ana sayfa & menü görselleri</h2>
        <p className="cms-help">
          Hero ürün görseli, logo, favicon, duyuru bandı ve kategori kartlarını buradan yönetin.
          Telefon veya bilgisayardan galeri seçebilirsiniz.
        </p>
      </div>

      <div className="cms-fields two">
        <div className="cms-field">
          <label>Üst duyuru metni</label>
          <input
            value={draft.announcementText}
            onChange={(e) => patch({ announcementText: e.target.value })}
          />
        </div>
        <div className="cms-field">
          <label>Duyuru linki</label>
          <input
            value={draft.announcementHref}
            onChange={(e) => patch({ announcementHref: e.target.value })}
          />
        </div>
      </div>

      <div className="cms-image-picker">
        {previewSrc(draft.heroImageUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc(draft.heroImageUrl)} alt="" />
        ) : (
          <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
            Hero
          </span>
        )}
        <div>
          <strong>Ana menü / Hero ürün görseli</strong>
          <p className="cms-help" style={{ marginTop: 4 }}>
            Ana sayfanın sağındaki büyük ürün görseli.
          </p>
          <label className="cms-btn secondary" style={{ cursor: "pointer", marginTop: 8 }}>
            <ImagePlus size={16} /> Görsel seç
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) =>
                pickImage(e.target.files?.[0] || null, (url) => patch({ heroImageUrl: url }))
              }
            />
          </label>
        </div>
      </div>

      <div className="cms-fields two">
        <div className="cms-image-picker">
          {previewSrc(draft.logoUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc(draft.logoUrl)} alt="" />
          ) : (
            <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
              Logo
            </span>
          )}
          <div>
            <strong>Site logosu</strong>
            <label className="cms-btn secondary" style={{ cursor: "pointer", marginTop: 8 }}>
              <ImagePlus size={16} /> Logo seç
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  pickImage(e.target.files?.[0] || null, (url) => patch({ logoUrl: url }))
                }
              />
            </label>
          </div>
        </div>
        <div className="cms-image-picker">
          {previewSrc(draft.faviconUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc(draft.faviconUrl)} alt="" />
          ) : (
            <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
              Icon
            </span>
          )}
          <div>
            <strong>Favicon (sekme ikonu)</strong>
            <label className="cms-btn secondary" style={{ cursor: "pointer", marginTop: 8 }}>
              <ImagePlus size={16} /> Favicon seç
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  pickImage(e.target.files?.[0] || null, (url) => patch({ faviconUrl: url }))
                }
              />
            </label>
          </div>
        </div>
      </div>

      <div className="cms-fields">
        <div className="cms-field">
          <label>Hero üst yazı</label>
          <input value={draft.heroEyebrow} onChange={(e) => patch({ heroEyebrow: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>Hero başlık (satır için Enter)</label>
          <textarea
            rows={2}
            value={draft.heroTitle}
            onChange={(e) => patch({ heroTitle: e.target.value })}
          />
        </div>
        <div className="cms-field">
          <label>Hero açıklama</label>
          <textarea
            rows={3}
            value={draft.heroDescription}
            onChange={(e) => patch({ heroDescription: e.target.value })}
          />
        </div>
      </div>

      <div className="cms-fields two">
        <div className="cms-field">
          <label>CTA 1 metin</label>
          <input value={draft.heroCta1Label} onChange={(e) => patch({ heroCta1Label: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>CTA 1 link</label>
          <input value={draft.heroCta1Href} onChange={(e) => patch({ heroCta1Href: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>CTA 2 metin</label>
          <input value={draft.heroCta2Label} onChange={(e) => patch({ heroCta2Label: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>CTA 2 link</label>
          <input value={draft.heroCta2Href} onChange={(e) => patch({ heroCta2Href: e.target.value })} />
        </div>
      </div>

      <div className="cms-fields two">
        <div className="cms-field">
          <label>Öne çıkanlar başlık</label>
          <input value={draft.featuredTitle} onChange={(e) => patch({ featuredTitle: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>Öne çıkan ürün ID’leri (virgülle)</label>
          <input
            value={draft.featuredProductIds}
            onChange={(e) => patch({ featuredProductIds: e.target.value })}
            placeholder="537, 540, 512"
          />
        </div>
      </div>

      <div className="cms-fields two">
        <div className="cms-field">
          <label>Hediye bandı başlık</label>
          <input value={draft.giftTitle} onChange={(e) => patch({ giftTitle: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>Hediye bandı metin</label>
          <input value={draft.giftText} onChange={(e) => patch({ giftText: e.target.value })} />
        </div>
      </div>

      <h3>Ritüel / kategori kartları</h3>
      {(draft.ritualCards || []).map((card, index) => (
        <div key={index} className="cms-card" style={{ boxShadow: "none" }}>
          <div className="cms-image-picker">
            {previewSrc(card.imageUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc(card.imageUrl)} alt="" />
            ) : (
              <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
                Kart {index + 1}
              </span>
            )}
            <div>
              <label className="cms-btn secondary" style={{ cursor: "pointer" }}>
                <ImagePlus size={16} /> Kart görseli
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    pickImage(e.target.files?.[0] || null, (url) => patchCard(index, { imageUrl: url }))
                  }
                />
              </label>
            </div>
          </div>
          <div className="cms-fields two" style={{ marginTop: "0.75rem" }}>
            <div className="cms-field">
              <label>Başlık</label>
              <input value={card.title} onChange={(e) => patchCard(index, { title: e.target.value })} />
            </div>
            <div className="cms-field">
              <label>Alt başlık</label>
              <input
                value={card.subtitle}
                onChange={(e) => patchCard(index, { subtitle: e.target.value })}
              />
            </div>
            <div className="cms-field">
              <label>Açıklama</label>
              <input
                value={card.description}
                onChange={(e) => patchCard(index, { description: e.target.value })}
              />
            </div>
            <div className="cms-field">
              <label>Link</label>
              <input value={card.href} onChange={(e) => patchCard(index, { href: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <button className="cms-btn" type="submit" disabled={busy}>
        <Save size={16} /> {busy ? "İşleniyor…" : "Vitrini kaydet"}
      </button>
    </form>
  );
}
