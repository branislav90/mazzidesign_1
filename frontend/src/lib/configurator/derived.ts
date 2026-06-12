// Pure derived-measurement math for the configurator (AGENTS.md §5 step 4 + §8).
// All inputs are millimetres; outputs are metric (m, m², m³) rounded for display.

import type { ItemDef } from "@/lib/catalog";

/** Fill in catalog defaults for axes the customer left as "not sure" (null). */
export function effectiveDimsMm(
  item: ItemDef,
  dimensionsMm: Record<string, number | null>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, spec] of Object.entries(item.dimensionsMm)) {
    const value = dimensionsMm[key];
    out[key] = typeof value === "number" && Number.isFinite(value) ? value : spec.default;
  }
  return out;
}

/** Bucket dimensions to 10 mm so 3D geometry memoization stays stable while dragging. */
export function bucket10(dims: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(dims)) {
    out[key] = Math.round(value / 10) * 10;
  }
  return out;
}

export interface StairsSteps {
  count: number;
  riserMm: number;
}

/**
 * Step count for a staircase: risers must land between 170–185 mm.
 * Picks the smallest count whose riser is ≤185, then nudges if it dips <170.
 */
export function stairsSteps(totalRiseMm: number): StairsSteps {
  const rise = Math.max(1, totalRiseMm);
  let count = Math.max(1, Math.ceil(rise / 185));
  if (rise / count < 170 && count > 1) {
    count = Math.max(1, Math.floor(rise / 170));
  }
  return { count, riserMm: Math.round(rise / count) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Linear metres of cabinetry / trim.
 * For L runs the second leg is estimated at 60 % of the main run; U adds two
 * such legs; galley doubles the run. Documented so quoting stays predictable.
 */
export function linearMeters(
  item: ItemDef,
  shape: string | null,
  dims: Record<string, number>,
): number | undefined {
  if (item.generator === "trim") {
    const len = dims.runningLength;
    return len ? round2(len / 1000) : undefined;
  }
  if (item.generator !== "kitchen" && item.generator !== "wardrobe") return undefined;
  const run = (dims.width ?? 0) / 1000;
  if (!run) return undefined;
  switch (shape) {
    case "l-shaped":
    case "corner-l":
      return round2(run * 1.6);
    case "u-shaped":
    case "walk-in-u":
      return round2(run * 2.2);
    case "galley":
      return round2(run * 2);
    case "island":
      return round2(run + 1.8); // straight run + ~1.8 m island block
    default:
      return round2(run);
  }
}

/** m² of fronts: kitchens count base (720 mm) + overhead (700 mm) bands; wardrobes full doors. */
export function frontAreaM2(
  item: ItemDef,
  shape: string | null,
  dims: Record<string, number>,
): number | undefined {
  const lm = linearMeters(item, shape, dims);
  if (item.generator === "kitchen") {
    if (!lm) return undefined;
    const hasOverheads = (dims.height ?? 0) >= 1800;
    return round2(lm * (0.72 + (hasOverheads ? 0.7 : 0)));
  }
  if (item.generator === "wardrobe") {
    if (!lm) return undefined;
    const doorHeight = Math.max(0, (dims.height ?? 0) - 60) / 1000; // minus plinth
    return round2(lm * doorHeight);
  }
  return undefined;
}

/** Rough board-volume estimate in m³ (18 mm panels / solid stock heuristics). */
export function boardVolumeM3(
  item: ItemDef,
  shape: string | null,
  dims: Record<string, number>,
): number | undefined {
  const PANEL = 0.018; // m
  switch (item.generator) {
    case "kitchen":
    case "wardrobe": {
      const area = frontAreaM2(item, shape, dims);
      if (!area) return undefined;
      // fronts + carcass (sides, backs, shelving) ≈ 3× the front area in panels
      return round3(area * 3 * PANEL);
    }
    case "box": {
      const l = (dims.length ?? dims.width ?? 0) / 1000;
      const w = (dims.width ?? dims.depth ?? 0) / 1000;
      const h = (dims.thickness ?? dims.height ?? 0) / 1000;
      const v = l * w * h;
      return v ? round3(v) : undefined;
    }
    case "table": {
      const top = ((dims.length ?? 0) / 1000) * ((dims.width ?? 0) / 1000) * 0.04;
      const legs = 4 * 0.08 * 0.08 * ((dims.height ?? 740) / 1000);
      const v = top + legs;
      return v ? round3(v) : undefined;
    }
    case "trim": {
      const len = (dims.runningLength ?? 0) / 1000;
      const profile = ((dims.profileHeight ?? 0) / 1000) * 0.02; // ~20 mm thick profile
      const v = len * profile;
      return v ? round3(v) : undefined;
    }
    default:
      return undefined;
  }
}

export interface DerivedFigures {
  linearMeters?: number;
  frontAreaM2?: number;
  boardVolumeM3?: number;
}

/** The `derived` block of the enquiry payload (contract §8). */
export function derivedFigures(
  item: ItemDef,
  shape: string | null,
  dimensionsMm: Record<string, number | null>,
): DerivedFigures {
  const dims = effectiveDimsMm(item, dimensionsMm);
  const out: DerivedFigures = {};
  const lm = linearMeters(item, shape, dims);
  const fa = frontAreaM2(item, shape, dims);
  const bv = boardVolumeM3(item, shape, dims);
  if (lm !== undefined) out.linearMeters = lm;
  if (fa !== undefined) out.frontAreaM2 = fa;
  if (bv !== undefined) out.boardVolumeM3 = bv;
  return out;
}
