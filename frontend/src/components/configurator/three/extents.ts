// Approximate world-space extents (metres) of the generated model — used for
// camera framing, contact-shadow scale and dimension-label placement.

import type { ItemDef } from "@/lib/catalog";
import { stairsSteps } from "@/lib/configurator/derived";

export interface Extents {
  x: number;
  y: number;
  z: number;
  /** Bounding-sphere-ish radius for camera distance. */
  radius: number;
}

/** dims are metres (already bucketed + defaulted). */
export function modelExtents(
  item: ItemDef | null,
  shape: string | null,
  dims: Record<string, number>,
): Extents {
  let x = 1;
  let y = 1;
  let z = 1;

  if (item) {
    const w = dims.width ?? 1;
    const d = dims.depth ?? 0.6;
    const h = dims.height ?? 1;
    switch (item.generator) {
      case "kitchen": {
        x = w;
        y = Math.max(0.95, h);
        const leg = Math.min(3, Math.max(1.2, w * 0.6));
        if (shape === "l-shaped" || shape === "u-shaped") z = d + leg;
        else if (shape === "galley") z = d * 2 + 1.2;
        else if (shape === "island") z = d + 1.0 + 0.95;
        else z = d;
        if (shape === "u-shaped") x = w; // side runs sit inside the span
        break;
      }
      case "wardrobe": {
        x = w;
        y = h;
        const leg = Math.min(2.5, Math.max(1, w * 0.5));
        z = shape === "corner-l" || shape === "walk-in-u" ? d + leg : d;
        break;
      }
      case "table": {
        const l = dims.length ?? 2;
        const wd = dims.width ?? 0.95;
        x = l;
        y = dims.height ?? 0.74;
        z = shape === "round" ? l : wd;
        break;
      }
      case "bed": {
        x = (dims.width ?? 1.6) + 0.12;
        y = Math.max(0.4, dims.headboardHeight ?? 1);
        z = (dims.length ?? 2) + 0.12;
        break;
      }
      case "stairs": {
        const rise = dims.totalRise ?? 2.7;
        const sw = dims.width ?? 1;
        const { count } = stairsSteps(rise * 1000);
        const run = count * 0.27;
        y = rise;
        if (shape === "quarter-turn") {
          z = Math.ceil(count / 2) * 0.27 + sw;
          x = Math.max(sw, (count - Math.ceil(count / 2)) * 0.27 + sw);
        } else if (shape === "half-turn") {
          z = Math.ceil(count / 2) * 0.27 + sw;
          x = sw * 2 + 0.08;
        } else {
          z = run;
          x = sw;
        }
        break;
      }
      case "pergola": {
        x = w;
        y = dims.height ?? 2.4;
        z = d;
        break;
      }
      case "box": {
        x = dims.length ?? dims.width ?? 0.5;
        z = dims.length !== undefined ? (dims.width ?? 0.4) : (dims.depth ?? 0.4);
        y = dims.thickness ?? dims.height ?? 0.3;
        break;
      }
      case "trim": {
        x = 2.5;
        y = 2.4;
        z = 0.4;
        break;
      }
      case "seat": {
        x = w;
        z = d;
        y = shape === "chair" ? (dims.seatHeight ?? 0.45) + 0.45 : (dims.seatHeight ?? 0.45);
        break;
      }
    }
  }

  const radius = Math.max(0.4, Math.sqrt(x * x + y * y + z * z) / 2);
  return { x, y, z, radius };
}
