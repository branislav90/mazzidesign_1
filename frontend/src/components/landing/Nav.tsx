"use client";

// Fixed nav from hrast: transparent → solid (#F7F4EFE8 + blur + bottom line)
// after 40px of scroll. Left anchor links (hidden <901px), centered serif
// brand, right Enquire → /configure plus SL/EN locale toggle.

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale, NavDict } from "@/lib/locale";
import LocaleToggle from "./LocaleToggle";

export default function Nav({ locale, t }: { locale: Locale; t: NavDict }) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link =
    "text-[12px] uppercase tracking-label text-soft transition-colors duration-[400ms] hover:text-ink";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[90] border-b [transition:background-color_.5s,border-color_.5s] ${
        solid
          ? "border-line bg-white/90 backdrop-blur-[14px]"
          : "border-transparent"
      }`}
    >
      <div className="wrap flex h-[76px] items-center justify-between">
        <div className="hidden gap-[38px] min-[901px]:flex">
          <a href="#rooms" className={link}>
            {t.rooms}
          </a>
          <a href="#gallery" className={link}>
            {t.gallery}
          </a>
        </div>
        <a
          href="#top"
          className="font-serif text-[22px] uppercase leading-[1.08] tracking-[.22em]"
        >
          mazzidesign
        </a>
        <div className="flex items-center gap-[26px]">
          <LocaleToggle locale={locale} ariaLabel={t.localeAria} />
          <Link
            href="/configure"
            className="border-b border-ink pb-[3px] text-[12px] uppercase tracking-label [transition:color_.4s,border-color_.4s] hover:border-sand hover:text-sand"
          >
            {t.enquire}
          </Link>
        </div>
      </div>
    </nav>
  );
}
