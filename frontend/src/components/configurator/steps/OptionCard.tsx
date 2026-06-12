"use client";

// Quiet-luxury selectable card used by the category / item / shape steps.

export function OptionCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group w-full rounded-2xl border p-5 text-left transition-colors duration-500 ease-hrast ${
        selected
          ? "border-ink bg-ink text-white"
          : "border-line bg-transparent hover:border-ink/40"
      }`}
    >
      <span className="block font-serif text-lg leading-snug">{title}</span>
      {description && (
        <span
          className={`mt-1.5 block text-[13px] leading-relaxed ${
            selected ? "text-white/70" : "text-soft"
          }`}
        >
          {description}
        </span>
      )}
    </button>
  );
}
