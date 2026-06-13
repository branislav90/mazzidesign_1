"use client";

// Rooms — "Atelier" variant (original hrast.html): a left column pinned 100vh
// while images scroll on the right; Roman numeral / title / text cross-fade
// (280ms swap) driven by an IntersectionObserver (rootMargin -45%/-45%); images
// un-mask via clip-path inset(6% round 20px) → inset(0 round 20px). Static
// stacking below 901px. Selected via the on-page design switcher.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RoomsSection } from "@/lib/api/content";
import WoodGrain, { patternForSpecies, type GrainFilter } from "./WoodGrain";

const CHAPTER_GRAINS: GrainFilter[] = ["w3", "w1", "w2", "w2"];

export default function RoomsClassic({ section }: { section: RoomsSection }) {
  const items = section.items;
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    items.map(() => false),
  );
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = imgRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );

    const maskIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.index);
          setRevealed((prev) =>
            prev[i] ? prev : prev.map((v, j) => (j === i ? true : v)),
          );
          maskIo.unobserve(entry.target);
        }),
      { threshold: 0.2 },
    );

    const chapterIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.index);
          if (i === currentRef.current) return;
          currentRef.current = i;
          setFading(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(
            () => {
              setCurrent(i);
              setFading(false);
            },
            reduced ? 0 : 280,
          );
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );

    targets.forEach((el) => {
      maskIo.observe(el);
      chapterIo.observe(el);
    });
    return () => {
      maskIo.disconnect();
      chapterIo.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items.length]);

  const active = items[current] ?? items[0];
  if (!active) return null;

  const fade = `transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`;

  return (
    <section id="rooms" className="border-t border-line">
      <div className="wrap grid grid-cols-[.9fr_1.1fr] gap-[clamp(40px,6vw,110px)] max-[900px]:grid-cols-1">
        <div className="sticky top-0 flex h-screen flex-col justify-center max-[900px]:static max-[900px]:h-auto max-[900px]:pt-20">
          <span
            className={`mb-[18px] font-serif text-[15px] tracking-[.2em] text-sand ${fade}`}
          >
            {active.numeral}
          </span>
          <h2
            className={`font-serif text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.08] ${fade}`}
          >
            {active.title}
          </h2>
          <p className={`mt-5 max-w-[38ch] text-soft ${fade}`}>{active.text}</p>
          <Link
            href="/configure"
            className="mt-[30px] inline-block self-start border-b border-ink pb-1 text-[12px] uppercase tracking-label [transition:color_.4s,border-color_.4s] hover:border-sand hover:text-sand"
          >
            {active.linkText}
          </Link>
        </div>

        <div className="py-[14vh] max-[900px]:pb-0 max-[900px]:pt-10">
          {items.map((item, i) => (
            <div
              key={i}
              data-index={i}
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              className={`relative mb-[14vh] h-[72vh] overflow-hidden rounded-[20px] transition-[clip-path] duration-[1200ms] ease-hrast max-[900px]:mb-10 max-[900px]:h-[48vh] motion-reduce:[clip-path:none] ${
                revealed[i]
                  ? "[clip-path:inset(0_0_0_0_round_20px)]"
                  : "[clip-path:inset(6%_6%_6%_6%_round_20px)]"
              }`}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote CMS host
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <WoodGrain
                  pattern={patternForSpecies(item.species)}
                  grain={CHAPTER_GRAINS[i % CHAPTER_GRAINS.length]}
                  viewBox="0 0 700 800"
                  className="absolute inset-[-8%] h-[116%] w-[116%]"
                />
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,#1A140EA8)]"
              />
              <div className="absolute bottom-[22px] left-[22px] z-[2] text-[#F7F4EF]">
                <span className="block font-serif text-[20px] leading-[1.08]">
                  {item.imageTag.title}
                </span>
                <span className="caps text-[#D8CDBC]">{item.imageTag.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
