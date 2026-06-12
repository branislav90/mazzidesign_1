/* eslint-disable react/no-unknown-property */
// Parametric staircase: step count from total rise (170–185 mm risers),
// stringers, optional handrail cylinders; straight / quarter-turn / half-turn
// flights with landings.

import { stairsSteps } from "@/lib/configurator/derived";
import type { Palette } from "./materials";
import { Panel, type GeneratorProps } from "./common";

const TREAD = 0.27;

interface FlightProps {
  count: number;
  riser: number;
  width: number;
  palette: Palette;
  closedRisers: boolean;
  handrail: boolean;
}

/** Origin: centered on x, first tread at z=0, ascending toward +z. */
function Flight({ count, riser, width, palette, closedRisers, handrail }: FlightProps) {
  const run = count * TREAD;
  const rise = count * riser;
  const angle = Math.atan2(rise, run);
  const slopeLen = Math.sqrt(run * run + rise * rise);

  return (
    <group>
      {/* treads */}
      {Array.from({ length: count }, (_, i) => (
        <Panel
          key={`t${i}`}
          size={[width, 0.045, TREAD + 0.02]}
          pos={[0, (i + 1) * riser - 0.0225, i * TREAD + TREAD / 2]}
          mat={palette.top}
        />
      ))}
      {/* closed riser faces */}
      {closedRisers &&
        Array.from({ length: count }, (_, i) => (
          <Panel
            key={`r${i}`}
            size={[width - 0.02, riser, 0.02]}
            pos={[0, i * riser + riser / 2, i * TREAD + 0.01]}
            mat={palette.front}
          />
        ))}
      {/* stringers */}
      {[-1, 1].map((side) => (
        <Panel
          key={`s${side}`}
          size={[0.05, 0.3, slopeLen]}
          pos={[side * (width / 2 - 0.025), rise / 2 - 0.08, run / 2]}
          rot={[-angle, 0, 0]}
          mat={palette.carcass}
        />
      ))}
      {/* handrail: posts + sloped rail cylinder */}
      {handrail && (
        <>
          {Array.from({ length: Math.max(2, Math.ceil(count / 3)) }, (_, i) => {
            const step = Math.min(count - 1, i * 3);
            return (
              <mesh
                key={`p${i}`}
                castShadow
                position={[width / 2 - 0.04, (step + 1) * riser + 0.45, step * TREAD + TREAD / 2]}
                material={palette.carcass}
              >
                <cylinderGeometry args={[0.016, 0.016, 0.9, 12]} />
              </mesh>
            );
          })}
          <mesh
            castShadow
            position={[width / 2 - 0.04, rise / 2 + 0.92, run / 2]}
            rotation={[Math.PI / 2 - angle, 0, 0]}
            material={palette.front}
          >
            <cylinderGeometry args={[0.022, 0.022, slopeLen + 0.2, 14]} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function StairsModel({ dims, shape, extras, palette }: GeneratorProps) {
  const rise = dims.totalRise ?? 2.7;
  const W = dims.width ?? 1;
  const { count, riserMm } = stairsSteps(rise * 1000);
  const riser = riserMm / 1000;
  const closed = extras.includes("closed-risers");
  const rail = extras.includes("handrail");

  if (shape === "quarter-turn" || shape === "half-turn") {
    const n1 = Math.ceil(count / 2);
    const n2 = count - n1;
    const landingZ = n1 * TREAD + W / 2;
    const half = shape === "half-turn";

    const spanZ = n1 * TREAD + W;
    const offX = half ? -(W + 0.08) / 2 : -(n2 * TREAD) / 2;

    return (
      <group position={[offX, 0, -spanZ / 2]}>
        <Flight
          count={n1}
          riser={riser}
          width={W}
          palette={palette}
          closedRisers={closed}
          handrail={rail}
        />
        {/* landing */}
        <Panel
          size={[half ? W * 2 + 0.08 : W, 0.06, W]}
          pos={[half ? (W + 0.08) / 2 : 0, n1 * riser - 0.03, landingZ]}
          mat={palette.top}
        />
        {n2 > 0 && (
          <group
            position={half ? [W + 0.08, n1 * riser, n1 * TREAD] : [W / 2, n1 * riser, landingZ]}
            rotation={[0, half ? Math.PI : Math.PI / 2, 0]}
          >
            <Flight
              count={n2}
              riser={riser}
              width={W}
              palette={palette}
              closedRisers={closed}
              handrail={rail}
            />
          </group>
        )}
      </group>
    );
  }

  // straight
  return (
    <group position={[0, 0, -(count * TREAD) / 2]}>
      <Flight
        count={count}
        riser={riser}
        width={W}
        palette={palette}
        closedRisers={closed}
        handrail={rail}
      />
    </group>
  );
}
