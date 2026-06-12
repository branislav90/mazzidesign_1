/* eslint-disable react/no-unknown-property */
// Parametric seating: chair (with backrest), bench, stool — simple frames.

import { RoundedBox } from "@react-three/drei";
import type { Palette } from "./materials";
import { Panel, type GeneratorProps } from "./common";

const SEAT_T = 0.04;
const LEG = 0.045;

function LegSet({
  width,
  depth,
  height,
  palette,
}: {
  width: number;
  depth: number;
  height: number;
  palette: Palette;
}) {
  const lx = width / 2 - LEG / 2 - 0.02;
  const lz = depth / 2 - LEG / 2 - 0.02;
  return (
    <>
      {[
        [lx, lz],
        [lx, -lz],
        [-lx, lz],
        [-lx, -lz],
      ].map(([x, z], i) => (
        <Panel key={i} size={[LEG, height, LEG]} pos={[x, height / 2, z]} mat={palette.carcass} />
      ))}
    </>
  );
}

export function SeatModel({ dims, shape, extras, palette }: GeneratorProps) {
  const W = dims.width ?? 0.45;
  const D = dims.depth ?? 0.45;
  const SH = dims.seatHeight ?? 0.45;
  const legH = SH - SEAT_T;

  const seat = (
    <RoundedBox
      args={[W, SEAT_T, D]}
      radius={0.01}
      smoothness={2}
      position={[0, SH - SEAT_T / 2, 0]}
      castShadow
      receiveShadow
      material={palette.front}
    />
  );

  if (shape === "chair") {
    const backH = 0.45;
    const postX = W / 2 - LEG / 2 - 0.02;
    const backZ = -D / 2 + LEG / 2 + 0.02;
    return (
      <group>
        {seat}
        <LegSet width={W} depth={D} height={legH} palette={palette} />
        {/* back posts continue up from the rear legs */}
        {[-postX, postX].map((x, i) => (
          <Panel
            key={i}
            size={[LEG, backH, LEG]}
            pos={[x, SH + backH / 2, backZ]}
            mat={palette.carcass}
          />
        ))}
        {/* top rail + middle slat */}
        <Panel
          size={[W - 0.02, 0.09, 0.025]}
          pos={[0, SH + backH - 0.045, backZ]}
          mat={palette.front}
        />
        <Panel
          size={[W - 0.08, 0.06, 0.02]}
          pos={[0, SH + backH * 0.45, backZ]}
          mat={palette.front}
        />
        {extras.includes("armrests") &&
          [-1, 1].map((side) => (
            <group key={side}>
              <Panel
                size={[0.05, 0.025, D - 0.08]}
                pos={[side * (W / 2 + 0.02), SH + 0.22, -0.02]}
                mat={palette.front}
              />
              <Panel
                size={[LEG, 0.22, LEG]}
                pos={[side * (W / 2 + 0.02), SH + 0.11, D / 2 - 0.08]}
                mat={palette.carcass}
              />
            </group>
          ))}
      </group>
    );
  }

  if (shape === "stool") {
    return (
      <group>
        {seat}
        <LegSet width={W} depth={D} height={legH} palette={palette} />
        {/* foot stretchers */}
        <Panel size={[W - 0.12, 0.03, 0.03]} pos={[0, SH * 0.35, D / 2 - LEG - 0.01]} mat={palette.carcass} />
        <Panel size={[W - 0.12, 0.03, 0.03]} pos={[0, SH * 0.35, -D / 2 + LEG + 0.01]} mat={palette.carcass} />
      </group>
    );
  }

  // bench
  return (
    <group>
      <RoundedBox
        args={[W, 0.05, D]}
        radius={0.01}
        smoothness={2}
        position={[0, SH - 0.025, 0]}
        castShadow
        receiveShadow
        material={palette.front}
      />
      <LegSet width={W} depth={D} height={SH - 0.05} palette={palette} />
      {/* center stretcher for long benches */}
      {W > 1.2 && (
        <Panel size={[W - 0.2, 0.04, 0.04]} pos={[0, SH * 0.4, 0]} mat={palette.carcass} />
      )}
    </group>
  );
}
