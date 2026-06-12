"use client";

// Page content: one collapsible typed form per section key, SL/EN tabs,
// saved via PUT /content/{key} as { jsonSl, jsonEn } JSON strings.

import { useMemo, useState } from "react";
import {
  ContentItem,
  formatDate,
  useAdminContent,
  useSaveContent,
} from "@/lib/api/admin";
import {
  buttonPrimary,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  PageTitle,
} from "../_components/ui";
import { SECTION_DEFS, SECTION_ORDER, SectionDef } from "./_components/sections";

/** Deep-merges parsed JSON over the section defaults so missing keys are safe. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeDefaults(defaults: any, parsed: any): any {
  if (parsed === undefined || parsed === null) return defaults;
  if (Array.isArray(defaults) || Array.isArray(parsed)) return parsed;
  if (typeof defaults === "object" && typeof parsed === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = { ...parsed };
    for (const key of Object.keys(defaults)) {
      out[key] = mergeDefaults(defaults[key], parsed[key]);
    }
    return out;
  }
  return parsed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLocale(json: string, defaults: any): any {
  try {
    return mergeDefaults(defaults, JSON.parse(json));
  } catch {
    return defaults;
  }
}

function SectionEditor({
  item,
  def,
}: {
  item: ContentItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  def: SectionDef<any>;
}) {
  const save = useSaveContent();
  const [locale, setLocale] = useState<"sl" | "en">("sl");
  const [draft, setDraft] = useState(() => ({
    sl: parseLocale(item.jsonSl, def.defaults),
    en: parseLocale(item.jsonEn, def.defaults),
  }));
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(false);
    const slPayload = def.serialize(draft.sl);
    const enPayload = def.serialize(draft.en);

    const problems: string[] = [];
    for (const [label, payload] of [
      ["SL", slPayload],
      ["EN", enPayload],
    ] as const) {
      const result = def.schema.safeParse(payload);
      if (!result.success) {
        for (const issue of result.error.issues.slice(0, 5)) {
          problems.push(
            `${label}${issue.path.length ? ` · ${issue.path.join(".")}` : ""}: ${issue.message}`,
          );
        }
      }
    }
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }
    setErrors([]);

    try {
      await save.mutateAsync({
        key: item.key,
        jsonSl: JSON.stringify(slPayload),
        jsonEn: JSON.stringify(enPayload),
      });
      setSaved(true);
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Shranjevanje ni uspelo.",
      ]);
    }
  }

  const value = draft[locale];

  return (
    <div className="space-y-4 border-t border-neutral-200 p-4">
      <div
        role="tablist"
        aria-label="Jezik vsebine"
        className="inline-flex rounded border border-neutral-300"
      >
        {(["sl", "en"] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            role="tab"
            aria-selected={locale === loc}
            onClick={() => setLocale(loc)}
            className={`px-4 py-1.5 text-sm font-medium first:rounded-l last:rounded-r ${
              locale === loc
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {loc === "sl" ? "Slovenščina" : "English"}
          </button>
        ))}
      </div>

      <def.Form
        value={value}
        onChange={(next) => {
          setDraft((d) => {
            const other = locale === "sl" ? "en" : "sl";
            return {
              ...d,
              [locale]: next,
              // images are locale-independent — keep both drafts in sync
              [other]: def.mirrorShared ? def.mirrorShared(next, d[other]) : d[other],
            };
          });
          setSaved(false);
        }}
      />

      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          <ul className="list-inside list-disc">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={save.isPending}
          className={buttonPrimary}
        >
          {save.isPending ? "Shranjevanje …" : "Shrani razdelek"}
        </button>
        {saved && (
          <span role="status" className="text-sm text-green-700">
            Shranjeno. Javna stran se posodobi samodejno.
          </span>
        )}
        <span className="ml-auto text-xs text-neutral-400">
          Nazadnje posodobljeno: {formatDate(item.updatedAt)}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ item }: { item: ContentItem }) {
  const [open, setOpen] = useState(false);
  const def = SECTION_DEFS[item.key];

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-neutral-900">
          {def?.title ?? item.key}
          <span className="ml-2 font-mono text-xs font-normal text-neutral-400">
            {item.key}
          </span>
        </span>
        <span aria-hidden className="text-neutral-400">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open &&
        (def ? (
          <SectionEditor item={item} def={def} />
        ) : (
          <p className="border-t border-neutral-200 p-4 text-sm text-neutral-500">
            Za ta razdelek ni na voljo obrazca.
          </p>
        ))}
    </Card>
  );
}

export default function AdminContentPage() {
  const content = useAdminContent();

  const ordered = useMemo(() => {
    const items = content.data ?? [];
    return [...items].sort((a, b) => {
      const ai = SECTION_ORDER.indexOf(a.key);
      const bi = SECTION_ORDER.indexOf(b.key);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [content.data]);

  return (
    <div>
      <PageTitle
        title="Vsebina strani"
        actions={
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            Predogled na strani →
          </a>
        }
      />

      {content.isPending && <Loading />}
      {content.isError && (
        <ErrorBox
          message={content.error.message}
          onRetry={() => content.refetch()}
        />
      )}

      {content.isSuccess &&
        (ordered.length === 0 ? (
          <Card>
            <EmptyState message="Ni vsebinskih razdelkov." />
          </Card>
        ) : (
          <div className="space-y-3">
            {ordered.map((item) => (
              <SectionCard key={item.key} item={item} />
            ))}
          </div>
        ))}
    </div>
  );
}
