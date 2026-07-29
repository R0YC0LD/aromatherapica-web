"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

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
        <div className="hero-bottle">
          <span className="bottle-cap" />
          <span className="bottle-glow" />
          <span className="bottle-emblem">A</span>
          <span className="bottle-label">AROMATHERAPICA</span>
        </div>
        <p className="visual-note visual-note-top">Saf bitki özleri</p>
        <p className="visual-note visual-note-bottom">Özenli formüller</p>
      </motion.div>

      <motion.div className="hero-copy" variants={container} initial="hidden" animate="show">
        <motion.p className="eyebrow" variants={item}>
          Doğanın bilgisinden modern bakım ritüellerine
        </motion.p>
        <motion.h1 variants={item}>
          Saf içerikler.
          <br />
          Özenli ritüeller.
        </motion.h1>
        <motion.p className="hero-description" variants={item}>
          Bitkilerin özünü, duyulara hitap eden etkili bakım formülleriyle buluşturuyoruz. Günlük
          ritüelinize iyi gelecek ürünleri keşfedin.
        </motion.p>
        <motion.div className="hero-actions" variants={item}>
          <Link className="button button-primary" href="/kategori/cilt-bakimi">
            Cilt bakımını keşfet
          </Link>
          <Link className="button button-outline" href="/kategori/ucucu-yaglar">
            Aromaterapi yağları
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
