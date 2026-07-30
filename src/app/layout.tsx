import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfaf7",
};

export const metadata: Metadata = {
  title: {
    default: "Aromatherapica — Doğadan Gelen Bakım Ritüelleri",
    template: "%s | Aromatherapica",
  },
  description:
    "Aromatherapica doğal bakım, aromaterapi yağları ve özenli günlük ritüeller. Ürün, stok ve sipariş Ticimax üzerinden yönetilir.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/aromatherapica-emblem.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
