"use client";

// Project editor used by /admin/projects/new and /admin/projects/[id].
// SL and EN side-by-side, zod validation, image management for saved projects.

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  AdminProject,
  PROJECT_CATEGORIES,
  ProjectUpsert,
  projectUpsertSchema,
  SPECIES_OPTIONS,
  useCreateProject,
  useDeleteProject,
  useDeleteProjectImage,
  useReorderProjectImages,
  useUpdateProject,
  useUploadProjectImages,
} from "@/lib/api/admin";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  Card,
  ErrorBox,
  inputClass,
  Labelled,
} from "../../_components/ui";

interface FormState {
  slug: string;
  category: string;
  titleSl: string;
  titleEn: string;
  descriptionSl: string;
  descriptionEn: string;
  species: string;
  town: string;
  year: string;
  sortOrder: string;
  isFeatured: boolean;
  status: "Draft" | "Published";
  coverImageId: string | null;
}

function toFormState(p?: AdminProject): FormState {
  return {
    slug: p?.slug ?? "",
    category: p?.category ?? "kitchen",
    titleSl: p?.titleSl ?? "",
    titleEn: p?.titleEn ?? "",
    descriptionSl: p?.descriptionSl ?? "",
    descriptionEn: p?.descriptionEn ?? "",
    species: p?.species ?? "oak",
    town: p?.town ?? "",
    year: String(p?.year ?? new Date().getFullYear()),
    sortOrder: String(p?.sortOrder ?? 0),
    isFeatured: p?.isFeatured ?? false,
    status: p?.status ?? "Draft",
    coverImageId: p?.coverImageId ?? null,
  };
}

function toPayload(form: FormState): ProjectUpsert {
  return {
    slug: form.slug.trim(),
    category: form.category as ProjectUpsert["category"],
    titleSl: form.titleSl.trim(),
    titleEn: form.titleEn.trim(),
    descriptionSl: form.descriptionSl,
    descriptionEn: form.descriptionEn,
    species: form.species as ProjectUpsert["species"],
    town: form.town.trim(),
    year: Number(form.year),
    sortOrder: Number(form.sortOrder),
    isFeatured: form.isFeatured,
    status: form.status,
    coverImageId: form.coverImageId,
  };
}

