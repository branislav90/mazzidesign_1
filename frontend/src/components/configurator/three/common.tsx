/* eslint-disable react/no-unknown-property */
// Shared building blocks for the parametric generators.

import type * as THREE from "three";
import type { Palette } from "./materials";

/** 18 mm gap between fronts (AGENTS.md §7). */
export const GAP = 0.018;

export interface GeneratorProps {
  /** Effective dimensions in metres, bucketed to 10 mm. */
  dims: Record<string, number>;
  shape: string | null;
  extras: string[];
  palette: Palette;
}

export interface PanelProps {
  size: [number, number, number];
  pos: [number, number, number];
  mat: THREE.Material;
  rot?: [number, number, number];
}

/** A shadow-casting box panel. */
export function Panel({ size, pos, mat, rot }: PanelProps) {
  return (
    <mesh castShadow receiveShadow position={pos} rotation={rot} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export interface FrontRowProps {
  /** Total row width (m), centered on x=0. */
  width: number;
  /** Front height (m). */
  height: number;
  /** Center y of the row. */
  y: number;
  /** Front face z position (panel center). */
  z: number;
  mat: THREE.Material;
  /** Target module width (m). */
  segment?: number;
}

/** A row of front panels segmented into ~`segment` wide modules with 18 mm gaps. */
export function FrontRow({ width, height, y, z, mat, segment = 0.6 }: FrontRowProps) {
  const n = Math.max(1, Math.round(width / segment));
  const segW = width / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <mesh
          key={i}
          castShadow
          position={[-width / 2 + segW * (i + 0.5), y, z]}
          material={mat}
        >
          <boxGeometry args={[Math.max(0.05, segW - GAP), Math.max(0.05, height), GAP]} />
        </mesh>
      ))}
    </>
  );
}
