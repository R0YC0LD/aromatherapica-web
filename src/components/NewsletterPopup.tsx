"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    if (sessionStorage.getItem(SEEN_KEY) || localStorage.getItem(SEEN_KEY)) return;

    const delay = 5000 + Math.floor(Math.random() * 10000); // 5–15s
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [settings.popupEnabled]);

  function dismiss() {
    setOpen(false);
    localStorage.setItem(SEEN_KEY, "1");
    sessionStorage.setItem(SEEN_KEY, "1");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
    window.setTimeout(dismiss, 1200);
  }

  const image = settings.popupImageUrl?.startsWith("data:")
    ? settings.popupImageUrl
    : withBasePath(settings.popupImageUrl || "/hero-bottle.png");

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="page-scrim newsletter-popup-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <motion.div
            className="newsletter-popup"
            role="dialog"
            aria-modal="true"
            aria-label="İndirim kaydı"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            <button type="button" className="close-button newsletter-popup-close" onClick={dismiss} aria-label="Kapat">
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
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
