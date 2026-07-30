"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { withBasePath } from "@/lib/paths";

const STACK_KEY = "arom_nav_stack_v1";
const SEEDED_KEY = "arom_nav_seeded_v1";

type NavHistoryContextValue = {
  smartBack: (fallbackHref?: string) => void;
};

const NavHistoryContext = createContext<NavHistoryContextValue>({
  smartBack: () => undefined,
});

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-40)));
}

export function NavHistoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin")) return;

    const here = `${window.location.pathname}${window.location.search}`;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const home = base ? `${base}/` : "/";

    // First entry from outside: seed home behind current page so Back stays in-site
    if (!sessionStorage.getItem(SEEDED_KEY)) {
      sessionStorage.setItem(SEEDED_KEY, "1");
      if (here !== home && here !== base) {
        window.history.replaceState({ arom: "home" }, "", home);
        window.history.pushState({ arom: "page" }, "", here);
        writeStack([home, here]);
        return;
      }
      writeStack([here]);
      return;
    }

    const stack = readStack();
    if (stack[stack.length - 1] !== here) {
      writeStack([...stack, here]);
    }
  }, [pathname]);

  const smartBack = useCallback(
    (fallbackHref = "/") => {
      const stack = readStack();
      if (stack.length >= 2) {
        const next = [...stack];
        next.pop(); // current
        const prev = next.pop() || withBasePath(fallbackHref);
        writeStack(next);
        // Use path without origin; router expects app path
        const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const appPath = base && prev.startsWith(base) ? prev.slice(base.length) || "/" : prev;
        router.push(appPath.startsWith("/") ? appPath : `/${appPath}`);
        return;
      }
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      router.push(fallbackHref);
    },
    [router],
  );

  const value = useMemo(() => ({ smartBack }), [smartBack]);

  return <NavHistoryContext.Provider value={value}>{children}</NavHistoryContext.Provider>;
}

export function useNavHistory() {
  return useContext(NavHistoryContext);
}
