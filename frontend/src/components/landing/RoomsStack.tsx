"use client";

// Rooms ("chapters") — the client-approved stacking-cards direction from
// design/hrast-stack.html (the mizar scroll-stack, sanctioned per AGENTS §1).
// A centered header over a column of sticky cards that scale + dim as the next
// card slides over them. CMS-driven: one card per rooms.items entry; cards
// without a photo render the procedural wood-grain placeholder by species.

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { RoomItem, RoomsSection } from "@/lib/api/content";
import Reveal from "./Reveal";
import WoodGrain, { patternForSpecies, type GrainFilter } from "./WoodGrain";

// hrast-stack palette per card, cycled when there are more than four rooms.
const CARDS = [
  { bg: "#EFE9DE", fg: "text-ink", num: "text-sand" },
  { bg: "#221C16", fg: "text-[#EFE5D8]", num: "text-[#D8CDBC]" },
  { bg: "#E5DCCB", fg: "text-ink", num: "text-sand" },
  { bg: "#C8B49A", fg: "text-[#241C10]", num: "text-[#241C10]" },
];
const CHAPTER_GRAINS: GrainFilter[] = ["w3", "w1", "w2", "w2"];

export default function RoomsStack({
  section,
  heading,
}: {
  section: RoomsSection;
  heading: { label: string; title: string };
}) {
  const items = section.items;
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Scroll-stack: each card (except the last) scales down + dims as the next
  // approaches the top, so they read as a deck. Off on mobile / reduced motion.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      const cards = cardRefs.current.filter(
        (el): el is HTMLElement => el !== null,
      );
      if (reduced || window.innerWidth < 901) {
        cards.forEach((c) => {
          c.style.transform = "";
          c.style.filter = "";
        });
        return;
      }
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const next = cards[i + 1];
        if (!next) return;
        const nextTop = next.getBoundingClientRect().top;
        const prog = Math.min(
          Math.max(1 - (nextTop - 140) / window.innerHeight, 0),
          1,
        );
        card.style.transform = `scale(${1 - prog * 0.06}) translateY(${prog * -14}px)`;
        card.style.filter = `brightness(${1 - prog * 0.16})`;
      });
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
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section
      id="rooms"
      className="border-t border-line py-[clamp(80px,10vw,140px)]"
    >
      <div className="wrap">
        <Reveal className="mb-16 text-center">
          <span className="caps mb-[22px] block">{heading.label}</span>
          <h2 className="font-serif text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.08]">
            {heading.title}
          </h2>
        </Reveal>

        <div className="flex flex-col gap-6">
          {items.map((item, i) => {
            const c = CARDS[i % CARDS.length];
            return (
              <article
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{ top: `${96 + i * 20}px`, backgroundColor: c.bg }}
                className={`sticky grid min-h-[400px] grid-cols-[1.1fr_.9fr] overflow-hidden rounded-[24px] border border-line will-change-transform max-[900px]:static max-[900px]:grid-cols-1 ${c.fg}`}
              >
                <div className="flex flex-col justify-between gap-[30px] p-[clamp(30px,4vw,56px)]">
                  <div>
                    <span
                      className={`font-serif text-[16px] tracking-[.2em] ${c.num}`}
                    >
                      {item.numeral}
                    </span>
                    <h3 className="mb-[14px] mt-4 font-serif text-[clamp(30px,3.6vw,50px)] leading-[1.08]">
                      {item.title}
                    </h3>
                    <p className="max-w-[46ch] text-[16.5px] opacity-[.78]">
                      {item.text}
                    </p>
                  </div>
                  <Link
                    href="/configure"
                    className="self-start border-b border-current pb-1 text-[12px] uppercase tracking-label transition-opacity duration-300 hover:opacity-60"
                  >
                    {item.linkText}
                  </Link>
                </div>
                <div className="relative min-h-[260px] overflow-hidden max-[900px]:order-first max-[900px]:min-h-[200px]">
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
                      viewBox="0 0 700 700"
                      className="absolute inset-[-8%] h-[116%] w-[116%]"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export type { RoomItem };
