"use client";

// Small bound-field primitives used by the typed section forms.

import { ReactNode, useId } from "react";
import { inputClass, Labelled } from "../../_components/ui";

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <Labelled label={label} htmlFor={id}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </Labelled>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const id = useId();
  return (
    <Labelled label={label} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </Labelled>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <Labelled label={label} htmlFor={id}>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      />
    </Labelled>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <Labelled label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

/** Generic repeater: ordered list with add / remove / move up / move down. */
export function Repeater<T>({
  label,
  items,
  onChange,
  makeNew,
  renderItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  renderItem: (
    item: T,
    update: (next: T) => void,
    index: number,
  ) => ReactNode;
}) {
  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <fieldset className="rounded border border-neutral-200">
      <legend className="ml-2 px-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </legend>
      <div className="space-y-3 p-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-500">Seznam je prazen.</p>
        )}
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                #{index + 1}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Premakni element ${index + 1} navzgor`}
                  className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Premakni element ${index + 1} navzdol`}
                  className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  aria-label={`Odstrani element ${index + 1}`}
                  className="rounded border border-red-300 bg-white px-1.5 py-0.5 text-xs text-red-700"
                >
                  Odstrani
                </button>
              </span>
            </div>
            {renderItem(
              item,
              (next) => onChange(items.map((it, i) => (i === index ? next : it))),
              index,
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, makeNew()])}
          className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          + Dodaj element
        </button>
      </div>
    </fieldset>
  );
}