export default function ProjectEditor({ project }: { project?: AdminProject }) {
  const router = useRouter();
  const isNew = !project;
  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id ?? "");
  const deleteMutation = useDeleteProject();
  const uploadMutation = useUploadProjectImages(project?.id ?? "");
  const reorderMutation = useReorderProjectImages(project?.id ?? "");
  const deleteImageMutation = useDeleteProjectImage(project?.id ?? "");

  const saving = createMutation.isPending || updateMutation.isPending;

  const orderedImages = useMemo(
    () =>
      [...(project?.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [project?.images],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedNote(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSavedNote(false);

    const payload = toPayload(form);
    const parsed = projectUpsertSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(parsed.data);
        router.replace(`/admin/projects/${created.id}`);
      } else {
        await updateMutation.mutateAsync(parsed.data);
        setSavedNote(true);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Shranjevanje ni uspelo.");
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!window.confirm("Izbrišem projekt? Dejanja ni mogoče razveljaviti.")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(project.id);
      router.push("/admin/projects");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Brisanje ni uspelo.");
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setServerError(null);
    try {
      await uploadMutation.mutateAsync(Array.from(files));
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nalaganje ni uspelo.");
    }
  }

  async function moveImage(index: number, delta: -1 | 1) {
    const ids = orderedImages.map((i) => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderMutation.mutateAsync(ids);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Razvrščanje ni uspelo.");
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!window.confirm("Izbrišem sliko?")) return;
    try {
      await deleteImageMutation.mutateAsync(imageId);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Brisanje slike ni uspelo.");
    }
  }

  async function handleSetCover(mediaAssetId: string) {
    if (!project) return;
    set("coverImageId", mediaAssetId);
    try {
      // Persist immediately with the last-saved project fields + new cover.
      await updateMutation.mutateAsync({
        ...toPayload(toFormState(project)),
        coverImageId: mediaAssetId,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nastavitev naslovnice ni uspela.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && <ErrorBox message={serverError} />}

      <Card className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Labelled label="Slug" htmlFor="p-slug" error={fieldErrors.slug}>
            <input
              id="p-slug"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className={inputClass}
              placeholder="hrastova-kuhinja-kranj"
            />
          </Labelled>
          <Labelled label="Kategorija" htmlFor="p-category" error={fieldErrors.category}>
            <select
              id="p-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
            >
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Labelled>
          <Labelled label="Vrsta lesa" htmlFor="p-species" error={fieldErrors.species}>
            <select
              id="p-species"
              value={form.species}
              onChange={(e) => set("species", e.target.value)}
              className={inputClass}
            >
              {SPECIES_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Labelled>
          <Labelled label="Kraj" htmlFor="p-town" error={fieldErrors.town}>
            <input
              id="p-town"
              value={form.town}
              onChange={(e) => set("town", e.target.value)}
              className={inputClass}
            />
          </Labelled>
          <Labelled label="Leto" htmlFor="p-year" error={fieldErrors.year}>
            <input
              id="p-year"
              type="number"
              min={1990}
              max={2030}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              className={inputClass}
            />
          </Labelled>
          <Labelled label="Vrstni red" htmlFor="p-sort" error={fieldErrors.sortOrder}>
            <input
              id="p-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
              className={inputClass}
            />
          </Labelled>
        </div>

        <div className="flex flex-wrap items-start gap-8 border-t border-neutral-200 pt-4">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Izpostavljen projekt ★
          </label>
          <div>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.status === "Published"}
                onChange={(e) =>
                  set("status", e.target.checked ? "Published" : "Draft")
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              Objavljeno
            </label>
            <p className="mt-1 text-xs text-neutral-500">
              Objava takoj posodobi javno galerijo.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Slovenščina</h2>
          <Labelled label="Naslov (SL)" htmlFor="p-title-sl" error={fieldErrors.titleSl}>
            <input
              id="p-title-sl"
              value={form.titleSl}
              onChange={(e) => set("titleSl", e.target.value)}
              className={inputClass}
            />
          </Labelled>
          <Labelled label="Opis (SL)" htmlFor="p-desc-sl" error={fieldErrors.descriptionSl}>
            <textarea
              id="p-desc-sl"
              rows={6}
              value={form.descriptionSl}
              onChange={(e) => set("descriptionSl", e.target.value)}
              className={inputClass}
            />
          </Labelled>
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">English</h2>
          <Labelled label="Naslov (EN)" htmlFor="p-title-en" error={fieldErrors.titleEn}>
            <input
              id="p-title-en"
              value={form.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              className={inputClass}
            />
          </Labelled>
          <Labelled label="Opis (EN)" htmlFor="p-desc-en" error={fieldErrors.descriptionEn}>
            <textarea
              id="p-desc-en"
              rows={6}
              value={form.descriptionEn}
              onChange={(e) => set("descriptionEn", e.target.value)}
              className={inputClass}
            />
          </Labelled>
        </Card>
      </div>

      {project ? (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Slike</h2>
            <label className={buttonSecondary}>
              {uploadMutation.isPending ? "Nalaganje …" : "Naloži slike"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploadMutation.isPending}
                onChange={(e) => {
                  void handleUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {orderedImages.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Ni še naloženih slik.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {orderedImages.map((img, idx) => {
                const isCover = project.coverImageId === img.mediaAssetId;
                return (
                  <li
                    key={img.id}
                    className="rounded border border-neutral-200 p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumbUrl}
                      alt={img.captionSl ?? ""}
                      className="mb-2 h-24 w-full rounded object-cover"
                    />
                    {isCover && (
                      <p className="mb-1 text-xs font-medium text-green-700">
                        Naslovnica
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => void moveImage(idx, -1)}
                        disabled={idx === 0 || reorderMutation.isPending}
                        aria-label="Premakni sliko levo"
                        className="rounded border border-neutral-300 px-1.5 py-0.5 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveImage(idx, 1)}
                        disabled={
                          idx === orderedImages.length - 1 ||
                          reorderMutation.isPending
                        }
                        aria-label="Premakni sliko desno"
                        className="rounded border border-neutral-300 px-1.5 py-0.5 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => void handleSetCover(img.mediaAssetId)}
                          className="rounded border border-neutral-300 px-1.5 py-0.5"
                        >
                          Naslovnica
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteImage(img.id)}
                        disabled={deleteImageMutation.isPending}
                        className="rounded border border-red-300 px-1.5 py-0.5 text-red-700 disabled:opacity-40"
                      >
                        Izbriši
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : (
        <p className="text-sm text-neutral-500">
          Slike lahko naložite po prvem shranjevanju projekta.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          {saving ? "Shranjevanje …" : isNew ? "Ustvari projekt" : "Shrani"}
        </button>
        {savedNote && (
          <span role="status" className="text-sm text-green-700">
            Shranjeno.
          </span>
        )}
        {project && (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
            className={`${buttonDanger} ml-auto`}
          >
            {deleteMutation.isPending ? "Brisanje …" : "Izbriši projekt"}
          </button>
        )}
      </div>
    </form>
  );
}
