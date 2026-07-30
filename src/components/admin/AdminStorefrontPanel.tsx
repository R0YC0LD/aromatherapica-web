"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { compressImageFile } from "@/lib/cms/image";
import {
  getPublishToken,
  publishStorefrontToGithub,
  setPublishToken,
} from "@/lib/cms/remote";
import { getCmsState, saveCmsSettings } from "@/lib/cms/store";
import type { CmsSettings, ConscienceItemSetting, RitualCardSetting } from "@/lib/cms/types";
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
  const [token, setToken] = useState("");
  const [publishNote, setPublishNote] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
    setToken(getPublishToken());
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

  function patchConscience(index: number, partial: Partial<ConscienceItemSetting>) {
    setDraft((d) => {
      const items = [...(d.conscienceItems || [])];
      items[index] = { ...items[index], ...partial };
      return { ...d, conscienceItems: items };
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

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setPublishNote(null);
    try {
      setPublishToken(token);
      const next = saveCmsSettings(draft);
      const publishToken = token.trim() || getPublishToken();
      if (publishToken) {
        const result = await publishStorefrontToGithub(getCmsState(), publishToken);
        if (result.ok) {
          onSaved(
            next,
            "Kaydedildi ve global yayınlandı — tüm ziyaretçiler bu değişiklikleri görür.",
          );
          setPublishNote(`Yayınlandı: ${result.htmlUrl}`);
        } else {
          onSaved(next, `Yerelde kaydedildi ama yayın başarısız: ${result.error}`);
          setPublishNote(result.error);
        }
      } else {
        onSaved(
          next,
          "Yerelde kaydedildi. Global yayın için aşağıya GitHub token ekleyip tekrar kaydedin.",
        );
      }
    } finally {
      setBusy(false);
    }
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

      <h3>İndirim popup (tek seferlik)</h3>
      <label className="cms-check">
        <input
          type="checkbox"
          checked={draft.popupEnabled}
          onChange={(e) => patch({ popupEnabled: e.target.checked })}
        />
        Popup aktif (5–15 sn sonra, bir kez)
      </label>
      <div className="cms-image-picker">
        {previewSrc(draft.popupImageUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc(draft.popupImageUrl)} alt="" />
        ) : (
          <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
            Popup
          </span>
        )}
        <div>
          <strong>Popup sol görsel</strong>
          <label className="cms-btn secondary" style={{ cursor: "pointer", marginTop: 8 }}>
            <ImagePlus size={16} /> Görsel seç
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                pickImage(e.target.files?.[0] || null, (url) => patch({ popupImageUrl: url }))
              }
            />
          </label>
        </div>
      </div>
      <div className="cms-fields two">
        <div className="cms-field">
          <label>Popup başlık</label>
          <input value={draft.popupTitle} onChange={(e) => patch({ popupTitle: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>CTA metni</label>
          <input value={draft.popupCta} onChange={(e) => patch({ popupCta: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>Popup metin</label>
          <textarea rows={3} value={draft.popupText} onChange={(e) => patch({ popupText: e.target.value })} />
        </div>
        <div className="cms-field">
          <label>Reddet metni</label>
          <input value={draft.popupDismiss} onChange={(e) => patch({ popupDismiss: e.target.value })} />
        </div>
      </div>

      <h3>Arama — çok satanlar</h3>
      <div className="cms-fields two">
        <div className="cms-field">
          <label>Başlık</label>
          <input
            value={draft.searchBestsellersTitle}
            onChange={(e) => patch({ searchBestsellersTitle: e.target.value })}
          />
        </div>
        <div className="cms-field">
          <label>Ürün ID’leri (virgülle — tıklanınca ürüne gider)</label>
          <input
            value={draft.searchBestsellerIds}
            onChange={(e) => patch({ searchBestsellerIds: e.target.value })}
            placeholder="537, 540, 512, 501"
          />
        </div>
      </div>

      <h3>Özenle alışveriş</h3>
      <div className="cms-field">
        <label>Bölüm başlığı</label>
        <input
          value={draft.conscienceTitle}
          onChange={(e) => patch({ conscienceTitle: e.target.value })}
        />
      </div>
      {(draft.conscienceItems || []).map((item, index) => (
        <div key={index} className="cms-card" style={{ boxShadow: "none" }}>
          <div className="cms-image-picker">
            {previewSrc(item.imageUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc(item.imageUrl)} alt="" />
            ) : (
              <span className="cms-thumb placeholder" style={{ width: 120, height: 120 }}>
                İkon
              </span>
            )}
            <div>
              <label className="cms-btn secondary" style={{ cursor: "pointer" }}>
                <ImagePlus size={16} /> Yuvarlak görsel
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    pickImage(e.target.files?.[0] || null, (url) =>
                      patchConscience(index, { imageUrl: url }),
                    )
                  }
                />
              </label>
            </div>
          </div>
          <div className="cms-fields two" style={{ marginTop: "0.75rem" }}>
            <div className="cms-field">
              <label>Başlık</label>
              <input
                value={item.title}
                onChange={(e) => patchConscience(index, { title: e.target.value })}
              />
            </div>
            <div className="cms-field">
              <label>Açıklama</label>
              <input
                value={item.text}
                onChange={(e) => patchConscience(index, { text: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}

      <h3>Footer</h3>
      <div className="cms-fields">
        <div className="cms-field">
          <label>Footer hakkında metni</label>
          <textarea
            rows={2}
            value={draft.footerAbout}
            onChange={(e) => patch({ footerAbout: e.target.value })}
          />
        </div>
      </div>

      <h3>Global yayın (tüm cihazlar)</h3>
      <p className="cms-help">
        GitHub Fine-grained / classic PAT (repo Contents: Read+Write) girin. Kaydetince
        <code> public/data/storefront.json </code> güncellenir; her ziyaretçi bu dosyayı okur.
      </p>
      <div className="cms-field">
        <label>GitHub publish token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_… veya github_pat_…"
          autoComplete="off"
        />
      </div>
      {publishNote ? <p className="cms-help">{publishNote}</p> : null}

      <button className="cms-btn" type="submit" disabled={busy}>
        <Save size={16} /> {busy ? "Yayınlanıyor…" : "Kaydet ve global yayınla"}
      </button>
    </form>
  );
}
