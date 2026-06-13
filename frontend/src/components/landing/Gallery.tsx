"use client";

// Gallery — the asymmetric parallax mosaic from design/hrast-stack.html.
// Tiles are laid out on a 12-column grid with cycling spans; each tile's
// wood/photo drifts on scroll (parallax), reveals a "+" on hover, and opens
// the lightbox. Fed by CMS projects; the brief's category filter is kept above
// the mosaic (dense auto-flow keeps the grid tidy as the set changes).

import { useEffect, useRef, useState } from "react";
import type { GallerySection, ProjectDto, Category } from "@/lib/api/content";
import { CATEGORY_ORDER } from "@/lib/api/content";
import type { GalleryDict } from "@/lib/locale";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import WoodGrain, { grainForIndex, patternForSpecies } from "./WoodGrain";

// Span pattern + parallax speed per tile, cycled (matches hrast-stack t1–t6).
const TILES = [
  { span: "col-span-6 row-span-4", speed: 0.1 },
  { span: "col-span-6 row-span-3", speed: -0.07 },
  { span: "col-span-3 row-span-3", speed: 0.06 },
  { span: "col-span-3 row-span-3", speed: -0.05 },
  { span: "col-span-4 row-span-3", speed: 0.08 },
  { span: "col-span-8 row-span-3", speed: -0.06 },
];

export default function Gallery({
  heading,
  projects,
  t,
}: {
  heading: GallerySection;
  projects: ProjectDto[];
  t: GalleryDict;
}) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [open, setOpen] = useState<number | null>(null);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);

  const categories = CATEGORY_ORDER.filter((c) =>
    projects.some((p) => p.category === c),
  );
  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  // Parallax: drift each tile's media as it crosses the viewport.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const els = mediaRefs.current;
      if (reduced || window.innerWidth < 761) {
        els.forEach((el) => el && (el.style.transform = ""));
        return;
      }
      els.forEach((el, i) => {
        if (!el) return;
        const tile = el.parentElement;
        if (!tile) return;
        const r = tile.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const speed = TILES[i % TILES.length].speed;
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${off.toFixed(1)}px)`;
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
  }, [filtered.length]);

  const filterCls = (active: boolean) =>
    `border-b pb-[3px] text-[11.5px] font-semibold uppercase tracking-caps [transition:color_.4s,border-color_.4s] ${
      active ? "border-sand text-ink" : "border-transparent text-soft hover:text-ink"
    }`;

  return (
    <section id="gallery" className="border-t border-line py-[clamp(100px,12vw,170px)]">
      <Reveal className="wrap mb-16 text-center">
        <span className="caps">{heading.label}</span>
        <h2 className="mt-[22px] font-serif text-[clamp(34px,4.4vw,62px)] font-normal leading-[1.08]">
          {heading.title}
        </h2>
      </Reveal>
      <div className="wrap">
        {/* category filter */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={filterCls(filter === "all")}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={filterCls(filter === c)}
            >
              {t.categories[c]}
            </button>
          ))}
        </div>

        {/* mosaic */}
        <div className="grid auto-rows-[13vh] grid-cols-12 gap-[clamp(14px,1.8vw,24px)] [grid-auto-flow:dense] max-[900px]:auto-rows-[11vh] max-[760px]:grid-cols-1 max-[760px]:auto-rows-auto">
          {filtered.map((p, i) => {
            const cover = p.coverImage ?? p.images[0] ?? null;
            const tile = TILES[i % TILES.length];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${t.open}: ${p.title}`}
                className={`group relative overflow-hidden rounded-[18px] border border-line text-left ${tile.span} max-[760px]:!col-span-1 max-[760px]:!row-auto max-[760px]:h-[46vh]`}
              >
                <span
                  ref={(el) => {
                    mediaRefs.current[i] = el;
                  }}
                  className="absolute inset-[-14%] block h-[128%] w-[128%] will-change-transform max-[760px]:inset-[-8%] max-[760px]:h-[116%] max-[760px]:w-[116%]"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.mediumUrl || cover.url}
                      alt={cover.alt || p.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <WoodGrain
                      pattern={patternForSpecies(p.species)}
                      grain={grainForIndex(i)}
                      viewBox="0 0 700 900"
                      className="h-full w-full"
                    />
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#1A140EB0)] opacity-[.85] transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-4 z-[2] flex h-[38px] w-[38px] scale-90 items-center justify-center rounded-full border border-[#F7F4EF66] bg-[#F7F4EF1A] text-[18px] text-[#F7F4EF] opacity-0 backdrop-blur-[4px] [transition:opacity_.4s,transform_.4s_var(--ease),background-color_.3s] group-hover:scale-100 group-hover:bg-sand group-hover:opacity-100"
                >
                  +
                </span>
                <span className="absolute bottom-[18px] left-5 z-[2] translate-y-[6px] text-[#F7F4EF] opacity-90 [transition:opacity_.5s,transform_.5s_var(--ease)] group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="block font-serif text-[clamp(17px,1.7vw,22px)] leading-[1.08]">
                    {p.title}
                  </span>
                  <span className="caps text-[#D8CDBC]">
                    {t.species[p.species]} · {p.town}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {open !== null && filtered[open] && (
        <Lightbox
          projects={filtered}
          index={open}
          onClose={() => setOpen(null)}
          onNav={(dir) =>
            setOpen((prev) =>
              prev === null ? prev : (prev + dir + filtered.length) % filtered.length,
            )
          }
          t={t}
        />
      )}
    </section>
  );
}
