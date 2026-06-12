/* eslint-disable react/no-unknown-property */
// Parametric pergola / garden structure: posts + beam grid from the footprint;
// freestanding or wall-mounted, optional slatted roof, lattice and bench.

import { Panel, type GeneratorProps } from "./common";

const POST = 0.12;

export function PergolaModel({ dims, shape, extras, palette }: GeneratorProps) {
  const W = dims.width ?? 3.5;
  const D = dims.depth ?? 3;
  const H = dims.height ?? 2.4;
  const wallMounted = shape === "wall-mounted";

  const px = W / 2 - POST / 2;
  const pz = D / 2 - POST / 2;
  const rafterCount = Math.max(3, Math.floor(W / 0.45) + 1);
  const slatCount = Math.max(4, Math.floor(D / 0.18));

  const posts: [number, number][] = wallMounted
    ? [
        [-px, pz],
        [px, pz],
      ]
    : [
        [-px, -pz],
        [px, -pz],
        [-px, pz],
        [px, pz],
      ];

  return (
    <group>
      {/* posts */}
      {posts.map(([x, z], i) => (
        <Panel key={i} size={[POST, H, POST]} pos={[x, H / 2, z]} mat={palette.front} />
      ))}

      {/* wall ledger when mounted against a wall */}
      {wallMounted && (
        <Panel
          size={[W, 0.18, 0.06]}
          pos={[0, H - 0.09, -D / 2 + 0.03]}
          mat={palette.carcass}
        />
      )}

      {/* main beams along x (front + back) */}
      <Panel size={[W + 0.3, 0.18, 0.08]} pos={[0, H - 0.09, pz]} mat={palette.carcass} />
      {!wallMounted && (
        <Panel size={[W + 0.3, 0.18, 0.08]} pos={[0, H - 0.09, -pz]} mat={palette.carcass} />
      )}

      {/* rafters spanning the depth */}
      {Array.from({ length: rafterCount }, (_, i) => {
        const x = -W / 2 + (W / (rafterCount - 1)) * i;
        return (
          <Panel
            key={`r${i}`}
            size={[0.06, 0.12, D + 0.35]}
            pos={[x, H + 0.06, 0]}
            mat={palette.front}
          />
        );
      })}

      {/* optional slatted roof above the rafters */}
      {extras.includes("slatted-roof") &&
        Array.from({ length: slatCount }, (_, i) => {
          const z = -D / 2 + (D / (slatCount - 1)) * i;
          return (
            <Panel
              key={`s${i}`}
              size={[W + 0.2, 0.03, 0.05]}
              pos={[0, H + 0.14, z]}
              mat={palette.top}
            />
          );
        })}

      {/* optional side lattice on the left bay */}
      {extras.includes("side-lattice") &&
        Array.from({ length: Math.max(3, Math.floor(H / 0.3)) }, (_, i) => (
          <Panel
            key={`l${i}`}
            size={[0.03, 0.04, D - POST * 2]}
            pos={[-px, 0.4 + i * 0.3, 0]}
            mat={palette.top}
          />
        ))}

      {/* optional integrated bench along the right side */}
      {extras.includes("integrated-bench") && (
        <group position={[px - 0.25, 0, 0]}>
          <Panel size={[0.45, 0.05, D - 0.6]} pos={[0, 0.45, 0]} mat={palette.top} />
          <Panel size={[0.4, 0.45, 0.06]} pos={[0, 0.225, -(D - 0.6) / 2 + 0.1]} mat={palette.carcass} />
          <Panel size={[0.4, 0.45, 0.06]} pos={[0, 0.225, (D - 0.6) / 2 - 0.1]} mat={palette.carcass} />
        </group>
      )}
    </group>
  );
}
