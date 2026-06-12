/* eslint-disable react/no-unknown-property */
// Trim-work preview (per-linear-metre mode): an extruded moulding profile
// running along a 2.5 m wall segment — baseboard at the floor, crown at the
// ceiling line. profileHeight scales the profile; runningLength only feeds
// the derived figures.

import { useMemo } from "react";
import * as THREE from "three";
import { Panel, type GeneratorProps } from "./common";

const WALL_W = 2.5;
const WALL_H = 2.4;

function makeProfile(height: number, mirrored: boolean): THREE.Shape {
  const p = height;
  const s = mirrored ? -1 : 1;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.022, 0);
  shape.lineTo(0.022, s * p * 0.55);
  shape.quadraticCurveTo(0.022, s * p * 0.75, 0.012, s * p * 0.8);
  shape.lineTo(0.012, s * p * 0.9);
  shape.quadraticCurveTo(0.012, s * p, 0, s * p);
  shape.lineTo(0, 0);
  return shape;
}

function Moulding({
  profileHeight,
  mirrored,
  y,
  mat,
}: {
  profileHeight: number;
  mirrored: boolean;
  y: number;
  mat: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const shape = makeProfile(profileHeight, mirrored);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: WALL_W,
      bevelEnabled: false,
    });
    return geo;
  }, [profileHeight, mirrored]);

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      material={mat}
      position={[WALL_W / 2, y, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}

export function TrimModel({ dims, extras, palette }: GeneratorProps) {
  const profileHeight = Math.max(0.04, dims.profileHeight ?? 0.12);

  return (
    <group>
      {/* wall segment backdrop */}
      <Panel size={[WALL_W, WALL_H, 0.08]} pos={[0, WALL_H / 2, -0.04]} mat={palette.wall} />
      {/* floor hint */}
      <Panel size={[WALL_W, 0.012, 0.9]} pos={[0, 0.006, 0.45]} mat={palette.light} />

      {/* baseboard along the floor */}
      <Moulding profileHeight={profileHeight} mirrored={false} y={0.012} mat={palette.front} />
      {/* crown along the ceiling line */}
      <Moulding profileHeight={profileHeight} mirrored y={WALL_H} mat={palette.front} />

      {/* wainscot panels */}
      {extras.includes("wainscot-panels") && (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Panel
              key={i}
              size={[0.06, 0.78, 0.016]}
              pos={[-WALL_W / 2 + 0.25 + i * 0.5, 0.012 + profileHeight + 0.39, 0.012]}
              mat={palette.front}
            />
          ))}
          <Panel
            size={[WALL_W, 0.06, 0.02]}
            pos={[0, 0.012 + profileHeight + 0.81, 0.014]}
            mat={palette.front}
          />
        </>
      )}
    </group>
  );
}
