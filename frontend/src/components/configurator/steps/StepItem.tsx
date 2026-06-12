"use client";

import { getCategory } from "@/lib/catalog";
import { useConfigurator } from "@/lib/configurator/store";
import type { Locale } from "@/lib/configurator/i18n";
import { OptionCard } from "./OptionCard";

export function StepItem({
  locale,
  onAdvance,
}: {
  locale: Locale;
  onAdvance: () => void;
}) {
  const categoryId = useConfigurator((s) => s.category);
  const itemType = useConfigurator((s) => s.itemType);
  const setItemType = useConfigurator((s) => s.setItemType);
  const category = getCategory(categoryId);

  if (!category) return null;

  return (
    <div className="grid gap-3">
      {category.items.map((item) => (
        <OptionCard
          key={item.id}
          title={item.name[locale]}
          description={item.description[locale]}
          selected={itemType === item.id}
          onSelect={() => {
            setItemType(item.id);
            onAdvance();
          }}
        />
      ))}
    </div>
  );
}
