"use client";

import { getItem } from "@/lib/catalog";
import { useConfigurator } from "@/lib/configurator/store";
import type { Locale } from "@/lib/configurator/i18n";
import { OptionCard } from "./OptionCard";

export function StepShape({ locale }: { locale: Locale }) {
  const categoryId = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const shape = useConfigurator((s) => s.shape);
  const setShape = useConfigurator((s) => s.setShape);
  const item = getItem(categoryId, itemType);

  if (!item || item.shapes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {item.shapes.map((s) => (
        <OptionCard
          key={s.id}
          title={s.name[locale]}
          selected={shape === s.id}
          onSelect={() => setShape(s.id)}
        />
      ))}
    </div>
  );
}
