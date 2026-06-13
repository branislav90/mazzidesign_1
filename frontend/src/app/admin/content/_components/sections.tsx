"use client";

// One TYPED form per section key (no raw JSON editing). The same form schema
// is used for both locales — the page renders it under SL/EN tabs.
// Shapes mirror docs/API-CONTRACT.md exactly.

import { ReactNode } from "react";
import { z } from "zod";
import { SPECIES_OPTIONS } from "@/lib/api/admin";
import {
  NumberField,
  Repeater,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";
import ImagePickerField from "./ImagePickerField";

// ---------------------------------------------------------------------------
// Shared zod helpers
// ---------------------------------------------------------------------------

const str = z.string();
const urlOrEmpty = z
  .string()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/.test(v),
    "Vnesite veljaven URL (začne se s http:// ali https://).",
  );

/** Removes keys whose value is an empty/whitespace-only string. */
function stripEmpty<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): T {
  const out = { ...obj };
  for (const key of keys) {
    const v = out[key];
    if (typeof v === "string" && v.trim() === "") delete out[key];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-section types, defaults, schemas, forms
// ---------------------------------------------------------------------------

type FormProps<T> = { value: T; onChange: (v: T) => void };

export interface SectionDef<T = unknown> {
  title: string;
  defaults: T;
  schema: z.ZodTypeAny;
  /** Cleans the draft right before serializing (drop empty optionals etc.). */
  serialize: (value: T) => unknown;
  Form: (props: FormProps<T>) => ReactNode;
  /**
   * Copies locale-independent fields (image ids) from the just-edited draft
   * into the other locale's draft, so a picked image applies to SL and EN alike.
   */
  mirrorShared?: (changed: T, other: T) => T;
}

const optionalImageId = z.string().uuid().nullable().optional();

// --- hero -------------------------------------------------------------------

interface HeroJson {
  label: string;
  titleLines: { text: string; em?: string }[];
  sub: string;
  imageCaption: { title: string; meta: string };
  imageId?: string | null;
}

const heroDef: SectionDef<HeroJson> = {
  title: "Hero (uvodni del)",
  defaults: {
    label: "",
    titleLines: [],
    sub: "",
    imageCaption: { title: "", meta: "" },
    imageId: null,
  },
  schema: z.object({
    label: str,
    titleLines: z.array(z.object({ text: str.min(1), em: str.optional() })).min(1),
    sub: str,
    imageCaption: z.object({ title: str, meta: str }),
    imageId: optionalImageId,
  }),
  serialize: (v) => ({
    ...v,
    titleLines: v.titleLines.map((l) => stripEmpty(l, ["em"])),
  }),
  mirrorShared: (changed, other) => ({ ...other, imageId: changed.imageId ?? null }),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <TextField
        label="Oznaka (label)"
        value={value.label}
        onChange={(label) => onChange({ ...value, label })}
      />
      <Repeater
        label="Vrstice naslova"
        items={value.titleLines}
        onChange={(titleLines) => onChange({ ...value, titleLines })}
        makeNew={(): HeroJson["titleLines"][number] => ({ text: "" })}
        renderItem={(line, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Besedilo"
              value={line.text}
              onChange={(text) => update({ ...line, text })}
            />
            <TextField
              label="Poudarjeni del (em, neobvezno)"
              value={line.em ?? ""}
              onChange={(em) => update({ ...line, em })}
            />
          </div>
        )}
      />
      <TextAreaField
        label="Podnaslov (sub)"
        value={value.sub}
        onChange={(sub) => onChange({ ...value, sub })}
      />
      <ImagePickerField
        label="Velika slika (razširjajoča se ob drsenju)"
        value={value.imageId}
        onChange={(imageId) => onChange({ ...value, imageId })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Napis slike — naslov"
          value={value.imageCaption.title}
          onChange={(title) =>
            onChange({ ...value, imageCaption: { ...value.imageCaption, title } })
          }
        />
        <TextField
          label="Napis slike — meta"
          value={value.imageCaption.meta}
          onChange={(meta) =>
            onChange({ ...value, imageCaption: { ...value.imageCaption, meta } })
          }
        />
      </div>
    </div>
  ),
};

// --- statement ---------------------------------------------------------------

interface StatementJson {
  label: string;
  text: string;
  em?: string;
}

const statementDef: SectionDef<StatementJson> = {
  title: "Izjava (statement)",
  defaults: { label: "", text: "" },
  schema: z.object({ label: str, text: str.min(1), em: str.optional() }),
  serialize: (v) => stripEmpty({ ...v }, ["em"]),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <TextField
        label="Oznaka (label)"
        value={value.label}
        onChange={(label) => onChange({ ...value, label })}
      />
      <TextAreaField
        label="Besedilo"
        value={value.text}
        onChange={(text) => onChange({ ...value, text })}
      />
      <TextField
        label="Poudarjeni del (em, neobvezno)"
        value={value.em ?? ""}
        onChange={(em) => onChange({ ...value, em })}
      />
    </div>
  ),
};

// --- rooms --------------------------------------------------------------------

interface RoomItem {
  numeral: string;
  title: string;
  text: string;
  linkText: string;
  imageTag: { title: string; meta: string };
  species: string;
  imageId?: string | null;
}

interface RoomsJson {
  label?: string;
  title?: string;
  items: RoomItem[];
}

const roomsDef: SectionDef<RoomsJson> = {
  title: "Prostori (rooms)",
  defaults: { label: "", title: "", items: [] },
  schema: z.object({
    label: str.optional(),
    title: str.optional(),
    items: z.array(
      z.object({
        numeral: str.min(1),
        title: str.min(1),
        text: str,
        linkText: str,
        imageTag: z.object({ title: str, meta: str }),
        species: z.enum(["oak", "walnut", "ash", "smoked_oak", "other"]),
        imageId: optionalImageId,
      }),
    ),
  }),
  serialize: (v) => v,
  mirrorShared: (changed, other) => ({
    ...other,
    items: other.items.map((it, i) => ({
      ...it,
      imageId: changed.items[i]?.imageId ?? null,
    })),
  }),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Oznaka razdelka (label)"
          value={value.label ?? ""}
          onChange={(label) => onChange({ ...value, label })}
        />
        <TextField
          label="Naslov razdelka"
          value={value.title ?? ""}
          onChange={(title) => onChange({ ...value, title })}
        />
      </div>
    <Repeater
      label="Prostori"
      items={value.items}
      onChange={(items) => onChange({ ...value, items })}
      makeNew={() => ({
        numeral: "",
        title: "",
        text: "",
        linkText: "",
        imageTag: { title: "", meta: "" },
        species: "oak",
        imageId: null,
      })}
      renderItem={(item, update) => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField
              label="Rimska številka"
              value={item.numeral}
              onChange={(numeral) => update({ ...item, numeral })}
            />
            <TextField
              label="Naslov"
              value={item.title}
              onChange={(title) => update({ ...item, title })}
            />
            <TextField
              label="Besedilo povezave"
              value={item.linkText}
              onChange={(linkText) => update({ ...item, linkText })}
            />
          </div>
          <TextAreaField
            label="Besedilo"
            value={item.text}
            onChange={(text) => update({ ...item, text })}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField
              label="Oznaka slike — naslov"
              value={item.imageTag.title}
              onChange={(title) =>
                update({ ...item, imageTag: { ...item.imageTag, title } })
              }
            />
            <TextField
              label="Oznaka slike — meta"
              value={item.imageTag.meta}
              onChange={(meta) =>
                update({ ...item, imageTag: { ...item.imageTag, meta } })
              }
            />
            <SelectField
              label="Vrsta lesa"
              value={item.species}
              onChange={(species) => update({ ...item, species })}
              options={SPECIES_OPTIONS}
            />
          </div>
          <ImagePickerField
            label="Fotografija prostora"
            value={item.imageId}
            onChange={(imageId) => update({ ...item, imageId })}
          />
        </div>
      )}
    />
    </div>
  ),
};

