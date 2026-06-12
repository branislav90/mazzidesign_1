// Dimension labels shown during the dimensions step, via drei <Html>.

import { Html } from "@react-three/drei";
import type { ItemDef } from "@/lib/catalog";
import { DIMENSION_LABELS } from "@/lib/catalog";
import type { Locale } from "@/lib/configurator/i18n";
import type { Extents } from "./extents";

const Y_KEYS = new Set([
  "height",
  "totalRise",
  "thickness",
  "seatHeight",
  "headboardHeight",
  "profileHeight",
]);
const Z_KEYS = new Set(["depth"]);

interface LabelSpot {
  key: string;
  valueMm: number | null;
  position: [number, number, number];
}

function assignAxes(keys: string[]): Record<string, "x" | "y" | "z"> {
  const out: Record<string, "x" | "y" | "z"> = {};
  const taken = new Set<string>();
  for (const key of keys) {
    if (Y_KEYS.has(key) && !taken.has("y")) {
      out[key] = "y";
      taken.add("y");
    } else if (Z_KEYS.has(key) && !taken.has("z")) {
      out[key] = "z";
      taken.add("z");
    }
  }
  for (const key of keys) {
    if (out[key]) continue;
    const axis = (["x", "z", "y"] as const).find((a) => !taken.has(a));
    if (!axis) break;
    out[key] = axis;
    taken.add(axis);
  }
  return out;
}

export function DimensionLabels({
  item,
  dimensionsMm,
  extents,
  locale,
  notSureText,
}: {
  item: ItemDef;
  dimensionsMm: Record<string, number | null>;
  extents: Extents;
  locale: Locale;
  notSureText: string;
}) {
  const keys = Object.keys(item.dimensionsMm);
  const axes = assignAxes(keys);
  const pad = 0.18;

  const spots: LabelSpot[] = keys.map((key) => {
    const axis = axes[key] ?? "x";
    let position: [number, number, number];
    if (axis === "x") position = [0, 0.04, extents.z / 2 + pad];
    else if (axis === "z") position = [extents.x / 2 + pad, 0.04, 0];
    else position = [-extents.x / 2 - pad, extents.y, 0];
    return { key, valueMm: dimensionsMm[key] ?? null, position };
  });

  return (
    <>
      {spots.map(({ key, valueMm, position }) => (
        <Html key={key} position={position} center zIndexRange={[10, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-line bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-caps text-ink shadow-sm">
            {(DIMENSION_LABELS[key]?.[locale] ?? key) + " · "}
            {valueMm === null ? notSureText : `${valueMm} mm`}
          </div>
        </Html>
      ))}
    </>
  );
}
