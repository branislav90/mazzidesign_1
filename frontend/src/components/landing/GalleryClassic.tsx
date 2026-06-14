"use client";

// Gallery — "Atelier" variant (original hrast.html): horizontal snap strip
// with round ←/→ buttons, category filter, and the shared lightbox. Selected
// via the on-page design switcher.
// base, extended per the brief with a category filter row and a lightbox.
// Cards come from CMS projects; projects without images render the
// procedural wood-grain placeholder chosen by species.

import { useRef, useState } from "react";
import type {
  GallerySection,
  ProjectDto,
  Category,
  GalleryTile,
} from "@/lib/api/content";
import { CATEGORY_ORDER, buildGalleryTiles } from "@/lib/api/content";
import type { GalleryDict } from "@/lib/locale";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import WoodGrain, { grainForIndex, patternForSpecies } from "./WoodGrain";

function StripMedia({ tile, index }: { tile: GalleryTile; index: number }) {
  const cls =
    "absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-hrast group-hover:scale-105";
  if (tile.kind === "video") {
    return tile.poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={tile.poster} alt="" loading="lazy" className={cls} />
    ) : (
      <WoodGrain
        grain={grainForIndex(index)}
        viewBox="0 0 700 700"
        className="absolute inset-[-8%] h-[116%] w-[116%]"
      />
    );
  }
  const cover = tile.project.coverImage ?? tile.project.images[0] ?? null;
  return cover ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cover.mediumUrl || cover.url}
      alt={cover.alt || tile.project.title}
      loading="lazy"
      className={cls}
    />
  ) : (
    <WoodGrain
      pattern={patternForSpecies(tile.project.species)}
      grain={grainForIndex(index)}
      viewBox="0 0 700 700"
      className="absolute inset-[-8%] h-[116%] w-[116%] transition-transform duration-1000 ease-hrast group-hover:scale-105"
    />
  );
}

export default function GalleryClassic({
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
  const tiles = buildGalleryTiles(
    filtered,
    filter === "all" ? heading.videos ?? [] : [],
  );

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
          {tiles.map((tile, i) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={
                tile.kind === "video" ? t.play : `${t.open}: ${tile.project.title}`
              }
              className="group relative h-[480px] flex-[0_0_min(480px,84vw)] snap-center overflow-hidden rounded-[20px] text-left"
            >
              <StripMedia tile={tile} index={i} />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,#1A140EB8)]"
              />
              {tile.kind === "video" ? (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 z-[2] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F7F4EF66] bg-[#F7F4EF14] backdrop-blur-[6px] [transition:transform_.6s_var(--ease),background-color_.4s,border-color_.4s] group-hover:scale-[1.12] group-hover:border-sand group-hover:bg-sand"
                >
                  <span className="ml-[5px] block border-y-[13px] border-l-[22px] border-r-0 border-solid border-y-transparent border-l-[#F7F4EF]" />
                </span>
              ) : (
                <span className="absolute bottom-6 left-6 z-[2] text-[#F7F4EF]">
                  <span className="block font-serif text-[22px] leading-[1.08]">
                    {tile.project.title}
                  </span>
                  <span className="caps text-[#D8CDBC]">
                    {t.species[tile.project.species]} · {tile.project.town}
                  </span>
                </span>
              )}
            </button>
          ))}
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

      {open !== null && tiles[open] && (
        <Lightbox
          tiles={tiles}
          index={open}
          onClose={() => setOpen(null)}
          onNav={(dir) =>
            setOpen((prev) =>
              prev === null ? prev : (prev + dir + tiles.length) % tiles.length,
            )
          }
          t={t}
        />
      )}
    </section>
  );
}
