/* eslint-disable react/no-unknown-property */
// Dispatches the active item to its parametric generator. Geometry inputs are
// bucketed to 10 mm so slider drags don't rebuild meshes every pixel.

import { useEffect, useMemo } from "react";
import { getItem, type ItemDef } from "@/lib/catalog";
import { bucket10, effectiveDimsMm } from "@/lib/configurator/derived";
import { useConfigurator } from "@/lib/configurator/store";
import { CONFIGURATOR_DICT } from "@/lib/configurator/i18n";
import { createPalette } from "./materials";
import { modelExtents, type Extents } from "./extents";
import type { GeneratorProps } from "./common";
import { KitchenModel } from "./KitchenModel";
import { WardrobeModel } from "./WardrobeModel";
import { TableModel } from "./TableModel";
import { BedModel } from "./BedModel";
import { StairsModel } from "./StairsModel";
import { PergolaModel } from "./PergolaModel";
import { BoxModel } from "./BoxModel";
import { TrimModel } from "./TrimModel";
import { SeatModel } from "./SeatModel";
import { HumanSilhouette } from "./HumanSilhouette";
import { DimensionLabels } from "./DimensionLabels";

const GENERATORS: Record<string, (props: GeneratorProps) => JSX.Element> = {
  kitchen: KitchenModel,
  wardrobe: WardrobeModel,
  table: TableModel,
  bed: BedModel,
  stairs: StairsModel,
  pergola: PergolaModel,
  box: BoxModel,
  trim: TrimModel,
  seat: SeatModel,
};

/** Computes bucketed metre dims for the current config. */
export function useModelDims(item: ItemDef | null): {
  dimsM: Record<string, number>;
  extents: Extents;
} {
  const dimensionsMm = useConfigurator((s) => s.dimensionsMm);
  const shape = useConfigurator((s) => s.shape);

  // Bucket to 10 mm; the JSON key keeps the memo stable while dragging sliders.
  const bucketKey = useMemo(() => {
    if (!item) return "none";
    return JSON.stringify(bucket10(effectiveDimsMm(item, dimensionsMm))) + (shape ?? "");
  }, [item, dimensionsMm, shape]);

  return useMemo(() => {
    if (!item) {
      return { dimsM: {}, extents: { x: 1, y: 1, z: 1, radius: 0.9 } };
    }
    const bucketed = bucket10(effectiveDimsMm(item, dimensionsMm));
    const dimsM: Record<string, number> = {};
    for (const [k, v] of Object.entries(bucketed)) dimsM[k] = v / 1000;
    return { dimsM, extents: modelExtents(item, shape, dimsM) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketKey]);
}

export function ConfigModel() {
  const category = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const shape = useConfigurator((s) => s.shape);
  const dimensionsMm = useConfigurator((s) => s.dimensionsMm);
  const species = useConfigurator((s) => s.material.species);
  const finish = useConfigurator((s) => s.material.finish);
  const extras = useConfigurator((s) => s.extras);
  const showSilhouette = useConfigurator((s) => s.showSilhouette);
  const step = useConfigurator((s) => s.step);
  const locale = useConfigurator((s) => s.locale);

  const item = getItem(category, itemType);
  const { dimsM, extents } = useModelDims(item);

  const palette = useMemo(() => createPalette(species, finish), [species, finish]);
  useEffect(() => () => palette.dispose(), [palette]);

  if (!item) return null;
  const Generator = GENERATORS[item.generator];
  if (!Generator) return null;

  return (
    <group>
      <Generator dims={dimsM} shape={shape} extras={extras} palette={palette} />
      {showSilhouette && (
        <HumanSilhouette position={[extents.x / 2 + 0.55, 0, 0]} />
      )}
      {step === "dimensions" && (
        <DimensionLabels
          item={item}
          dimensionsMm={dimensionsMm}
          extents={extents}
          locale={locale}
          notSureText={CONFIGURATOR_DICT[locale].review.notSureValue}
        />
      )}
    </group>
  );
}
