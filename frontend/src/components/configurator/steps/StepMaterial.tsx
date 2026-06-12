"use client";

// Material & finish step: species swatches re-tint the 3D model, finish sets
// roughness, per-item extras as checkboxes. Both choices can stay "not sure".

import {
  FINISH_LABELS,
  FINISH_LIST,
  SPECIES_LABELS,
  SPECIES_LIST,
  getItem,
} from "@/lib/catalog";
import { SPECIES_COLORS } from "@/components/configurator/three/materials";
import { useConfigurator } from "@/lib/configurator/store";
import { CONFIGURATOR_DICT, type Locale } from "@/lib/configurator/i18n";

export function StepMaterial({ locale }: { locale: Locale }) {
  const dict = CONFIGURATOR_DICT[locale];
  const categoryId = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const species = useConfigurator((s) => s.material.species);
  const finish = useConfigurator((s) => s.material.finish);
  const extras = useConfigurator((s) => s.extras);
  const setSpecies = useConfigurator((s) => s.setSpecies);
  const setFinish = useConfigurator((s) => s.setFinish);
  const toggleExtra = useConfigurator((s) => s.toggleExtra);
  const item = getItem(categoryId, itemType);

  return (
    <div className="grid gap-8">
      {/* species swatches */}
      <fieldset>
        <legend className="caps">{dict.material.speciesTitle}</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {SPECIES_LIST.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecies(s)}
              aria-pressed={species === s}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-500 ease-hrast ${
                species === s ? "border-ink" : "border-line hover:border-ink/40"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-9 w-9 shrink-0 rounded-full border border-line"
                style={{ background: SPECIES_COLORS[s] }}
              />
              <span className="text-[13.5px]">{SPECIES_LABELS[s][locale]}</span>
            </button>
          ))}
        </div>
        <label className="mt-3 flex cursor-pointer select-none items-center gap-2 text-[12px] text-soft">
          <input
            type="checkbox"
            checked={species === null}
            onChange={(e) => setSpecies(e.target.checked ? null : "oak")}
            className="h-4 w-4 accent-[#221C16]"
          />
          {dict.material.speciesNotSure}
        </label>
      </fieldset>

      {/* finish */}
      <fieldset>
        <legend className="caps">{dict.material.finishTitle}</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {FINISH_LIST.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFinish(f)}
              aria-pressed={finish === f}
              className={`rounded-full border px-5 py-2 text-[11.5px] font-semibold uppercase tracking-btn transition-colors duration-500 ease-hrast ${
                finish === f
                  ? "border-ink bg-ink text-white"
                  : "border-line text-soft hover:border-ink/40 hover:text-ink"
              }`}
            >
              {FINISH_LABELS[f][locale]}
            </button>
          ))}
        </div>
        <label className="mt-3 flex cursor-pointer select-none items-center gap-2 text-[12px] text-soft">
          <input
            type="checkbox"
            checked={finish === null}
            onChange={(e) => setFinish(e.target.checked ? null : "oiled")}
            className="h-4 w-4 accent-[#221C16]"
          />
          {dict.material.finishNotSure}
        </label>
      </fieldset>

      {/* extras */}
      {item && item.extras.length > 0 && (
        <fieldset>
          <legend className="caps">{dict.material.extrasTitle}</legend>
          <div className="mt-4 grid gap-2.5">
            {item.extras.map((extra) => (
              <label
                key={extra.id}
                className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-line p-3.5 text-[13.5px] transition-colors hover:border-ink/40"
              >
                <input
                  type="checkbox"
                  checked={extras.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                  className="h-4 w-4 accent-[#221C16]"
                />
                {extra.name[locale]}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
