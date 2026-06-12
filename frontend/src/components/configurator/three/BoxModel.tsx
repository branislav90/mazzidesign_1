/* eslint-disable react/no-unknown-property */
// Simple box preview for serveware, utility boxes, fixtures, planters and
// kitchen storage inserts: length × width × thickness/height rounded slab.

import { RoundedBox } from "@react-three/drei";
import type { GeneratorProps } from "./common";

export function BoxModel({ dims, palette }: GeneratorProps) {
  // Items use either length/width/(thickness|height) or width/depth/height.
  const x = dims.length ?? dims.width ?? 0.5;
  const z = dims.length !== undefined ? (dims.width ?? 0.4) : (dims.depth ?? 0.4);
  const y = dims.thickness ?? dims.height ?? 0.3;

  const radius = Math.min(0.012, y / 4, x / 4, z / 4);

  return (
    <group>
      <RoundedBox
        args={[x, y, z]}
        radius={Math.max(0.002, radius)}
        smoothness={3}
        position={[0, y / 2, 0]}
        castShadow
        receiveShadow
        material={palette.front}
      />
      {/* subtle top slab accent for thicker pieces */}
      {y > 0.25 && (
        <RoundedBox
          args={[x + 0.02, 0.02, z + 0.02]}
          radius={0.004}
          smoothness={2}
          position={[0, y + 0.01, 0]}
          castShadow
          material={palette.top}
        />
      )}
    </group>
  );
}
