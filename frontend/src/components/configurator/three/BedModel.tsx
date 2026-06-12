/* eslint-disable react/no-unknown-property */
// Parametric bed: platform + headboard + toggleable nightstands,
// under-bed drawers and floating look.

import { Panel, type GeneratorProps } from "./common";

export function BedModel({ dims, extras, palette }: GeneratorProps) {
  const W = dims.width ?? 1.6;
  const L = dims.length ?? 2;
  const HB = Math.max(0.35, dims.headboardHeight ?? 1);
  const floating = extras.includes("floating-look");
  const platformY = floating ? 0.18 : 0.1;
  const frameW = W + 0.12;
  const frameL = L + 0.12;

  return (
    <group>
      {/* base / shadow-gap plinth */}
      {!floating ? (
        <Panel
          size={[frameW - 0.1, platformY, frameL - 0.1]}
          pos={[0, platformY / 2, 0.05]}
          mat={palette.carcass}
        />
      ) : (
        <Panel size={[W * 0.6, platformY, L * 0.6]} pos={[0, platformY / 2, 0]} mat={palette.top} />
      )}
      {/* platform */}
      <Panel
        size={[frameW, 0.22, frameL]}
        pos={[0, platformY + 0.11, 0]}
        mat={palette.front}
      />
      {/* mattress hint */}
      <Panel
        size={[W - 0.06, 0.14, L - 0.1]}
        pos={[0, platformY + 0.22 + 0.07, 0.02]}
        mat={palette.light}
      />
      {/* headboard */}
      <Panel
        size={[frameW, HB, 0.05]}
        pos={[0, HB / 2, -frameL / 2 - 0.025]}
        mat={palette.front}
      />

      {extras.includes("under-bed-drawers") && (
        <>
          <Panel
            size={[frameW / 2 - 0.04, 0.16, 0.018]}
            pos={[-frameW / 4, platformY + 0.1, frameL / 2 + 0.012]}
            mat={palette.carcass}
          />
          <Panel
            size={[frameW / 2 - 0.04, 0.16, 0.018]}
            pos={[frameW / 4, platformY + 0.1, frameL / 2 + 0.012]}
            mat={palette.carcass}
          />
        </>
      )}

      {extras.includes("nightstands") &&
        [-1, 1].map((side) => (
          <group key={side} position={[side * (frameW / 2 + 0.32), 0, -frameL / 2 + 0.26]}>
            <Panel size={[0.45, 0.4, 0.42]} pos={[0, 0.24, 0]} mat={palette.carcass} />
            <Panel size={[0.41, 0.16, 0.018]} pos={[0, 0.26, 0.22]} mat={palette.front} />
            <Panel size={[0.48, 0.025, 0.45]} pos={[0, 0.455, 0]} mat={palette.top} />
          </group>
        ))}
    </group>
  );
}
