"use client";

// Floating control that lets the visitor pick the page look live. Sits
// bottom-centre as a small frosted pill in the site palette; switching is
// instant (Rooms + Gallery re-render from the design context).

import { useDesign, type Design } from "./DesignContext";

export default function DesignSwitcher({
  t,
}: {
  t: { label: string; classic: string; stack: string; aria: string };
}) {
  const { design, setDesign } = useDesign();

  const options: { value: Design; label: string }[] = [
    { value: "stack", label: t.stack },
    { value: "classic", label: t.classic },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4 print:hidden">
      <div
        role="group"
        aria-label={t.aria}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-[#F7F4EFE8] p-1 pl-4 shadow-[0_8px_30px_rgb(34_28_22/0.12)] backdrop-blur-[14px]"
      >
        <span className="caps pr-1 text-[10px]">{t.label}</span>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setDesign(o.value)}
            aria-pressed={design === o.value}
            className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-caps transition-colors duration-300 ease-hrast ${
              design === o.value
                ? "bg-ink text-white"
                : "text-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
