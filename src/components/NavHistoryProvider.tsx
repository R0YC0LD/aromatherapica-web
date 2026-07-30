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

const STACK_KEY = "arom_nav_stack_v1";

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
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-40)));
  } catch {
    /* ignore quota */
  }
}

function toAppPath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (base && path.startsWith(base)) return path.slice(base.length) || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function NavHistoryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin")) return;
    try {
      const here = `${window.location.pathname}${window.location.search}`;
      const stack = readStack();
      if (stack[stack.length - 1] !== here) writeStack([...stack, here]);
    } catch {
      /* never break navigation */
    }
  }, [pathname]);

  const smartBack = useCallback(
    (fallbackHref = "/") => {
      try {
        const stack = readStack();
        if (stack.length >= 2) {
          const next = [...stack];
          next.pop();
          const prev = next.pop();
          writeStack(next);
          if (prev) {
            router.push(toAppPath(prev));
            return;
          }
        }
        if (window.history.length > 1) {
          router.back();
          return;
        }
      } catch {
        /* fall through */
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
