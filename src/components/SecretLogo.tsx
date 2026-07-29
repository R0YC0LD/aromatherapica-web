"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const SECRET_CLICK_COUNT = 5;
export const SECRET_CLICK_WINDOW_MS = 3000;

/** Pure helper — unit tested */
export function registerSecretClick(
  timestamps: number[],
  now: number,
  windowMs = SECRET_CLICK_WINDOW_MS,
  required = SECRET_CLICK_COUNT,
): { next: number[]; triggered: boolean } {
  const recent = timestamps.filter((t) => now - t <= windowMs);
  recent.push(now);
  if (recent.length >= required) {
    return { next: [], triggered: true };
  }
  return { next: recent, triggered: false };
}

interface SecretLogoProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function SecretLogo({ href = "/", className, children }: SecretLogoProps) {
  const router = useRouter();
  const clicks = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onClick = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.preventDefault();
      const now = Date.now();
      const { next, triggered } = registerSecretClick(clicks.current, now);
      clicks.current = next;

      if (timer.current) clearTimeout(timer.current);

      if (triggered) {
        router.push("/admin/");
        return;
      }

      // Incomplete burst: after window from first click, treat as normal navigation
      const first = next[0] ?? now;
      const remaining = Math.max(0, SECRET_CLICK_WINDOW_MS - (now - first)) + 50;
      timer.current = setTimeout(() => {
        if (clicks.current.length > 0 && clicks.current.length < SECRET_CLICK_COUNT) {
          clicks.current = [];
          if (href) router.push(href);
        }
      }, remaining);
    },
    [href, router],
  );

  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(e);
      }}
      aria-label="Aromatherapica ana sayfa"
    >
      {children}
    </Link>
  );
}
