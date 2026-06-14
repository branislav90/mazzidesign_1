// Landing content API — mirrors docs/API-CONTRACT.md exactly.
// Server-only: fetched with Next tag-based caching; if the API is unreachable
// the page falls back to DEFAULT_CONTENT / DEFAULT_PROJECTS (a mirror of the
// backend seed, which itself mirrors design/hrast.html) so it always renders.

import type { Locale } from "@/lib/locale";

export type Category =
  | "kitchen"
  | "bath"
  | "bedroom"
  | "custom"
  | "millwork"
  | "outdoor";

export type Species = "oak" | "walnut" | "ash" | "smoked_oak" | "other";

export const CATEGORY_ORDER: Category[] = [
  "kitchen",
  "bath",
  "bedroom",
  "custom",
  "millwork",
  "outdoor",
];

export interface MediaRef {
  id: string;
  url: string;
  thumbUrl: string;
  mediumUrl: string;
  alt: string;
}

export interface HeroSection {
  label: string;
  titleLines: { text: string; em?: string }[];
  sub: string;
  imageCaption: { title: string; meta: string };
  /** Set in the CMS; the API resolves imageId → image. Absent → grain placeholder. */
  imageId?: string | null;
  image?: MediaRef | null;
}

export interface StatementSection {
  label: string;
  text: string;
  em?: string;
}

export interface RoomItem {
  numeral: string;
  title: string;
  text: string;
  linkText: string;
  imageTag: { title: string; meta: string };
  species: Species;
  imageId?: string | null;
  image?: MediaRef | null;
}

export interface RoomsSection {
  /** Section heading (optional in CMS; the UI supplies a default when absent). */
  label?: string;
  title?: string;
  items: RoomItem[];
}

export interface GalleryVideo {
  src: string;
  poster?: string | null;
}

