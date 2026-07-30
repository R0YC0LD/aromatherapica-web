"use client";

import { CartDrawer } from "@/components/CartDrawer";
import { NavHistoryProvider } from "@/components/NavHistoryProvider";
import { PageTransition } from "@/components/PageTransition";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { usePathname } from "next/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return (
    <NavHistoryProvider>
      <SiteHeader />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <CartDrawer />
    </NavHistoryProvider>
  );
}
