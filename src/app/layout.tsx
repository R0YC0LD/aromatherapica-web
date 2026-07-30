import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { CatalogOverridesProvider } from "@/components/cms/CatalogOverridesProvider";
import { SiteChromeEffects } from "@/components/cms/SiteChromeEffects";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

/** Readable body font with strong Turkish Latin coverage */
const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

/** Elegant display serif that stays legible at headline sizes */
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Aromatherapica — Doğadan Gelen Bakım Ritüelleri",
    template: "%s | Aromatherapica",
  },
  description:
    "Aromatherapica doğal bakım, aromaterapi yağları ve özenli günlük ritüeller. Ürün, stok ve sipariş Ticimax üzerinden yönetilir.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon.png"],
  },
  openGraph: {
    title: "Aromatherapica",
    description: "Doğadan gelen bakım ritüelleri",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${sourceSans.variable} ${libreBaskerville.variable}`}>
      <body>
        <CartProvider>
          <CatalogOverridesProvider>
            <SiteChromeEffects />
            <AppChrome>{children}</AppChrome>
          </CatalogOverridesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
