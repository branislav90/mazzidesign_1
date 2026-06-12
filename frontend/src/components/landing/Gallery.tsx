"use client";

// Gallery — hrast's horizontal snap strip + round ←/→ buttons as the visual
// base, extended per the brief with a category filter row and a lightbox.
// Cards come from CMS projects; projects without images render the
// procedural wood-grain placeholder chosen by species.

import { useRef, useState } from "react";
import type { GallerySection, ProjectDto, Category } from "@/lib/api/content";
import { CATEGORY_ORDER } from "@/lib/api/content";
import type { GalleryDict } from "@/lib/locale";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import WoodGrain, { grainForIndex, patternForSpecies } from "./WoodGrain";

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
  const stripRef = useRef<HTMLDivElement>(null);

  const categories = CATEGORY_ORDER.filter((c) =>
    projects.some((p) => p.category === c),
  );
  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const applyFilter = (next: "all" | Category) => {
    setFilter(next);
    setOpen(null);
    stripRef.current?.scrollTo({ left: 0 });
  };

  const filterCls = (active: boolean) =>
    `border-b pb-[3px] text-[11.5px] font-semibold uppercase tracking-caps [transition:color_.4s,border-color_.4s] ${
      active
        ? "border-sand text-ink"
        : "border-transparent text-soft hover:text-ink"
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
        {/* category filter row */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          <button
            type="button"
            onClick={() => applyFilter("all")}
            aria-pressed={filter === "all"}
            className={filterCls(filter === "all")}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applyFilter(c)}
              aria-pressed={filter === c}
              className={filterCls(filter === c)}
            >
              {t.categories[c]}
            </button>
          ))}
        </div>

        {/* horizontal snap strip */}
        <div
          ref={stripRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[6px] pb-[26px] pt-[6px]"
        >
          {filtered.map((p, i) => {
            const cover = p.coverImage ?? p.images[0] ?? null;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${t.open}: ${p.title}`}
                className="group relative h-[480px] flex-[0_0_min(480px,84vw)] snap-center overflow-hidden rounded-[20px] text-left"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover.mediumUrl || cover.url}
                    alt={cover.alt || p.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-hrast group-hover:scale-105"
                  />
                ) : (
                  <WoodGrain
                    pattern={patternForSpecies(p.species)}
                    grain={grainForIndex(i)}
                    viewBox="0 0 700 700"
                    className="absolute inset-[-8%] h-[116%] w-[116%] transition-transform duration-1000 ease-hrast group-hover:scale-105"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,#1A140EB8)]"
                />
                <span className="absolute bottom-6 left-6 z-[2] text-[#F7F4EF]">
                  <span className="block font-serif text-[22px] leading-[1.08]">
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

        {/* round prev/next */}
        <Reveal className="mt-[30px] flex justify-center gap-3">
          <button
            type="button"
            aria-label={t.prev}
            onClick={() =>
              stripRef.current?.scrollBy({ left: -500, behavior: "smooth" })
            }
            className="h-[52px] w-[52px] rounded-full border border-line bg-transparent text-[17px] text-ink [transition:background-color_.4s,color_.4s,border-color_.4s] hover:border-ink hover:bg-ink hover:text-white"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={t.next}
            onClick={() =>
              stripRef.current?.scrollBy({ left: 500, behavior: "smooth" })
            }
            className="h-[52px] w-[52px] rounded-full border border-line bg-transparent text-[17px] text-ink [transition:background-color_.4s,color_.4s,border-color_.4s] hover:border-ink hover:bg-ink hover:text-white"
          >
            →
          </button>
        </Reveal>
      </div>

      {open !== null && filtered[open] && (
        <Lightbox
          projects={filtered}
          index={open}
          onClose={() => setOpen(null)}
          onNav={(dir) =>
            setOpen((prev) =>
              prev === null
                ? prev
                : (prev + dir + filtered.length) % filtered.length,
            )
          }
          t={t}
        />
      )}
    </section>
  );
}
