/* eslint-disable react/no-unknown-property */
// Parametric wardrobe / walk-in closet: tall carcass subdivided into door
// segments (~500–600 mm), plinth, optional open shoe section; straight,
// corner-L and walk-in-U layouts.

import type { Palette } from "./materials";
import { FrontRow, GAP, Panel, type GeneratorProps } from "./common";

const PLINTH_H = 0.06;

interface RunProps {
  length: number;
  depth: number;
  height: number;
  palette: Palette;
  shoeSection: boolean;
}

/** Origin: centered on x, back at z=0, front at z=depth. */
function WardrobeRun({ length, depth, height, palette, shoeSection }: RunProps) {
  const doorBottom = PLINTH_H + (shoeSection ? 0.44 : 0);
  const doorHeight = Math.max(0.3, height - doorBottom - 0.02);
  return (
    <group>
      {/* plinth */}
      <Panel
        size={[length - 0.04, PLINTH_H, depth - 0.04]}
        pos={[0, PLINTH_H / 2, (depth - 0.04) / 2]}
        mat={palette.carcass}
      />
      {/* carcass */}
      <Panel
        size={[length, height - PLINTH_H, depth - 0.02]}
        pos={[0, PLINTH_H + (height - PLINTH_H) / 2, (depth - 0.02) / 2]}
        mat={palette.carcass}
      />
      {/* doors (~550 mm segments, 18 mm gaps) */}
      <FrontRow
        width={length}
        height={doorHeight}
        y={doorBottom + doorHeight / 2}
        z={depth - GAP / 2}
        mat={palette.front}
        segment={0.55}
      />
      {shoeSection && (
        <>
          {/* dark recess reads as the open shoe niche */}
          <Panel
            size={[length - 0.06, 0.4, 0.012]}
            pos={[0, PLINTH_H + 0.21, depth - 0.014]}
            mat={palette.top}
          />
          {/* two open shelves */}
          <Panel
            size={[length - 0.1, 0.018, 0.12]}
            pos={[0, PLINTH_H + 0.14, depth - 0.06]}
            mat={palette.front}
          />
          <Panel
            size={[length - 0.1, 0.018, 0.12]}
            pos={[0, PLINTH_H + 0.3, depth - 0.06]}
            mat={palette.front}
          />
        </>
      )}
    </group>
  );
}

export function WardrobeModel({ dims, shape, extras, palette }: GeneratorProps) {
  const W = dims.width ?? 2.4;
  const D = dims.depth ?? 0.6;
  const H = dims.height ?? 2.2;
  const shoe = extras.includes("shoe-section");
  const leg = Math.min(2.5, Math.max(1, W * 0.5));
  const totalZ = shape === "corner-l" || shape === "walk-in-u" ? D + leg : D;

  return (
    <group position={[0, 0, -totalZ / 2]}>
      <WardrobeRun length={W} depth={D} height={H} palette={palette} shoeSection={shoe} />

      {(shape === "corner-l" || shape === "walk-in-u") && (
        <group position={[-W / 2, 0, D + leg / 2]} rotation={[0, Math.PI / 2, 0]}>
          <WardrobeRun length={leg} depth={D} height={H} palette={palette} shoeSection={false} />
        </group>
      )}
      {shape === "walk-in-u" && (
        <group position={[W / 2, 0, D + leg / 2]} rotation={[0, -Math.PI / 2, 0]}>
          <WardrobeRun length={leg} depth={D} height={H} palette={palette} shoeSection={false} />
        </group>
      )}

      {/* dresser island for walk-in closets */}
      {extras.includes("dresser-island") && (
        <group position={[0, 0, D + Math.max(0.9, totalZ - D) / 2 + 0.2]}>
          <Panel size={[1.2, 0.9, 0.6]} pos={[0, 0.45, 0]} mat={palette.carcass} />
          <Panel size={[1.26, 0.03, 0.66]} pos={[0, 0.915, 0]} mat={palette.top} />
          <FrontRow width={1.2} height={0.86} y={0.45} z={0.3 + GAP / 2} mat={palette.front} />
        </group>
      )}
    </group>
  );
}
