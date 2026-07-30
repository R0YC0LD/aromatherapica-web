"use client";

import { CartDrawer } from "@/components/CartDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NavHistoryProvider } from "@/components/NavHistoryProvider";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { PageTransition } from "@/components/PageTransition";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WishlistDock } from "@/components/WishlistDock";
import { WishlistProvider } from "@/components/WishlistProvider";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return (
    <ErrorBoundary>
      <NavHistoryProvider>
        <WishlistProvider>
          <ErrorBoundary fallbackTitle="Üst menü yüklenemedi">
            <SiteHeader />
          </ErrorBoundary>
          <main id="main">
            <ErrorBoundary fallbackTitle="İçerik yüklenemedi">
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </main>
          <ErrorBoundary fallbackTitle="Alt bilgi yüklenemedi">
            <SiteFooter />
          </ErrorBoundary>
          <ErrorBoundary>
            <CartDrawer />
          </ErrorBoundary>
          <ErrorBoundary>
            <WishlistDock />
          </ErrorBoundary>
          <ErrorBoundary>
            <NewsletterPopup />
          </ErrorBoundary>
        </WishlistProvider>
      </NavHistoryProvider>
    </ErrorBoundary>
  );
}
