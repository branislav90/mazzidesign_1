"use client";

// Lightbox from design/hrast-stack.html: a centered figure with a large photo
// area over a caption bar (title/meta · counter · ← → ✕). Ink-tinted blurred
// backdrop, ←/→/Esc keyboard nav, focus trap, body scroll lock, click-to-close.

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
      const focusables = ref.current?.querySelectorAll<HTMLElement>("button");
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
    "flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#F7F4EF33] bg-transparent text-[18px] text-[#F7F4EF] [transition:background-color_.3s,border-color_.3s,color_.3s] hover:border-sand hover:bg-sand hover:text-ink";

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
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1A140EF2] p-[clamp(16px,4vw,60px)] outline-none backdrop-blur-[10px]"
    >
      <figure className="w-full max-w-[1040px] overflow-hidden rounded-[18px] border border-[#F7F4EF26] bg-ink">
        <div className="relative h-[clamp(300px,64vh,660px)] overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url || image.mediumUrl}
              alt={image.alt || project.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <WoodGrain
              pattern={patternForSpecies(project.species)}
              grain={grainForIndex(index)}
              viewBox="0 0 1000 700"
              className="absolute inset-[-8%] h-[116%] w-[116%]"
            />
          )}
        </div>
        <figcaption className="flex items-center justify-between gap-[14px] px-6 py-[18px] text-[#F7F4EF]">
          <span>
            <span className="block font-serif text-[21px] leading-[1.08]">
              {project.title}
            </span>
            <span className="caps mt-[3px] block text-[#A89A8C]">
              {t.species[project.species]} · {project.town} · {project.year}
            </span>
          </span>
          <span className="font-sans text-[13px] tracking-[.1em] text-[#A89A8C]">
            {index + 1} / {projects.length}
          </span>
          <span className="flex gap-2">
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
            <button
              type="button"
              onClick={onClose}
              aria-label={t.lightbox.close}
              className={navBtn}
            >
              ✕
            </button>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