// --- gallery -------------------------------------------------------------------

interface GalleryJson {
  label: string;
  title: string;
}

const galleryDef: SectionDef<GalleryJson> = {
  title: "Galerija (naslov razdelka)",
  defaults: { label: "", title: "" },
  schema: z.object({ label: str, title: str.min(1) }),
  serialize: (v) => v,
  Form: ({ value, onChange }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField
        label="Oznaka (label)"
        value={value.label}
        onChange={(label) => onChange({ ...value, label })}
      />
      <TextField
        label="Naslov"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      />
    </div>
  ),
};

// --- videoSection ---------------------------------------------------------------

interface VideoJson {
  label: string;
  title: string;
  youtubeId: string | null;
  videoUrl: string | null;
  captionTitle: string;
  captionMeta: string;
  coverImageId?: string | null;
  instagramPosts?: string[];
  videoPortrait?: boolean;
  videoPoster?: string | null;
  films?: { src: string; poster?: string | null }[];
}

const videoDef: SectionDef<VideoJson> = {
  title: "Video / Instagram",
  defaults: {
    label: "",
    title: "",
    youtubeId: null,
    videoUrl: null,
    captionTitle: "",
    captionMeta: "",
    coverImageId: null,
    instagramPosts: [],
    videoPortrait: false,
    videoPoster: "",
    films: [],
  },
  schema: z.object({
    label: str,
    title: str,
    youtubeId: str.nullable(),
    // Accepts an absolute URL or a site-relative path (e.g. /films/clip.mp4).
    videoUrl: str.nullable(),
    captionTitle: str,
    captionMeta: str,
    coverImageId: optionalImageId,
    instagramPosts: z.array(urlOrEmpty).optional(),
    videoPortrait: z.boolean().optional(),
    videoPoster: str.optional(),
    films: z
      .array(z.object({ src: str, poster: str.nullable().optional() }))
      .optional(),
  }),
  serialize: (v) => ({
    ...v,
    youtubeId: v.youtubeId?.trim() ? v.youtubeId.trim() : null,
    videoUrl: v.videoUrl?.trim() ? v.videoUrl.trim() : null,
    videoPoster: v.videoPoster?.trim() ? v.videoPoster.trim() : "",
    instagramPosts: (v.instagramPosts ?? [])
      .map((u) => u.trim())
      .filter((u) => u.length > 0),
  }),
  mirrorShared: (changed, other) => ({
    ...other,
    coverImageId: changed.coverImageId ?? null,
    instagramPosts: changed.instagramPosts ?? [],
    videoPortrait: changed.videoPortrait ?? false,
    videoPoster: changed.videoPoster ?? "",
    films: changed.films ?? [],
  }),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Oznaka (label)"
          value={value.label}
          onChange={(label) => onChange({ ...value, label })}
        />
        <TextField
          label="Naslov"
          value={value.title}
          onChange={(title) => onChange({ ...value, title })}
        />
        <TextField
          label="YouTube ID (neobvezno)"
          value={value.youtubeId ?? ""}
          onChange={(youtubeId) => onChange({ ...value, youtubeId })}
        />
        <TextField
          label="URL videa ali pot (npr. /films/clip.mp4)"
          value={value.videoUrl ?? ""}
          onChange={(videoUrl) => onChange({ ...value, videoUrl })}
        />
        <TextField
          label="Slika plakata (poster, neobvezno)"
          value={value.videoPoster ?? ""}
          onChange={(videoPoster) => onChange({ ...value, videoPoster })}
        />
        <TextField
          label="Napis — naslov"
          value={value.captionTitle}
          onChange={(captionTitle) => onChange({ ...value, captionTitle })}
        />
        <TextField
          label="Napis — meta"
          value={value.captionMeta}
          onChange={(captionMeta) => onChange({ ...value, captionMeta })}
        />
      </div>
      <ImagePickerField
        label="Naslovna slika videa"
        value={value.coverImageId}
        onChange={(coverImageId) => onChange({ ...value, coverImageId })}
      />
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={value.videoPortrait ?? false}
          onChange={(e) =>
            onChange({ ...value, videoPortrait: e.target.checked })
          }
        />
        Pokončni video (9:16)
      </label>
      <Repeater
        label="Filmi (gostujemo sami — mreža videov)"
        items={value.films ?? []}
        onChange={(films) => onChange({ ...value, films })}
        makeNew={() => ({ src: "", poster: "" })}
        renderItem={(film, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Pot do videa (npr. /films/clip.mp4)"
              value={film.src}
              onChange={(src) => update({ ...film, src })}
            />
            <TextField
              label="Plakat (poster, neobvezno)"
              value={film.poster ?? ""}
              onChange={(poster) => update({ ...film, poster })}
            />
          </div>
        )}
      />
      <Repeater
        label="Instagram objave (do 5 — najnovejše)"
        items={value.instagramPosts ?? []}
        onChange={(instagramPosts) => onChange({ ...value, instagramPosts })}
        makeNew={() => ""}
        renderItem={(url, update) => (
          <TextField
            label="Povezava do objave (npr. https://www.instagram.com/reel/…/ ali /p/…/)"
            value={url}
            onChange={update}
          />
        )}
      />
      <p className="text-xs text-neutral-500">
        Če je seznam prazen, razdelek prikaže posamičen video (YouTube / URL).
      </p>
    </div>
  ),
};

