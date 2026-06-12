"use client";

// Signature scroll-expanding image from hrast: 170vh zone with a sticky 100vh
// pin; the panel starts at scale(.62)/radius 28px and expands to scale(1)/
// radius 0 driven by scroll progress (p = -rect.top / (zoneH - viewportH)),
// caption fades in past 85% progress. Static full-size below 901px and for
// prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import WoodGrain from "./WoodGrain";

export default function ExpandingHero({
  caption,
}: {
  caption: { title: string; meta: string };
}) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    const panel = panelRef.current;
    if (!zone || !panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (reduced || window.innerWidth < 901) {
        panel.style.transform = "";
        panel.style.borderRadius = "";
        return;
      }
      const rect = zone.getBoundingClientRect();
      const total = zone.offsetHeight - window.innerHeight;
      const p = Math.min(Math.max(-rect.top / total, 0), 1);
      const s = 0.62 + p * 0.38;
      panel.style.transform = `scale(${s.toFixed(4)})`;
      panel.style.borderRadius = `${(28 - p * 28).toFixed(1)}px`;
      setFull(p > 0.85);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={zoneRef}
      className="relative mt-[60px] h-[170vh] max-[900px]:mt-10 max-[900px]:h-auto"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden max-[900px]:static max-[900px]:h-auto max-[900px]:overflow-visible">
        <div
          ref={panelRef}
          className="relative h-[84vh] w-full scale-[.62] overflow-hidden rounded-[28px] will-change-[transform,border-radius] max-[900px]:h-[54vh] max-[900px]:scale-100 max-[900px]:rounded-[20px] motion-reduce:scale-100 motion-reduce:rounded-[28px]"
        >
          <WoodGrain
            pattern="g1"
            grain="w1"
            viewBox="0 0 1400 800"
            className="absolute inset-[-8%] h-[116%] w-[116%]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#1A140EBF)]"
          />
          <div
            className={`absolute inset-x-0 bottom-[42px] z-[2] text-center text-[#F7F4EF] transition-opacity duration-[800ms] max-[900px]:opacity-100 motion-reduce:opacity-100 ${
              full ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="block font-serif text-[clamp(22px,2.6vw,34px)] leading-[1.08]">
              {caption.title}
            </span>
            <span className="caps mt-2 block text-[#D8CDBC]">{caption.meta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
