/* eslint-disable react/no-unknown-property */
// Flat extruded 1.8 m human silhouette for size reference, ink-tinted.

import { useMemo } from "react";
import * as THREE from "three";

const BODY_POINTS: [number, number][] = [
  [-0.16, 0], // left foot outer
  [-0.1, 0.92], // left hip
  [-0.22, 1.18], // left hand (arm merged)
  [-0.2, 1.44], // left shoulder
  [-0.05, 1.52], // neck left
  [0.05, 1.52], // neck right
  [0.2, 1.44], // right shoulder
  [0.22, 1.18], // right hand
  [0.1, 0.92], // right hip
  [0.16, 0], // right foot outer
  [0.06, 0], // right foot inner
  [0.02, 0.5], // crotch right
  [-0.02, 0.5], // crotch left
  [-0.06, 0], // left foot inner
];

export function HumanSilhouette({ position }: { position: [number, number, number] }) {
  const { bodyGeo, material } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(BODY_POINTS[0][0], BODY_POINTS[0][1]);
    for (let i = 1; i < BODY_POINTS.length; i++) {
      shape.lineTo(BODY_POINTS[i][0], BODY_POINTS[i][1]);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false });
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#221C16"),
      roughness: 0.9,
      metalness: 0,
    });
    return { bodyGeo: geo, material: mat };
  }, []);

  return (
    <group position={position}>
      <mesh castShadow geometry={bodyGeo} material={material} position={[0, 0, -0.015]} />
      {/* head — flat disc, total height 1.8 m */}
      <mesh castShadow material={material} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.685, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.03, 24]} />
      </mesh>
    </group>
  );
}
