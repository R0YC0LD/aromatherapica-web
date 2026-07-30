"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";

const SEEN_KEY = "arom_popup_seen_v1";

export function NewsletterPopup() {
  const { settings } = useCatalogOverrides();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!settings.popupEnabled) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SEEN_KEY) || localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }

    const delay = 5000 + Math.floor(Math.random() * 10000); // 5–15s
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [settings.popupEnabled]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
    window.setTimeout(dismiss, 1200);
  }

  if (!open) return null;

  const image =
    typeof settings.popupImageUrl === "string" && settings.popupImageUrl.startsWith("data:")
      ? settings.popupImageUrl
      : withBasePath(
          typeof settings.popupImageUrl === "string" && settings.popupImageUrl
            ? settings.popupImageUrl
            : "/hero-bottle.png",
        );

  return (
    <>
      <div className="page-scrim newsletter-popup-scrim" onClick={dismiss} />
      <div className="newsletter-popup" role="dialog" aria-modal="true" aria-label="İndirim kaydı">
        <button
          type="button"
          className="close-button newsletter-popup-close"
          onClick={dismiss}
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
        <div className="newsletter-popup-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" />
        </div>
        <div className="newsletter-popup-copy">
          <h2>{settings.popupTitle || "İlk siparişinize %15 indirim"}</h2>
          <p>
            {settings.popupText ||
              "Yeni ürünlerden ilk siz haberdar olun, özel teklifleri kaçırmayın."}
          </p>
          {done ? (
            <p className="newsletter-popup-success">Teşekkürler — kaydınız alındı.</p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="newsletter-popup-field">
                <span className="sr-only">E-posta</span>
                <input
                  type="email"
                  required
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className="button button-primary">
                {settings.popupCta || "KAYIT OL"}
              </button>
            </form>
          )}
          <button type="button" className="newsletter-popup-dismiss" onClick={dismiss}>
            {settings.popupDismiss || "HAYIR, TEŞEKKÜRLER"}
          </button>
          <Link href={settings.popupTermsHref || "/icerik/mesafeli-satis"} onClick={dismiss}>
            *Şartlar ve koşullar
          </Link>
        </div>
      </div>
    </>
  );
}