// --- testimonial -----------------------------------------------------------------

interface TestimonialJson {
  quote: string;
  who: string;
}

const testimonialDef: SectionDef<TestimonialJson> = {
  title: "Mnenje stranke",
  defaults: { quote: "", who: "" },
  schema: z.object({ quote: str.min(1), who: str }),
  serialize: (v) => v,
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <TextAreaField
        label="Citat"
        value={value.quote}
        onChange={(quote) => onChange({ ...value, quote })}
      />
      <TextField
        label="Avtor"
        value={value.who}
        onChange={(who) => onChange({ ...value, who })}
      />
    </div>
  ),
};

// --- stats ------------------------------------------------------------------------

interface StatsJson {
  items: { value: number; suffix?: string; label: string }[];
}

const statsDef: SectionDef<StatsJson> = {
  title: "Številke (stats)",
  defaults: { items: [] },
  schema: z.object({
    items: z.array(
      z.object({
        value: z.number(),
        suffix: str.optional(),
        label: str.min(1),
      }),
    ),
  }),
  serialize: (v) => ({
    items: v.items.map((it) => stripEmpty({ ...it }, ["suffix"])),
  }),
  Form: ({ value, onChange }) => (
    <Repeater
      label="Številke"
      items={value.items}
      onChange={(items) => onChange({ ...value, items })}
      makeNew={(): StatsJson["items"][number] => ({ value: 0, label: "" })}
      renderItem={(item, update) => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Vrednost"
            value={item.value}
            onChange={(v) => update({ ...item, value: v })}
          />
          <TextField
            label="Pripona (npr. +, neobvezno)"
            value={item.suffix ?? ""}
            onChange={(suffix) => update({ ...item, suffix })}
          />
          <TextField
            label="Oznaka"
            value={item.label}
            onChange={(label) => update({ ...item, label })}
          />
        </div>
      )}
    />
  ),
};

