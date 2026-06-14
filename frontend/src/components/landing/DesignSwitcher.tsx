"use client";

// Floating control to pick any of the six looks live. Each option is a small
// swatch (the look's paper + ink + sand) with its name; the active one is ringed.
// Switching is instant — Rooms/Gallery re-render and the palette (data-theme on
// <html>) updates across the whole site.

import { useDesign } from "./DesignContext";
import { DESIGNS, SWATCH, type Design } from "@/lib/design";

export default function DesignSwitcher({
  t,
}: {
  t: { label: string; aria: string; names: Record<Design, string> };
}) {
  const { design, setDesign } = useDesign();

  // The switch only restyles the Rooms + Gallery sections — if neither is on
  // screen, glide to Rooms so the change is visible.
  const pick = (value: Design) => {
    if (value === design) return;
    setDesign(value);
    const inView = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    if (!inView("rooms") && !inView("gallery")) {
      document
        .getElementById("rooms")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4 print:hidden">
      <div
        role="group"
        aria-label={t.aria}
        className="pointer-events-auto flex max-w-[94vw] flex-wrap items-center justify-center gap-1.5 rounded-[22px] border border-line bg-white/90 px-3 py-2 shadow-[0_8px_30px_rgb(34_28_22/0.12)] backdrop-blur-[14px]"
      >
        <span className="caps mr-1 text-[10px]">{t.label}</span>
        {DESIGNS.map((key) => {
          const active = design === key;
          const sw = SWATCH[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => pick(key)}
              aria-pressed={active}
              title={t.names[key]}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-caps transition-colors duration-300 ${
                active ? "bg-ink text-white" : "text-soft hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-line"
                style={{ backgroundColor: sw.bg }}
              >
                <span
                  className="absolute bottom-0 left-0 top-0 w-1/2"
                  style={{ backgroundColor: sw.ink }}
                />
                <span
                  className="absolute right-[3px] top-[3px] h-[6px] w-[6px] rounded-full"
                  style={{ backgroundColor: sw.sand }}
                />
              </span>
              {t.names[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
