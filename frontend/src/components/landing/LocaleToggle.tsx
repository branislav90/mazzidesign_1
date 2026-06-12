"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";

export default function LocaleToggle({
  locale,
  ariaLabel,
}: {
  locale: Locale;
  ariaLabel: string;
}) {
  const router = useRouter();

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const cls = (active: boolean) =>
    `text-[12px] uppercase tracking-label transition-colors duration-[400ms] ${
      active ? "text-ink" : "text-soft hover:text-ink"
    }`;

  return (
    <div role="group" aria-label={ariaLabel} className="flex items-center gap-[10px]">
      <button
        type="button"
        onClick={() => setLocale("sl")}
        aria-pressed={locale === "sl"}
        className={cls(locale === "sl")}
      >
        SL
      </button>
      <span aria-hidden="true" className="text-soft/40">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cls(locale === "en")}
      >
        EN
      </button>
    </div>
  );
}
