// Procedural wood-grain SVG — faithful reproduction of the <defs> in
// design/hrast.html (patterns g1/g2/g3 + turbulence displacement filters
// w1/w2/w3). Ids are namespaced per instance via useId to avoid collisions.

import { useId } from "react";
import type { Species } from "@/lib/api/content";

export type GrainPattern = "g1" | "g2" | "g3";
export type GrainFilter = "w1" | "w2" | "w3";

interface PatternRow {
  y: number;
  h: number;
  fill: string;
}

const PATTERNS: Record<GrainPattern, { height: number; rows: PatternRow[] }> = {
  g1: {
    height: 52,
    rows: [
      { y: 0, h: 52, fill: "#9C6B39" },
      { y: 6, h: 16, fill: "#AE7C46" },
      { y: 28, h: 9, fill: "#8A5A2E" },
      { y: 43, h: 4, fill: "#6E441F" },
    ],
  },
  g2: {
    height: 60,
    rows: [
      { y: 0, h: 60, fill: "#5C3A22" },
      { y: 8, h: 18, fill: "#6E472A" },
      { y: 34, h: 10, fill: "#4C2E1A" },
      { y: 50, h: 5, fill: "#3B2212" },
    ],
  },
  g3: {
    height: 46,
    rows: [
      { y: 0, h: 46, fill: "#D9C5A2" },
      { y: 5, h: 14, fill: "#E4D2B2" },
      { y: 25, h: 8, fill: "#C7B08A" },
      { y: 39, h: 4, fill: "#AE9468" },
    ],
  },
};

const FILTERS: Record<
  GrainFilter,
  { baseFrequency: string; numOctaves: number; seed: number; scale: number }
> = {
  w1: { baseFrequency: "0.013 0.09", numOctaves: 5, seed: 4, scale: 46 },
  w2: { baseFrequency: "0.011 0.075", numOctaves: 5, seed: 11, scale: 58 },
  w3: { baseFrequency: "0.015 0.10", numOctaves: 4, seed: 23, scale: 40 },
};

/** Species → pattern mapping per API contract (oak→g1, walnut/smoked_oak→g2, ash→g3). */
export function patternForSpecies(species: Species): GrainPattern {
  switch (species) {
    case "walnut":
    case "smoked_oak":
      return "g2";
    case "ash":
      return "g3";
    default:
      return "g1";
  }
}

/** Deterministic filter variation so adjacent placeholders don't repeat. */
export function grainForIndex(index: number): GrainFilter {
  const cycle: GrainFilter[] = ["w1", "w2", "w3"];
  return cycle[index % cycle.length];
}

export default function WoodGrain({
  pattern = "g1",
  grain = "w1",
  viewBox = "0 0 700 800",
  className,
}: {
  pattern?: GrainPattern;
  grain?: GrainFilter;
  viewBox?: string;
  className?: string;
}) {
  const uid = useId();
  const patternId = `${uid}p`;
  const filterId = `${uid}f`;

  const p = PATTERNS[pattern];
  const f = FILTERS[grain];

  // hrast draws the rect 10% beyond each edge (120% size) so the
  // displacement never reveals the surface edge.
  const [, , w, h] = viewBox.split(" ").map(Number);

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      focusable="false"
    >
      <defs>
        <pattern
          id={patternId}
          width={700}
          height={p.height}
          patternUnits="userSpaceOnUse"
        >
          {p.rows.map((row, i) => (
            <rect key={i} y={row.y} width={700} height={row.h} fill={row.fill} />
          ))}
        </pattern>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={f.baseFrequency}
            numOctaves={f.numOctaves}
            seed={f.seed}
          />
          <feDisplacementMap
            in="SourceGraphic"
            scale={f.scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <rect
        x={-w * 0.1}
        y={-h * 0.1}
        width={w * 1.2}
        height={h * 1.2}
        fill={`url(#${patternId})`}
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
