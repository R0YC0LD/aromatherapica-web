"use client";

import { ArrowLeft } from "lucide-react";
import { useNavHistory } from "@/components/NavHistoryProvider";

export function BackButton({
  fallbackHref = "/",
  label = "Geri",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const { smartBack } = useNavHistory();

  return (
    <button type="button" className="back-nav-button" onClick={() => smartBack(fallbackHref)}>
      <ArrowLeft size={16} aria-hidden />
      {label}
    </button>
  );
}