// --- contact -----------------------------------------------------------------------

interface ContactJson {
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

const contactDef: SectionDef<ContactJson> = {
  title: "Kontakt",
  defaults: {
    label: "",
    title: "",
    text: "",
    ctaText: "",
    altText: "",
    email: "",
    phone: "",
    phoneDisplay: "",
    address: "",
  },
  schema: z.object({
    label: str,
    title: str.min(1),
    em: str.optional(),
    text: str,
    ctaText: str,
    altText: str,
    email: str.min(1, "E-pošta je obvezna."),
    phone: str,
    phoneDisplay: str,
    address: str,
  }),
  serialize: (v) => stripEmpty({ ...v }, ["em"]),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Oznaka (label)"
          value={value.label}
          onChange={(label) => onChange({ ...value, label })}
        />
        <TextField
          label="Naslov"
          value={value.title}
          onChange={(title) => onChange({ ...value, title })}
        />
        <TextField
          label="Poudarjeni del naslova (em, neobvezno)"
          value={value.em ?? ""}
          onChange={(em) => onChange({ ...value, em })}
        />
        <TextField
          label="Besedilo gumba (ctaText)"
          value={value.ctaText}
          onChange={(ctaText) => onChange({ ...value, ctaText })}
        />
        <TextField
          label="Alternativno besedilo (altText)"
          value={value.altText}
          onChange={(altText) => onChange({ ...value, altText })}
        />
        <TextField
          label="E-pošta"
          value={value.email}
          onChange={(email) => onChange({ ...value, email })}
        />
        <TextField
          label="Telefon (tel: format)"
          value={value.phone}
          onChange={(phone) => onChange({ ...value, phone })}
        />
        <TextField
          label="Telefon (prikaz)"
          value={value.phoneDisplay}
          onChange={(phoneDisplay) => onChange({ ...value, phoneDisplay })}
        />
        <TextField
          label="Naslov (lokacija)"
          value={value.address}
          onChange={(address) => onChange({ ...value, address })}
        />
      </div>
      <TextAreaField
        label="Besedilo"
        value={value.text}
        onChange={(text) => onChange({ ...value, text })}
      />
    </div>
  ),
};

