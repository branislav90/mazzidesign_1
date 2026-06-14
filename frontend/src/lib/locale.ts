// Locale helper + Slovenian-first UI strings.
// NOTE: this module imports next/headers (server-only). Client components must
// only `import type` from here; runtime strings are passed down as props.

import { cookies } from "next/headers";
import type { Category, Species } from "@/lib/api/content";
import { type Design, normalizeDesign } from "@/lib/design";

export type Locale = "sl" | "en";

export const LOCALES: Locale[] = ["sl", "en"];

/** Reads the "locale" cookie ('sl' default | 'en'). Server-only. */
export function getLocale(): Locale {
  const value = cookies().get("locale")?.value;
  return value === "en" ? "en" : "sl";
}

/** Reads the "design" cookie → one of the six looks (default "modern"). Server-only. */
export function getDesign(): Design {
  return normalizeDesign(cookies().get("design")?.value);
}

export interface NavDict {
  rooms: string;
  gallery: string;
  film: string;
  enquire: string;
  localeAria: string;
}

export interface GalleryDict {
  all: string;
  categories: Record<Category, string>;
  species: Record<Species, string>;
  prev: string;
  next: string;
  open: string;
  lightbox: { label: string; close: string; prev: string; next: string };
}

export interface VideoDict {
  play: string;
  noFilm: string;
}

export interface UiDict {
  nav: NavDict;
  footer: { line: string };
  rooms: { label: string; title: string };
  gallery: GalleryDict;
  video: VideoDict;
  design: { label: string; aria: string; names: Record<Design, string> };
}

export const UI: Record<Locale, UiDict> = {
  sl: {
    nav: {
      rooms: "Prostori",
      gallery: "Galerija",
      film: "Film",
      enquire: "Povpraševanje",
      localeAria: "Izbira jezika",
    },
    footer: {
      line: "Kuhinje · Kopalnice · Spalnice · Posamezni kosi · © 2026",
    },
    rooms: {
      label: "Atelje · kaj izdelujemo",
      title: "Vsak prostor, ena delavnica",
    },
    gallery: {
      all: "Vse",
      categories: {
        kitchen: "Kuhinje",
        bath: "Kopalnice",
        bedroom: "Spalnice",
        custom: "Po meri",
        millwork: "Mizarstvo",
        outdoor: "Zunanje",
      },
      species: {
        oak: "Hrast",
        walnut: "Oreh",
        ash: "Jesen",
        smoked_oak: "Dimljen hrast",
        other: "Drugo",
      },
      prev: "Prejšnje",
      next: "Naslednje",
      open: "Odpri projekt",
      lightbox: {
        label: "Povečan pogled projekta",
        close: "Zapri",
        prev: "Prejšnji projekt",
        next: "Naslednji projekt",
      },
    },
    video: {
      play: "Predvajaj film",
      noFilm: "Film bo kmalu na voljo.",
    },
    design: {
      label: "Videz",
      aria: "Izbira videza strani",
      names: {
        modern: "Sodobno",
        classic: "Klasično",
        dark: "Temno",
        dim: "Mrak",
        dim2: "Kamen",
        wood: "Les",
      },
    },
  },
  en: {
    nav: {
      rooms: "Rooms",
      gallery: "Gallery",
      film: "Film",
      enquire: "Enquire",
      localeAria: "Language",
    },
    footer: {
      line: "Kitchens · Bathrooms · Bedrooms · Singular pieces · © 2026",
    },
    rooms: {
      label: "The atelier · what we make",
      title: "Every room, one bench",
    },
    gallery: {
      all: "All",
      categories: {
        kitchen: "Kitchens",
        bath: "Bathrooms",
        bedroom: "Bedrooms",
        custom: "Custom",
        millwork: "Millwork",
        outdoor: "Outdoor",
      },
      species: {
        oak: "Oak",
        walnut: "Walnut",
        ash: "Ash",
        smoked_oak: "Smoked oak",
        other: "Other",
      },
      prev: "Previous",
      next: "Next",
      open: "Open project",
      lightbox: {
        label: "Enlarged project view",
        close: "Close",
        prev: "Previous project",
        next: "Next project",
      },
    },
    video: {
      play: "Play film",
      noFilm: "The film is coming soon.",
    },
    design: {
      label: "Look",
      aria: "Choose page look",
      names: {
        modern: "Modern",
        classic: "Classic",
        dark: "Dark",
        dim: "Dim",
        dim2: "Stone",
        wood: "Wood",
      },
    },
  },
};
