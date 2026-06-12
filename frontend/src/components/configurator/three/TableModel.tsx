/* eslint-disable react/no-unknown-property */
// Parametric table: rectangular / round / oval top with legs or trestle base.

import { RoundedBox } from "@react-three/drei";
import type { Palette } from "./materials";
import { Panel, type GeneratorProps } from "./common";

const TOP_T = 0.04;

function Legs({
  length,
  width,
  height,
  palette,
}: {
  length: number;
  width: number;
  height: number;
  palette: Palette;
}) {
  const inset = 0.14;
  const lx = length / 2 - inset;
  const lz = width / 2 - inset;
  const legH = height - TOP_T;
  return (
    <>
      {[
        [lx, lz],
        [lx, -lz],
        [-lx, lz],
        [-lx, -lz],
      ].map(([x, z], i) => (
        <Panel
          key={i}
          size={[0.07, legH, 0.07]}
          pos={[x, legH / 2, z]}
          mat={palette.carcass}
        />
      ))}
    </>
  );
}

function Trestle({
  length,
  width,
  height,
  palette,
}: {
  length: number;
  width: number;
  height: number;
  palette: Palette;
}) {
  const legH = height - TOP_T;
  const x = length / 2 - 0.3;
  return (
    <>
      <Panel size={[0.08, legH, width - 0.25]} pos={[x, legH / 2, 0]} mat={palette.carcass} />
      <Panel size={[0.08, legH, width - 0.25]} pos={[-x, legH / 2, 0]} mat={palette.carcass} />
      <Panel
        size={[length - 0.7, 0.1, 0.08]}
        pos={[0, 0.18, 0]}
        mat={palette.carcass}
      />
    </>
  );
}

export function TableModel({ dims, shape, extras, palette }: GeneratorProps) {
  const L = dims.length ?? 2;
  const W = dims.width ?? 0.95;
  const H = dims.height ?? 0.74;
  const trestle = extras.includes("trestle-base");

  if (shape === "round") {
    const r = L / 2;
    const legH = H - TOP_T;
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, H - TOP_T / 2, 0]} material={palette.front}>
          <cylinderGeometry args={[r, r, TOP_T, 48]} />
        </mesh>
        {/* pedestal + foot */}
        <mesh castShadow position={[0, legH / 2, 0]} material={palette.carcass}>
          <cylinderGeometry args={[0.07, 0.09, legH, 24]} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.025, 0]} material={palette.carcass}>
          <cylinderGeometry args={[Math.max(0.25, r * 0.45), Math.max(0.28, r * 0.5), 0.05, 32]} />
        </mesh>
      </group>
    );
  }

  if (shape === "oval") {
    return (
      <group>
        <mesh
          castShadow
          receiveShadow
          position={[0, H - TOP_T / 2, 0]}
          scale={[1, 1, W / L]}
          material={palette.front}
        >
          <cylinderGeometry args={[L / 2, L / 2, TOP_T, 56]} />
        </mesh>
        {trestle ? (
          <Trestle length={L * 0.8} width={W} height={H} palette={palette} />
        ) : (
          <Legs length={L * 0.78} width={W * 0.78} height={H} palette={palette} />
        )}
      </group>
    );
  }

  // rectangular
  return (
    <group>
      <RoundedBox
        args={[L, TOP_T, W]}
        radius={0.012}
        smoothness={3}
        position={[0, H - TOP_T / 2, 0]}
        castShadow
        receiveShadow
        material={palette.front}
      />
      {trestle ? (
        <Trestle length={L} width={W} height={H} palette={palette} />
      ) : (
        <Legs length={L} width={W} height={H} palette={palette} />
      )}
    </group>
  );
}
