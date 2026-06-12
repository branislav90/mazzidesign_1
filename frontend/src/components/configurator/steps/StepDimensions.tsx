"use client";

// Dimensions step: slider + numeric mm input per axis (catalog min/default/max),
// per-field "not sure" toggle (→ null), live derived figures.

import { DIMENSION_LABELS, getItem } from "@/lib/catalog";
import {
  derivedFigures,
  effectiveDimsMm,
  stairsSteps,
} from "@/lib/configurator/derived";
import { useConfigurator } from "@/lib/configurator/store";
import { CONFIGURATOR_DICT, type Locale } from "@/lib/configurator/i18n";

export function StepDimensions({ locale }: { locale: Locale }) {
  const dict = CONFIGURATOR_DICT[locale];
  const categoryId = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const shape = useConfigurator((s) => s.shape);
  const dimensionsMm = useConfigurator((s) => s.dimensionsMm);
  const setDimension = useConfigurator((s) => s.setDimension);
  const item = getItem(categoryId, itemType);

  if (!item) return null;

  const derived = derivedFigures(item, shape, dimensionsMm);
  const effective = effectiveDimsMm(item, dimensionsMm);
  const stairs =
    item.generator === "stairs" ? stairsSteps(effective.totalRise ?? 2700) : null;

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  return (
    <div className="grid gap-7">
      {Object.entries(item.dimensionsMm).map(([key, spec]) => {
        const value = dimensionsMm[key];
        const isNull = value === null || value === undefined;
        const shown = isNull ? spec.default : value;
        const sliderId = `dim-${key}`;
        const numberId = `dim-${key}-num`;
        const notSureId = `dim-${key}-notsure`;
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={sliderId} className="caps">
                {DIMENSION_LABELS[key]?.[locale] ?? key}
              </label>
              <span className="font-serif text-lg tabular-nums">
                {isNull ? dict.review.notSureValue : `${shown} ${dict.dimensions.mm}`}
              </span>
            </div>
            <input
              id={sliderId}
              type="range"
              min={spec.min}
              max={spec.max}
              step={10}
              value={shown}
              disabled={isNull}
              onChange={(e) => setDimension(key, Number(e.target.value))}
              className="mt-3 w-full accent-[#221C16] disabled:opacity-30"
              aria-label={`${DIMENSION_LABELS[key]?.[locale] ?? key} (${dict.dimensions.mm})`}
            />
            <div className="mt-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <input
                  id={numberId}
                  type="number"
                  inputMode="numeric"
                  min={spec.min}
                  max={spec.max}
                  step={10}
                  value={isNull ? "" : shown}
                  placeholder={String(spec.default)}
                  disabled={isNull}
                  onChange={(e) => {
                    if (e.target.value === "") return;
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) setDimension(key, n);
                  }}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && e.target.value !== "") {
                      setDimension(key, clamp(Math.round(n), spec.min, spec.max));
                    }
                  }}
                  className="w-28 rounded-full border border-line bg-transparent px-4 py-1.5 text-sm tabular-nums outline-none transition-colors focus:border-ink disabled:opacity-30"
                  aria-label={`${DIMENSION_LABELS[key]?.[locale] ?? key} (${dict.dimensions.mm})`}
                />
                <span className="text-xs text-soft">{dict.dimensions.mm}</span>
              </div>
              <label
                htmlFor={notSureId}
                className="flex cursor-pointer select-none items-center gap-2 text-[12px] text-soft"
              >
                <input
                  id={notSureId}
                  type="checkbox"
                  checked={isNull}
                  onChange={(e) =>
                    setDimension(key, e.target.checked ? null : spec.default)
                  }
                  className="h-4 w-4 accent-[#221C16]"
                />
                {dict.notSure}
              </label>
            </div>
          </div>
        );
      })}

      {/* derived figures — quiet caps text */}
      {(derived.linearMeters !== undefined ||
        derived.frontAreaM2 !== undefined ||
        derived.boardVolumeM3 !== undefined ||
        stairs) && (
        <div className="border-t border-line pt-5">
          <p className="caps">{dict.dimensions.derivedTitle}</p>
          <dl className="mt-3 grid gap-1.5 text-[13px] text-soft">
            {derived.linearMeters !== undefined && (
              <div className="flex justify-between">
                <dt>{dict.dimensions.linearMeters}</dt>
                <dd className="tabular-nums text-ink">{derived.linearMeters}</dd>
              </div>
            )}
            {derived.frontAreaM2 !== undefined && (
              <div className="flex justify-between">
                <dt>{dict.dimensions.frontAreaM2}</dt>
                <dd className="tabular-nums text-ink">{derived.frontAreaM2}</dd>
              </div>
            )}
            {derived.boardVolumeM3 !== undefined && (
              <div className="flex justify-between">
                <dt>{dict.dimensions.boardVolumeM3}</dt>
                <dd className="tabular-nums text-ink">{derived.boardVolumeM3}</dd>
              </div>
            )}
            {stairs && (
              <>
                <div className="flex justify-between">
                  <dt>{dict.dimensions.stepsCount}</dt>
                  <dd className="tabular-nums text-ink">{stairs.count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{dict.dimensions.riser}</dt>
                  <dd className="tabular-nums text-ink">{stairs.riserMm}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
