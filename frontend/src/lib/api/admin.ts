"use client";

// Typed client for the admin proxy (/admin/api/*) + TanStack Query hooks.
// All requests go through the Next route-handler proxy which attaches the JWT
// from httpOnly cookies; a 401 anywhere redirects to /admin/login.

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Wire types (mirror docs/API-CONTRACT.md, admin endpoints)
// ---------------------------------------------------------------------------

export interface MediaRef {
  id: string;
  url: string;
  thumbUrl: string;
  mediumUrl: string;
  alt: string;
}

export type ProjectCategory =
  | "kitchen"
  | "bath"
  | "bedroom"
  | "custom"
  | "millwork"
  | "outdoor";
export type Species = "oak" | "walnut" | "ash" | "smoked_oak" | "other";
export type ProjectStatus = "Draft" | "Published";
export type EnquiryStatus = "New" | "Seen" | "Quoted" | "Won" | "Lost";

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "kitchen", label: "Kuhinja" },
  { value: "bath", label: "Kopalnica" },
  { value: "bedroom", label: "Spalnica" },
  { value: "custom", label: "Po meri" },
  { value: "millwork", label: "Stavbno pohištvo" },
  { value: "outdoor", label: "Zunanje" },
];

export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: "oak", label: "Hrast" },
  { value: "walnut", label: "Oreh" },
  { value: "ash", label: "Jesen" },
  { value: "smoked_oak", label: "Dimljeni hrast" },
  { value: "other", label: "Drugo" },
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "New", label: "Novo" },
  { value: "Seen", label: "Videno" },
  { value: "Quoted", label: "Ponudba poslana" },
  { value: "Won", label: "Pridobljeno" },
  { value: "Lost", label: "Izgubljeno" },
];

export function categoryLabel(value: string): string {
  return PROJECT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function speciesLabel(value: string): string {
  return SPECIES_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

export function enquiryStatusLabel(value: string): string {
  return ENQUIRY_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export interface AdminProjectImage {
  id: string;
  mediaAssetId: string;
  sortOrder: number;
  captionSl: string | null;
  captionEn: string | null;
  url: string;
  thumbUrl: string;
  mediumUrl: string;
}

export interface AdminProject {
  id: string;
  slug: string;
  category: ProjectCategory;
  titleSl: string;
  titleEn: string;
  descriptionSl: string;
  descriptionEn: string;
  species: Species;
  town: string;
  year: number;
  sortOrder: number;
  isFeatured: boolean;
  status: ProjectStatus;
  coverImageId: string | null;
  images: AdminProjectImage[];
}

export interface ProjectUpsert {
  slug: string;
  category: ProjectCategory;
  titleSl: string;
  titleEn: string;
  descriptionSl: string;
  descriptionEn: string;
  species: Species;
  town: string;
  year: number;
  sortOrder: number;
  isFeatured: boolean;
  status: ProjectStatus;
  coverImageId: string | null;
}

export const projectUpsertSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug je obvezen.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug mora biti v obliki kebab-case (male črke, številke, vezaji).",
    ),
  category: z.enum(["kitchen", "bath", "bedroom", "custom", "millwork", "outdoor"]),
  titleSl: z.string().min(1, "Slovenski naslov je obvezen."),
  titleEn: z.string().min(1, "Angleški naslov je obvezen."),
  descriptionSl: z.string(),
  descriptionEn: z.string(),
  species: z.enum(["oak", "walnut", "ash", "smoked_oak", "other"]),
  town: z.string(),
  year: z
    .number()
    .int("Letnica mora biti celo število.")
    .min(1990, "Letnica mora biti med 1990 in 2030.")
    .max(2030, "Letnica mora biti med 1990 in 2030."),
  sortOrder: z.number().int(),
  isFeatured: z.boolean(),
  status: z.enum(["Draft", "Published"]),
  coverImageId: z.string().nullable(),
});

export interface AdminMediaAsset {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  thumbUrl: string;
  mediumUrl: string;
  originalUrl: string;
  altTextSl: string | null;
  altTextEn: string | null;
  createdAt: string;
}

export interface ContentItem {
  key: string;
  jsonSl: string;
  jsonEn: string;
  updatedAt: string;
}

export interface EnquirySummary {
  id: string;
  reference: string;
  status: EnquiryStatus;
  category: string;
  itemType: string;
  contactName: string;
  contactEmail: string;
  createdAt: string;
}

