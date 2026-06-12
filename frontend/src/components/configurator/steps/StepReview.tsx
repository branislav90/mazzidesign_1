"use client";

// Review & send: full summary + 3D snapshot, contact form (name/email/phone
// required), timeframe, notes, up to 3 photos ≤5 MB → POST photos → POST
// enquiry → /configure/success?ref=…  Rate-limit and network errors keep the
// state intact and offer a retry.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DIMENSION_LABELS,
  FINISH_LABELS,
  SPECIES_LABELS,
  getCategory,
  getItem,
  getShape,
} from "@/lib/catalog";
import { derivedFigures } from "@/lib/configurator/derived";
import { useConfigurator, type Timeframe } from "@/lib/configurator/store";
import { CONFIGURATOR_DICT, type Locale } from "@/lib/configurator/i18n";
import {
  EnquiryError,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  PHOTO_TYPES,
  submitEnquiry,
  uploadEnquiryPhotos,
  type EnquiryPayload,
} from "@/lib/api/enquiries";
import { captureSnapshot } from "@/components/configurator/three/snapshot";

const TIMEFRAMES: Timeframe[] = ["asap", "1-3m", "3-6m", "exploring"];

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function StepReview({ locale }: { locale: Locale }) {
  const dict = CONFIGURATOR_DICT[locale];
  const r = dict.review;
  const router = useRouter();
  const store = useConfigurator();

  const item = getItem(store.category, store.itemType);
  const category = getCategory(store.category);
  const shapeDef = getShape(item, store.shape);
  const derived = item ? derivedFigures(item, store.shape, store.dimensionsMm) : {};

  const [files, setFiles] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // remember uploaded photo ids per file-set so a retry doesn't re-upload
  const uploadedRef = useRef<{ key: string; ids: string[] } | null>(null);

  // capture the 3D snapshot once when the review step opens
  const setSnapshot = useConfigurator((s) => s.setSnapshot);
  useEffect(() => {
    const dataUrl = captureSnapshot();
    if (dataUrl) setSnapshot(dataUrl);
  }, [setSnapshot]);

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files],
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setPhotoError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) {
        setPhotoError(r.tooManyPhotos);
        break;
      }
      if (!PHOTO_TYPES.includes(file.type)) {
        setPhotoError(r.photoWrongType);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(r.photoTooLarge);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!store.contact.name.trim()) next.name = r.required;
    const email = store.contact.email.trim();
    if (!email) next.email = r.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = r.invalidEmail;
    if (!store.contact.phone.trim()) next.phone = r.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate() || !store.category || !store.itemType) return;
    setSubmitting(true);
    try {
      // 1) photos (skipped if this exact set already went up on a prior try)
      let photoIds: string[] = [];
      if (files.length > 0) {
        const key = files.map((f) => `${f.name}:${f.size}`).join("|");
        if (uploadedRef.current?.key === key) {
          photoIds = uploadedRef.current.ids;
        } else {
          const items = await uploadEnquiryPhotos(files);
          photoIds = items.map((i) => i.id);
          uploadedRef.current = { key, ids: photoIds };
        }
      }
      useConfigurator.getState().setPhotoIds(photoIds);

      // 2) enquiry — payload exactly per docs/API-CONTRACT.md §POST /api/enquiries
      const payload: EnquiryPayload = {
        category: store.category,
        itemType: store.itemType,
        shape: store.shape,
        dimensionsMm: store.dimensionsMm,
        derived,
        material: store.material,
        extras: store.extras,
        snapshotDataUrl: store.snapshotDataUrl,
        contact: {
          name: store.contact.name.trim(),
          email: store.contact.email.trim(),
          phone: store.contact.phone.trim(),
          town: store.contact.town,
        },
        timeframe: store.timeframe,
        notes: store.notes,
        photos: photoIds,
        locale: store.locale,
      };
      const reference = await submitEnquiry(payload);
      router.push(`/configure/success?ref=${encodeURIComponent(reference)}`);
    } catch (err) {
      if (err instanceof EnquiryError && err.kind === "rate-limit") {
        setSubmitError(r.errorRateLimit);
      } else {
        setSubmitError(r.errorNetwork);
      }
      setSubmitting(false);
    }
  }

  if (!item || !category) return null;

  const dimRows = Object.entries(item.dimensionsMm).map(([key]) => {
    const value = store.dimensionsMm[key];
    return {
      label: DIMENSION_LABELS[key]?.[locale] ?? key,
      value: value === null || value === undefined ? r.notSureValue : `${value} mm`,
    };
  });

  const materialText = [
    store.material.species
      ? SPECIES_LABELS[store.material.species][locale]
      : r.notSureValue,
    store.material.finish
      ? FINISH_LABELS[store.material.finish][locale]
      : r.notSureValue,
  ].join(" · ");

  const extrasText =
    store.extras.length > 0
      ? store.extras
          .map((id) => item.extras.find((x) => x.id === id)?.name[locale] ?? id)
          .join(", ")
      : r.none;

  const inputCls =
    "w-full rounded-xl border border-line bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink";

  return (
    <div className="grid gap-8">
      {/* summary */}
      <section aria-label={r.summaryTitle}>
        <p className="caps">{r.summaryTitle}</p>
        {store.snapshotDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.snapshotDataUrl}
            alt={r.snapshotAlt}
            className="mt-4 w-full rounded-2xl border border-line"
          />
        )}
        <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-[13.5px]">
          <Row label={r.category} value={category.name[locale]} />
          <Row label={r.item} value={item.name[locale]} />
          {item.shapes.length > 0 && (
            <Row label={r.shape} value={shapeDef?.name[locale] ?? r.notSureValue} />
          )}
          {dimRows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
          <Row label={r.material} value={materialText} />
          <Row label={r.extras} value={extrasText} />
        </dl>
      </section>

      {/* contact form */}
      <form onSubmit={onSubmit} noValidate className="grid gap-5 border-t border-line pt-6">
        <div>
          <p className="caps">{r.contactTitle}</p>
          <p className="mt-1.5 text-[12.5px] text-soft">{r.contactWhy}</p>
        </div>

        <Field id="enq-name" label={r.name} error={errors.name}>
          <input
            id="enq-name"
            name="name"
            autoComplete="name"
            required
            value={store.contact.name}
            onChange={(e) => store.setContactField("name", e.target.value)}
            className={inputCls}
            aria-invalid={!!errors.name}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="enq-email" label={r.email} error={errors.email}>
            <input
              id="enq-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={store.contact.email}
              onChange={(e) => store.setContactField("email", e.target.value)}
              className={inputCls}
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field id="enq-phone" label={r.phone} error={errors.phone}>
            <input
              id="enq-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={store.contact.phone}
              onChange={(e) => store.setContactField("phone", e.target.value)}
              className={inputCls}
              aria-invalid={!!errors.phone}
            />
          </Field>
        </div>
        <Field id="enq-town" label={r.town}>
          <input
            id="enq-town"
            name="town"
            autoComplete="address-level2"
            value={store.contact.town ?? ""}
            onChange={(e) => store.setContactField("town", e.target.value)}
            className={inputCls}
          />
        </Field>

        {/* timeframe */}
        <fieldset>
          <legend className="caps">{r.timeframe}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => store.setTimeframe(store.timeframe === t ? null : t)}
                aria-pressed={store.timeframe === t}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-btn transition-colors duration-500 ease-hrast ${
                  store.timeframe === t
                    ? "border-ink bg-ink text-white"
                    : "border-line text-soft hover:border-ink/40 hover:text-ink"
                }`}
              >
                {r.timeframes[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <Field id="enq-notes" label={r.notes}>
          <textarea
            id="enq-notes"
            name="notes"
            rows={4}
            placeholder={r.notesPlaceholder}
            value={store.notes ?? ""}
            onChange={(e) => store.setNotes(e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </Field>

        {/* photos */}
        <div>
          <p className="caps">{r.photos}</p>
          <p className="mt-1.5 text-[12.5px] text-soft">{r.photosHint}</p>
          <input
            ref={fileInputRef}
            id="enq-photos"
            type="file"
            accept={PHOTO_TYPES.join(",")}
            multiple
            onChange={(e) => addFiles(e.target.files)}
            className="sr-only"
            aria-label={r.photosAdd}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {previews.map((p, i) => (
              <div key={p.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.name}
                  className="h-20 w-20 rounded-xl border border-line object-cover"
                />
                <button
                  type="button"
                  aria-label={`${r.photoRemove}: ${p.name}`}
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-xs text-ink shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
            {files.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line text-2xl font-light text-soft transition-colors hover:border-ink hover:text-ink"
                aria-label={r.photosAdd}
              >
                +
              </button>
            )}
          </div>
          {photoError && (
            <p role="alert" className="mt-2 text-[12.5px] text-red-700">
              {photoError}
            </p>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-line bg-sand/15 p-4 text-[13px] leading-relaxed"
          >
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={submitting} className="btn disabled:opacity-50">
            {submitting ? dict.nav.sending : submitError ? r.retry : dict.nav.send}
          </button>
          <p className="text-[11.5px] text-soft">{r.privacy}</p>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-soft">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="caps">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12.5px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
