import type { Metadata } from "next";
import { DM_Sans, Italiana } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

const italiana = Italiana({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Aromatherapica — Doğadan Gelen Bakım Ritüelleri",
    template: "%s | Aromatherapica",
  },
  description:
    "Aromatherapica doğal bakım, aromaterapi yağları ve özenli günlük ritüeller. Ürün, stok ve sipariş Ticimax üzerinden yönetilir.",
  openGraph: {
    title: "Aromatherapica",
    description: "Doğadan gelen bakım ritüelleri",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${italiana.variable}`}>
      <body>
        <CartProvider>
          <AppChrome>{children}</AppChrome>
        </CartProvider>
      </body>
    </html>
  );
}
