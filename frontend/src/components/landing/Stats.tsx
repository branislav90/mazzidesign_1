"use client";

// Serif animated counters — hrast .numbers/.nm/.cn: each block is an .rv
// reveal whose number counts 0→value over 1600ms with cubic ease-out
// (1-(1-p)^3) when it enters the viewport (threshold .2, once). Suffix is
// sand-colored, non-italic. Reduced motion: final value set instantly.

import { useEffect, useRef } from "react";
import type { StatItem } from "@/lib/api/content";

export default function Stats({ items }: { items: StatItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const count = (el: HTMLElement) => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const to = Number(el.dataset.count) || 0;
      if (reduced) {
        el.textContent = String(to);
        return;
      }
      const t0 = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * e));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("in");
          const num = el.querySelector<HTMLElement>("[data-count]");
          if (num) count(num);
          io.unobserve(el);
        }),
      { threshold: 0.2 },
    );

    root
      .querySelectorAll<HTMLElement>("[data-stat]")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <section className="border-t border-line py-[clamp(90px,11vw,150px)]">
      <div
        ref={rootRef}
        className="wrap grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[50px] text-center"
      >
        {items.map((item, i) => (
          <div key={i} data-stat className="rv">
            <span className="block font-serif text-[clamp(44px,5vw,72px)] leading-[1.08]">
              <span data-count={item.value}>0</span>
              {item.suffix ? (
                <i className="not-italic text-sand">{item.suffix}</i>
              ) : null}
            </span>
            <span className="caps mt-[10px] block">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
