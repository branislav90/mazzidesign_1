"use client";

// Gallery — renders the variant chosen by the on-page design switcher.
import type { GallerySection, ProjectDto } from "@/lib/api/content";
import type { GalleryDict } from "@/lib/locale";
import { useDesign } from "./DesignContext";
import GalleryMosaic from "./GalleryMosaic";
import GalleryClassic from "./GalleryClassic";

export default function Gallery(props: {
  heading: GallerySection;
  projects: ProjectDto[];
  t: GalleryDict;
}) {
  const { design } = useDesign();
  return design === "classic" ? (
    <GalleryClassic {...props} />
  ) : (
    <GalleryMosaic {...props} />
  );
}
