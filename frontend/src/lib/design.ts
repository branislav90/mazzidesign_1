// The six looks from /design. Two axes folded into one key:
//  • layout — "classic" uses the pinned-column rooms + strip gallery (hrast.html);
//    every other key uses the stacking cards + mosaic (hrast-stack.html).
//  • palette — applied via `data-theme` on <html> (themed CSS vars in globals.css),
//    so the landing, configurator and admin all switch together.

export type Design = "modern" | "classic" | "dark" | "dim" | "dim2" | "wood";

export const DESIGNS: Design[] = [
  "modern",
  "classic",
  "dark",
  "dim",
  "dim2",
  "wood",
];

/** data-theme value for each design ("warm" has no override block → :root). */
export const THEME_OF: Record<Design, string> = {
  modern: "warm",
  classic: "warm",
  dark: "dark",
  dim: "dim",
  dim2: "dim2",
  wood: "wood",
};

export function isClassicLayout(d: Design): boolean {
  return d === "classic";
}

/** Tolerates the old "stack" cookie value and anything unknown → "modern". */
export function normalizeDesign(value: string | undefined | null): Design {
  if (value === "stack") return "modern";
  return DESIGNS.includes(value as Design) ? (value as Design) : "modern";
}

/** Representative colours for the switcher swatch of each look. */
export const SWATCH: Record<Design, { bg: string; ink: string; sand: string }> = {
  modern: { bg: "#F7F4EF", ink: "#221C16", sand: "#C8B49A" },
  classic: { bg: "#F7F4EF", ink: "#221C16", sand: "#C8B49A" },
  dark: { bg: "#17110B", ink: "#EDE3D2", sand: "#C99B5A" },
  dim: { bg: "#2E2A26", ink: "#ECE5DA", sand: "#C7A06A" },
  dim2: { bg: "#48423A", ink: "#F0EAE0", sand: "#CBA571" },
  wood: { bg: "#EFE7D8", ink: "#2A1E13", sand: "#B8965F" },
};