// --- socialLinks ----------------------------------------------------------------------

interface SocialJson {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

const socialDef: SectionDef<SocialJson> = {
  title: "Družbena omrežja",
  defaults: {},
  schema: z.object({
    instagram: urlOrEmpty.optional(),
    facebook: urlOrEmpty.optional(),
    youtube: urlOrEmpty.optional(),
    tiktok: urlOrEmpty.optional(),
  }),
  serialize: (v) =>
    stripEmpty({ ...v }, ["instagram", "facebook", "youtube", "tiktok"]),
  Form: ({ value, onChange }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField
        label="Instagram URL"
        value={value.instagram ?? ""}
        onChange={(instagram) => onChange({ ...value, instagram })}
      />
      <TextField
        label="Facebook URL"
        value={value.facebook ?? ""}
        onChange={(facebook) => onChange({ ...value, facebook })}
      />
      <TextField
        label="YouTube URL"
        value={value.youtube ?? ""}
        onChange={(youtube) => onChange({ ...value, youtube })}
      />
      <TextField
        label="TikTok URL"
        value={value.tiktok ?? ""}
        onChange={(tiktok) => onChange({ ...value, tiktok })}
      />
    </div>
  ),
};

// --- seo ----------------------------------------------------------------------------

interface SeoJson {
  title: string;
  description: string;
  ogImage?: string;
}

const seoDef: SectionDef<SeoJson> = {
  title: "SEO",
  defaults: { title: "", description: "" },
  schema: z.object({
    title: str.min(1),
    description: str,
    ogImage: str.optional(),
  }),
  serialize: (v) => stripEmpty({ ...v }, ["ogImage"]),
  Form: ({ value, onChange }) => (
    <div className="space-y-4">
      <TextField
        label="Naslov strani (title)"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      />
      <TextAreaField
        label="Opis (description)"
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
      />
      <TextField
        label="OG slika (URL, neobvezno)"
        value={value.ogImage ?? ""}
        onChange={(ogImage) => onChange({ ...value, ogImage })}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_DEFS: Record<string, SectionDef<any>> = {
  hero: heroDef,
  statement: statementDef,
  rooms: roomsDef,
  gallery: galleryDef,
  videoSection: videoDef,
  testimonial: testimonialDef,
  stats: statsDef,
  contact: contactDef,
  socialLinks: socialDef,
  seo: seoDef,
};

/** Preferred display order on the content page. */
export const SECTION_ORDER = [
  "hero",
  "statement",
  "rooms",
  "gallery",
  "videoSection",
  "testimonial",
  "stats",
  "contact",
  "socialLinks",
  "seo",
];
