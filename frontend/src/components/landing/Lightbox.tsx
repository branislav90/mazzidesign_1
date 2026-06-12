"use client";

// Fullscreen ink-tinted lightbox: large image (or grain placeholder),
// title/meta, ←/→ keyboard + on-screen nav, Esc closes, focus-trapped,
// body scroll locked.

import { useEffect, useRef } from "react";
import type { ProjectDto } from "@/lib/api/content";
import type { GalleryDict } from "@/lib/locale";
import WoodGrain, { grainForIndex, patternForSpecies } from "./WoodGrain";

export default function Lightbox({
  projects,
  index,
  onClose,
  onNav,
  t,
}: {
  projects: ProjectDto[];
  index: number;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
  t: GalleryDict;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const project = projects[index];
  const image = project.images[0] ?? project.coverImage ?? null;

  // focus + body scroll lock
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNav(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNav(-1);
    } else if (e.key === "Tab") {
      // minimal focus trap
      const focusables = ref.current?.querySelectorAll<HTMLElement>(
        "button, a[href]",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const navBtn =
    "flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#F7F4EF40] text-[17px] text-[#F7F4EF] [transition:background-color_.4s,color_.4s,border-color_.4s] hover:border-[#F7F4EF] hover:bg-[#F7F4EF] hover:text-ink";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.lightbox.label}: ${project.title}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1A140EF2] p-6 outline-none"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.lightbox.close}
        className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#F7F4EF40] text-[15px] text-[#F7F4EF] [transition:background-color_.4s,color_.4s,border-color_.4s] hover:border-[#F7F4EF] hover:bg-[#F7F4EF] hover:text-ink"
      >
        ✕
      </button>

      <figure className="flex w-full max-w-[1100px] flex-col items-center">
        <div className="relative h-[min(68vh,720px)] w-full overflow-hidden rounded-[20px]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url || image.mediumUrl}
              alt={image.alt || project.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <WoodGrain
              pattern={patternForSpecies(project.species)}
              grain={grainForIndex(index)}
              viewBox="0 0 1400 800"
              className="absolute inset-[-8%] h-[116%] w-[116%]"
            />
          )}
        </div>
        <figcaption className="mt-6 text-center">
          <span className="block font-serif text-[clamp(20px,2.4vw,28px)] leading-[1.08] text-[#F7F4EF]">
            {project.title}
          </span>
          <span className="caps mt-2 block text-[#D8CDBC]">
            {t.species[project.species]} · {project.town} · {project.year}
          </span>
        </figcaption>
      </figure>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => onNav(-1)}
          aria-label={t.lightbox.prev}
          className={navBtn}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onNav(1)}
          aria-label={t.lightbox.next}
          className={navBtn}
        >
          →
        </button>
      </div>
    </div>
  );
}
