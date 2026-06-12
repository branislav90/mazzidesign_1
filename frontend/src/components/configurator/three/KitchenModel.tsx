/* eslint-disable react/no-unknown-property */
// Parametric kitchen cabinetry: segmented 600 mm base modules, worktop slab
// with overhang, overhead row, plinth; straight / L / U / galley / island.

import type { Palette } from "./materials";
import { FrontRow, GAP, Panel, type GeneratorProps } from "./common";

const PLINTH_H = 0.12;
const BASE_H = 0.74;
const TOP_T = 0.04;
const OVERHEAD_H = 0.72;
const OVERHEAD_D = 0.35;

interface RunProps {
  length: number;
  depth: number;
  /** Total height incl. overhead row top. */
  height: number;
  palette: Palette;
  overheads?: boolean;
}

/** One straight run. Origin: centered on x, back at z=0, front at z=depth. */
function Run({ length, depth, height, palette, overheads = true }: RunProps) {
  const showOverheads = overheads && height >= 1.8;
  return (
    <group>
      {/* plinth (recessed) */}
      <Panel
        size={[length - 0.08, PLINTH_H, depth - 0.05]}
        pos={[0, PLINTH_H / 2, (depth - 0.05) / 2]}
        mat={palette.carcass}
      />
      {/* base carcass */}
      <Panel
        size={[length, BASE_H, depth - 0.03]}
        pos={[0, PLINTH_H + BASE_H / 2, (depth - 0.03) / 2]}
        mat={palette.carcass}
      />
      {/* base fronts */}
      <FrontRow
        width={length}
        height={BASE_H - GAP}
        y={PLINTH_H + BASE_H / 2}
        z={depth - GAP / 2}
        mat={palette.front}
      />
      {/* worktop with front overhang */}
      <Panel
        size={[length + 0.04, TOP_T, depth + 0.03]}
        pos={[0, PLINTH_H + BASE_H + TOP_T / 2, depth / 2 + 0.02]}
        mat={palette.top}
      />
      {showOverheads && (
        <>
          <Panel
            size={[length, OVERHEAD_H, OVERHEAD_D - 0.01]}
            pos={[0, height - OVERHEAD_H / 2, (OVERHEAD_D - 0.01) / 2]}
            mat={palette.carcass}
          />
          <FrontRow
            width={length}
            height={OVERHEAD_H - GAP}
            y={height - OVERHEAD_H / 2}
            z={OVERHEAD_D - GAP / 2}
            mat={palette.front}
          />
        </>
      )}
    </group>
  );
}

function Island({ length, palette }: { length: number; palette: Palette }) {
  const depth = 0.95;
  return (
    <group>
      <Panel
        size={[length - 0.08, PLINTH_H, depth - 0.05]}
        pos={[0, PLINTH_H / 2, 0]}
        mat={palette.carcass}
      />
      <Panel
        size={[length, BASE_H, depth]}
        pos={[0, PLINTH_H + BASE_H / 2, 0]}
        mat={palette.carcass}
      />
      <FrontRow
        width={length}
        height={BASE_H - GAP}
        y={PLINTH_H + BASE_H / 2}
        z={depth / 2 + GAP / 2}
        mat={palette.front}
      />
      <Panel
        size={[length + 0.08, TOP_T, depth + 0.08]}
        pos={[0, PLINTH_H + BASE_H + TOP_T / 2, 0]}
        mat={palette.top}
      />
    </group>
  );
}

export function KitchenModel({ dims, shape, palette }: GeneratorProps) {
  const W = dims.width ?? 3;
  const D = dims.depth ?? 0.6;
  const H = dims.height ?? 2.2;
  const leg = Math.min(3, Math.max(1.2, W * 0.6));

  let totalZ = D;
  if (shape === "l-shaped" || shape === "u-shaped") totalZ = D + leg;
  else if (shape === "galley") totalZ = D * 2 + 1.2;
  else if (shape === "island") totalZ = D + 1.0 + 0.95;

  return (
    <group position={[0, 0, -totalZ / 2]}>
      <Run length={W} depth={D} height={H} palette={palette} />

      {(shape === "l-shaped" || shape === "u-shaped") && (
        <group position={[-W / 2, 0, D + leg / 2]} rotation={[0, Math.PI / 2, 0]}>
          <Run length={leg} depth={D} height={H} palette={palette} overheads={false} />
        </group>
      )}
      {shape === "u-shaped" && (
        <group position={[W / 2, 0, D + leg / 2]} rotation={[0, -Math.PI / 2, 0]}>
          <Run length={leg} depth={D} height={H} palette={palette} overheads={false} />
        </group>
      )}
      {shape === "galley" && (
        <group position={[0, 0, D * 2 + 1.2]} rotation={[0, Math.PI, 0]}>
          <Run length={W} depth={D} height={H} palette={palette} />
        </group>
      )}
      {shape === "island" && (
        <group position={[0, 0, D + 1.0 + 0.475]}>
          <Island length={Math.min(1.8, Math.max(1.2, W * 0.6))} palette={palette} />
        </group>
      )}
    </group>
  );
}