export interface GallerySection {
  label: string;
  title: string;
  /** Self-hosted films shown as gallery tiles (alongside project images). */
  videos?: GalleryVideo[];
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

export interface StatsSection {
  items: StatItem[];
}

export interface ContactSection {
  label: string;
  title: string;
  em?: string;
  text: string;
  ctaText: string;
  altText: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  address: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface SeoSection {
  title: string;
  description: string;
  ogImage?: string;
}

export interface PageContent {
  hero: HeroSection;
  statement: StatementSection;
  rooms: RoomsSection;
  gallery: GallerySection;
  stats: StatsSection;
  contact: ContactSection;
  socialLinks: SocialLinks;
  seo: SeoSection;
}

export interface ProjectDto {
  id: string;
  slug: string;
  category: Category;
  title: string;
  description: string;
  species: Species;
  town: string;
  year: number;
  isFeatured: boolean;
  coverImage: MediaRef | null;
  images: MediaRef[];
}

// A gallery tile is either a self-hosted video or a project (image/grain).
export type GalleryTile =
  | { kind: "video"; id: string; src: string; poster: string | null }
  | { kind: "project"; id: string; project: ProjectDto };

/** Videos lead the gallery, followed by the (optionally filtered) projects. */
export function buildGalleryTiles(
  projects: ProjectDto[],
  videos: GalleryVideo[] = [],
): GalleryTile[] {
  return [
    ...videos.map(
      (v, i): GalleryTile => ({
        kind: "video",
        id: `video-${i}`,
        src: v.src,
        poster: v.poster ?? null,
      }),
    ),
    ...projects.map(
      (p): GalleryTile => ({ kind: "project", id: p.id, project: p }),
    ),
  ];
}

// These fetches run server-side, so prefer the internal API_URL (e.g. the
// docker service hostname) and fall back to the public one used by the browser.
const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5080";

const SOCIALS: SocialLinks = {
  instagram: "https://www.instagram.com/yourstudio",
  facebook: "https://www.facebook.com/yourstudio",
  youtube: "https://www.youtube.com/@yourstudio",
};

// Built-in default content — mirror of the CMS seed (copy from design/hrast.html).
export const DEFAULT_CONTENT: Record<Locale, PageContent> = {
  sl: {
    hero: {
      label: "Fino mizarstvo · Ljubljana · od 1998",
      titleLines: [
        { text: "Prostori, zasnovani" },
        { text: "v masivnem lesu", em: "masivnem lesu" },
      ],
      sub: "Kuhinje, kopalnice, spalnice in posamezni kosi pohištva — narisani, izdelani in vgrajeni v enem ateljeju.",
      imageCaption: {
        title: "Evropski hrast, radialno žagan",
        meta: "Material, okoli katerega gradimo dom",
      },
    },
    statement: {
      label: "Atelje",
      text: "Izdelamo malo stvari, počasi, za ljudi, ki jih nameravajo obdržati vse življenje.",
      em: "vse življenje",
    },
    rooms: {
      label: "Atelje · kaj izdelujemo",
      title: "Vsak prostor, ena delavnica",
      items: [
        {
          numeral: "I",
          title: "Kuhinja",
          text: "Prostor, kjer se zgodi vse. Načrtovana po vaših navadah, potrjena v 3D, izdelana iz radialno žaganih desk.",
          linkText: "Začnite s tem prostorom",
          imageTag: { title: "Hrastova kuhinja", meta: "Ljubljana · 2026" },
          species: "oak",
        },
        {
          numeral: "II",
          title: "Kopalnica",
          text: "Tiho shranjevanje v vlagi odpornih vrstah lesa in zaščitnih premazih — zasnovano za najmirnejši prostor v hiši.",
          linkText: "Začnite s tem prostorom",
          imageTag: { title: "Jesenova omarica", meta: "Kranj · 2025" },
          species: "ash",
        },
        {
          numeral: "III",
          title: "Spalnica",
          text: "Garderobne omare, ki delujejo kot arhitektura — od tal do stropa, od roba do roba, neslišne na tečajih.",
          linkText: "Začnite s tem prostorom",
          imageTag: { title: "Orehova garderoba", meta: "Bled · 2025" },
          species: "walnut",
        },
        {
          numeral: "IV",
          title: "Posamezni kos",
          text: "Miza, stopnice, knjižna stena. Narisan na prazen list in izdelan enkrat, za en sam naslov.",
          linkText: "Začnite s tem prostorom",
          imageTag: { title: "Jedilna miza št. 41", meta: "Škofja Loka · 2024" },
          species: "oak",
        },
      ],
    },
    gallery: {
      label: "Izbrana dela",
      title: "Iz galerije",
      videos: [
        { src: "/films/workshop.mp4", poster: "/films/workshop-poster.jpg" },
        { src: "/films/film-2.mp4", poster: "/films/film-2-poster.jpg" },
        { src: "/films/film-3.mp4", poster: "/films/film-3-poster.jpg" },
      ],
    },
    stats: {
      items: [
        { value: 27, label: "Let obrti" },
        { value: 400, suffix: "+", label: "Izvedenih prostorov" },
        { value: 5, suffix: " let", label: "Garancije" },
        { value: 1, label: "Atelje, od začetka do konca" },
      ],
    },
    contact: {
      label: "Naročila · 2026",
      title: "Začnite s pogovorom",
      em: "pogovorom",
      text: "Povejte nam o prostoru. Obiščemo vas, izmerimo in se vrnemo s 3D-zasnovo ter fiksno ponudbo — brez obveznosti.",
      ctaText: "Povpraševanje",
      altText: "ali pokličite",
      email: "atelier@hrast.si",
      phone: "+38641123456",
      phoneDisplay: "041 123 456",
      address: "Obrtna cona 12, Ljubljana",
    },
    socialLinks: SOCIALS,
    seo: {
      title: "mazzidesign — fino mizarstvo",
      description:
        "Kuhinje, kopalnice, spalnice in posamezni kosi iz masivnega lesa — en atelje v Ljubljani.",
    },
  },
  en: {
    hero: {
      label: "Fine woodwork · Ljubljana · since 1998",
      titleLines: [
        { text: "Rooms composed" },
        { text: "in solid wood", em: "solid wood" },
      ],
      sub: "Kitchens, bathrooms, bedrooms and singular pieces of furniture — drawn, built and installed by one atelier.",
      imageCaption: {
        title: "European oak, quarter-sawn",
        meta: "The material we build a house around",
      },
    },
    statement: {
      label: "The atelier",
      text: "We make few things, slowly, for people who intend to keep them for a lifetime.",
      em: "for a lifetime",
    },
    rooms: {
      label: "The atelier · what we make",
      title: "Every room, one bench",
      items: [
        {
          numeral: "I",
          title: "The kitchen",
          text: "The room where everything happens. Planned around your habits, approved in 3D, built from quarter-sawn boards.",
          linkText: "Begin with this room",
          imageTag: { title: "Oak kitchen", meta: "Ljubljana · 2026" },
          species: "oak",
        },
        {
          numeral: "II",
          title: "The bathroom",
          text: "Quiet storage in moisture-stable species and sealed finishes — composed for the calmest room of the house.",
          linkText: "Begin with this room",
          imageTag: { title: "Ash vanity", meta: "Kranj · 2025" },
          species: "ash",
        },
        {
          numeral: "III",
          title: "The bedroom",
          text: "Wardrobes and walk-ins that read as architecture — floor to ceiling, edge to edge, silent on their hinges.",
          linkText: "Begin with this room",
          imageTag: { title: "Walnut wardrobe", meta: "Bled · 2025" },
          species: "walnut",
        },
        {
          numeral: "IV",
          title: "The singular piece",
          text: "A table, a staircase, a library wall. Drawn from a blank sheet and made once, for one address only.",
          linkText: "Begin with this room",
          imageTag: { title: "Dining table No. 41", meta: "Škofja Loka · 2024" },
          species: "oak",
        },
      ],
    },
    gallery: {
      label: "Selected works",
      title: "From the gallery",
      videos: [
        { src: "/films/workshop.mp4", poster: "/films/workshop-poster.jpg" },
        { src: "/films/film-2.mp4", poster: "/films/film-2-poster.jpg" },
        { src: "/films/film-3.mp4", poster: "/films/film-3-poster.jpg" },
      ],
    },
    stats: {
      items: [
        { value: 27, label: "Years of craft" },
        { value: 400, suffix: "+", label: "Rooms delivered" },
        { value: 5, suffix: " yr", label: "Warranty" },
        { value: 1, label: "Atelier, start to finish" },
      ],
    },
    contact: {
      label: "Commissions · 2026",
      title: "Begin with a conversation",
      em: "conversation",
      text: "Tell us about the room. We visit, measure, and return with a 3D design and a fixed quote — without obligation.",
      ctaText: "Enquire",
      altText: "or call",
      email: "atelier@hrast.si",
      phone: "+38641123456",
      phoneDisplay: "041 123 456",
      address: "Obrtna cona 12, Ljubljana",
    },
    socialLinks: SOCIALS,
    seo: {
      title: "mazzidesign — fine woodwork",
      description:
        "Kitchens, bathrooms, bedrooms and singular pieces in solid wood — one atelier in Ljubljana.",
    },
  },
};

interface DefaultProjectSeed {
  slug: string;
  category: Category;
  species: Species;
  town: string;
  year: number;
  title: { sl: string; en: string };
  description: { sl: string; en: string };
}

// Mirror of the 6 seeded sample projects (gallery cards in design/hrast.html).
const PROJECT_SEEDS: DefaultProjectSeed[] = [
  {
    slug: "penthouse-kitchen",
    category: "kitchen",
    species: "oak",
    town: "Ljubljana",
    year: 2026,
    title: { sl: "Kuhinja v penthousu", en: "Penthouse kitchen" },
    description: {
      sl: "Hrastova kuhinja po meri za stanovanje na vrhu mesta.",
      en: "A bespoke oak kitchen for a flat above the city.",
    },
  },
  {
    slug: "library-wall",
    category: "millwork",
    species: "walnut",
    town: "Bled",
    year: 2025,
    title: { sl: "Knjižna stena", en: "Library wall" },
    description: {
      sl: "Orehova knjižna stena od tal do stropa.",
      en: "A floor-to-ceiling walnut library wall.",
    },
  },
  {
    slug: "double-vanity",
    category: "bath",
    species: "ash",
    town: "Maribor",
    year: 2025,
    title: { sl: "Dvojna umivalniška omarica", en: "Double vanity" },
    description: {
      sl: "Jesenova kopalniška omarica z dvema umivalnikoma.",
      en: "An ash vanity composed for two.",
    },
  },
  {
    slug: "smoked-oak-kitchen",
    category: "kitchen",
    species: "smoked_oak",
    town: "Celje",
    year: 2024,
    title: { sl: "Kuhinja iz dimljenega hrasta", en: "Smoked oak kitchen" },
    description: {
      sl: "Temna kuhinja iz dimljenega hrasta.",
      en: "A dark kitchen in smoked oak.",
    },
  },
  {
    slug: "staircase",
    category: "millwork",
    species: "oak",
    town: "Škofja Loka",
    year: 2024,
    title: { sl: "Stopnice", en: "Staircase" },
    description: {
      sl: "Hrastove stopnice, vpete v staro hišo.",
      en: "An oak staircase set into an old house.",
    },
  },
  {
    slug: "walnut-wardrobe",
    category: "bedroom",
    species: "walnut",
    town: "Bled",
    year: 2025,
    title: { sl: "Orehova garderobna omara", en: "Walnut wardrobe" },
    description: {
      sl: "Garderobna omara, ki deluje kot arhitektura.",
      en: "A wardrobe that reads as architecture.",
    },
  },
];

function projectsForLocale(locale: Locale): ProjectDto[] {
  return PROJECT_SEEDS.map((p, i) => ({
    id: `default-${i + 1}`,
    slug: p.slug,
    category: p.category,
    title: p.title[locale],
    description: p.description[locale],
    species: p.species,
    town: p.town,
    year: p.year,
    isFeatured: true,
    coverImage: null,
    images: [],
  }));
}

export const DEFAULT_PROJECTS: Record<Locale, ProjectDto[]> = {
  sl: projectsForLocale("sl"),
  en: projectsForLocale("en"),
};

export async function getPageContent(locale: Locale): Promise<PageContent> {
  const fallback = DEFAULT_CONTENT[locale];
  try {
    const res = await fetch(`${API_URL}/api/content/page?locale=${locale}`, {
      next: { tags: ["content"] },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { sections?: Partial<PageContent> };
    // Merge over defaults so missing/unpublished sections still render.
    return { ...fallback, ...(data.sections ?? {}) };
  } catch {
    return fallback;
  }
}

export async function getProjects(locale: Locale): Promise<ProjectDto[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects?locale=${locale}`, {
      next: { tags: ["projects"] },
    });
    if (!res.ok) return DEFAULT_PROJECTS[locale];
    const data = (await res.json()) as { items?: ProjectDto[] };
    return data.items ?? [];
  } catch {
    return DEFAULT_PROJECTS[locale];
  }
}
