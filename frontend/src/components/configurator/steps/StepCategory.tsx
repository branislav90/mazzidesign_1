"use client";

import { catalog } from "@/lib/catalog";
import { useConfigurator } from "@/lib/configurator/store";
import type { Locale } from "@/lib/configurator/i18n";
import { OptionCard } from "./OptionCard";

export function StepCategory({
  locale,
  onAdvance,
}: {
  locale: Locale;
  onAdvance: () => void;
}) {
  const category = useConfigurator((s) => s.category);
  const setCategory = useConfigurator((s) => s.setCategory);

  return (
    <div className="grid gap-3">
      {catalog.map((c) => (
        <OptionCard
          key={c.id}
          title={c.name[locale]}
          description={c.description[locale]}
          selected={category === c.id}
          onSelect={() => {
            setCategory(c.id);
            onAdvance();
          }}
        />
      ))}
    </div>
  );
}