export interface EnquiryDetail {
  id: string;
  reference: string;
  status: EnquiryStatus;
  internalNotes: string | null;
  createdAt: string;
  category: string;
  itemType: string;
  shape: string | null;
  dimensionsMm: Record<string, number | null>;
  derived: {
    linearMeters?: number;
    frontAreaM2?: number;
    boardVolumeM3?: number;
  } | null;
  material: { species: string | null; finish: string | null } | null;
  extras: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
    town: string | null;
  };
  timeframe: string | null;
  notes: string | null;
  locale: string;
  snapshot: MediaRef | null;
  photos: MediaRef[];
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.title === "string") {
      const fieldErrors = data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat()
        : [];
      return [data.title, ...fieldErrors].join(" ");
    }
  } catch {
    // fall through
  }
  return `Napaka strežnika (${res.status}).`;
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/admin/api/${path}`, {
    cache: "no-store",
    ...init,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new AdminApiError(401, "Seja je potekla. Prijavite se znova.");
  }

  if (!res.ok) {
    throw new AdminApiError(res.status, await extractError(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ---------------------------------------------------------------------------
// Auth (route handlers outside the proxy)
// ---------------------------------------------------------------------------

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch("/admin/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new AdminApiError(res.status, await extractError(res));
  }
}

export async function logout(): Promise<void> {
  await fetch("/admin/api/auth/logout", { method: "POST" });
}

// ---------------------------------------------------------------------------
// Query hooks — projects
// ---------------------------------------------------------------------------

export function useAdminProjects(filters?: {
  status?: ProjectStatus | "";
  category?: ProjectCategory | "";
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "projects", filters?.status ?? "", filters?.category ?? ""],
    queryFn: () =>
      adminFetch<{ items: AdminProject[] }>(`projects${qs ? `?${qs}` : ""}`),
    select: (data) => data.items,
  });
}

/** Backend exposes only the list endpoint; the editor selects its row from it. */
export function useAdminProject(id: string) {
  return useQuery({
    queryKey: ["admin", "projects", "", ""],
    queryFn: () => adminFetch<{ items: AdminProject[] }>("projects"),
    select: (data) => data.items.find((p) => p.id === id) ?? null,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectUpsert) =>
      adminFetch<AdminProject>("projects", jsonInit("POST", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectUpsert) =>
      adminFetch<AdminProject>(`projects/${id}`, jsonInit("PUT", body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<void>(`projects/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useUploadProjectImages(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      return adminFetch<{ items: AdminProjectImage[] }>(
        `projects/${projectId}/images`,
        { method: "POST", body: form },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useReorderProjectImages(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageIds: string[]) =>
      adminFetch<{ items: AdminProjectImage[] }>(
        `projects/${projectId}/images/order`,
        jsonInit("PATCH", { imageIds }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useDeleteProjectImage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      adminFetch<void>(`projects/${projectId}/images/${imageId}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

// ---------------------------------------------------------------------------
// Query hooks — content
// ---------------------------------------------------------------------------

export function useAdminContent() {
  return useQuery({
    queryKey: ["admin", "content"],
    queryFn: () => adminFetch<{ items: ContentItem[] }>("content"),
    select: (data) => data.items,
  });
}

export function useSaveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      jsonSl,
      jsonEn,
    }: {
      key: string;
      jsonSl: string;
      jsonEn: string;
    }) => adminFetch<ContentItem>(`content/${key}`, jsonInit("PUT", { jsonSl, jsonEn })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}

// ---------------------------------------------------------------------------
// Query hooks — media
// ---------------------------------------------------------------------------

export function useAdminMedia() {
  return useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => adminFetch<{ items: AdminMediaAsset[] }>("media"),
    select: (data) => data.items,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      return adminFetch<{ items: AdminMediaAsset[] }>("media", {
        method: "POST",
        body: form,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch<void>(`media/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });
}

// ---------------------------------------------------------------------------
// Query hooks — enquiries
// ---------------------------------------------------------------------------

export function useAdminEnquiries(status?: EnquiryStatus | "") {
  return useQuery({
    queryKey: ["admin", "enquiries", status ?? ""],
    queryFn: () =>
      adminFetch<{ items: EnquirySummary[] }>(
        `enquiries${status ? `?status=${status}` : ""}`,
      ),
    select: (data) => data.items,
  });
}

export function useAdminEnquiry(id: string) {
  return useQuery({
    queryKey: ["admin", "enquiries", "detail", id],
    queryFn: () => adminFetch<EnquiryDetail>(`enquiries/${id}`),
  });
}

export function usePatchEnquiry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status?: EnquiryStatus; internalNotes?: string }) =>
      adminFetch<{
        id: string;
        reference: string;
        status: EnquiryStatus;
        internalNotes: string | null;
      }>(`enquiries/${id}`, jsonInit("PATCH", body)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
    },
  });
}

/** List-level status patch with optimistic update (inline select in the table). */
export function usePatchEnquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
      adminFetch(`enquiries/${id}`, jsonInit("PATCH", { status })),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["admin", "enquiries"] });
      const snapshots = qc.getQueriesData<{ items: EnquirySummary[] }>({
        queryKey: ["admin", "enquiries"],
      });
      for (const [key, data] of snapshots) {
        if (!data?.items) continue;
        qc.setQueryData(key, {
          ...data,
          items: data.items.map((e) => (e.id === id ? { ...e, status } : e)),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        qc.setQueryData(key, data);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });
}

// ---------------------------------------------------------------------------
// Formatting helpers shared by admin pages
// ---------------------------------------------------------------------------

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sl-SI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
