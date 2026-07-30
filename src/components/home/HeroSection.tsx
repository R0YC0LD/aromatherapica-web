"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function HeroSection() {
  const { settings } = useCatalogOverrides();
  const heroImage = settings.heroImageUrl
    ? settings.heroImageUrl.startsWith("data:")
      ? settings.heroImageUrl
      : withBasePath(settings.heroImageUrl)
    : "";
  const titleLines = (settings.heroTitle || "").split("\n");

  return (
    <section className="hero" id="top">
      <motion.div
        className="hero-visual"
        aria-hidden="true"
        initial={{ opacity: 0, clipPath: "inset(0 16% 0 0%)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0%)" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="botanical-leaf leaf-one" />
        <div className="botanical-leaf leaf-two" />
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-photo" src={heroImage} alt="" />
        ) : (
          <div className="hero-bottle">
            <span className="bottle-cap" />
            <span className="bottle-glow" />
            <span className="bottle-emblem">A</span>
            <span className="bottle-label">AROMATHERAPICA</span>
          </div>
        )}
        <p className="visual-note visual-note-top">{settings.heroNoteTop}</p>
        <p className="visual-note visual-note-bottom">{settings.heroNoteBottom}</p>
      </motion.div>

      <motion.div className="hero-copy" variants={container} initial="hidden" animate="show">
        <motion.p className="eyebrow" variants={item}>
          {settings.heroEyebrow}
        </motion.p>
        <motion.h1 variants={item}>
          {titleLines.map((line, i) => (
            <span key={`${line}-${i}`}>
              {line}
              {i < titleLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </motion.h1>
        <motion.p className="hero-description" variants={item}>
          {settings.heroDescription}
        </motion.p>
        <motion.div className="hero-actions" variants={item}>
          <Link className="button button-primary" href={settings.heroCta1Href || "/kategori/cilt-bakimi"}>
            {settings.heroCta1Label}
          </Link>
          <Link className="button button-outline" href={settings.heroCta2Href || "/kategori/ucucu-yaglar"}>
            {settings.heroCta2Label}
          </Link>
        </motion.div>
        <motion.ul className="hero-assurances" variants={item} aria-label="Marka değerleri">
          <li>Vegan seçenekler</li>
          <li>Hayvanlar üzerinde test edilmez</li>
          <li>Güvenli ödeme</li>
        </motion.ul>
      </motion.div>
    </section>
  );
}
