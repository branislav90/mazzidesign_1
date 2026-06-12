// Enquiry submission API — mirrors docs/API-CONTRACT.md §POST /api/enquiries
// and §POST /api/enquiries/photos exactly. Zod-validated client-side before send.

import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ---------------------------------------------------------------------------
// Payload schema (contract §8, body = AGENTS.md §8 minus `reference`)
// ---------------------------------------------------------------------------

export const enquiryPayloadSchema = z.object({
  category: z.string().min(1),
  itemType: z.string().min(1),
  shape: z.string().nullable(),
  dimensionsMm: z.record(z.string(), z.number().nullable()),
  derived: z.object({
    linearMeters: z.number().optional(),
    frontAreaM2: z.number().optional(),
    boardVolumeM3: z.number().optional(),
  }),
  material: z.object({
    species: z.enum(["oak", "walnut", "ash", "smoked_oak"]).nullable(),
    finish: z.enum(["oiled", "lacquered", "hardwax"]).nullable(),
  }),
  extras: z.array(z.string()),
  snapshotDataUrl: z.string().nullable(),
  contact: z.object({
    name: z.string().min(1),
    email: z.email(),
    phone: z.string().min(1),
    town: z.string().nullable(),
  }),
  timeframe: z.enum(["asap", "1-3m", "3-6m", "exploring"]).nullable(),
  notes: z.string().nullable(),
  photos: z.array(z.string()),
  locale: z.enum(["sl", "en"]),
});

export type EnquiryPayload = z.infer<typeof enquiryPayloadSchema>;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type EnquiryErrorKind = "rate-limit" | "network" | "validation" | "server";

export class EnquiryError extends Error {
  kind: EnquiryErrorKind;
  status?: number;

  constructor(kind: EnquiryErrorKind, message: string, status?: number) {
    super(message);
    this.name = "EnquiryError";
    this.kind = kind;
    this.status = status;
  }
}

function toEnquiryError(res: Response): EnquiryError {
  if (res.status === 429) {
    return new EnquiryError("rate-limit", "Too many requests", 429);
  }
  if (res.status >= 400 && res.status < 500) {
    return new EnquiryError("validation", `Request rejected (${res.status})`, res.status);
  }
  return new EnquiryError("server", `Server error (${res.status})`, res.status);
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

/**
 * POST /api/enquiries/photos — multipart field `files`, max 3 × 5 MB,
 * jpeg/png/webp. Returns the created MediaAsset ids.
 */
export async function uploadEnquiryPhotos(
  files: File[],
): Promise<{ id: string; url: string }[]> {
  if (files.length === 0) return [];
  const form = new FormData();
  for (const file of files.slice(0, MAX_PHOTOS)) {
    form.append("files", file, file.name);
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/enquiries/photos`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new EnquiryError("network", "Network error during photo upload");
  }
  if (!res.ok) throw toEnquiryError(res);
  const data = (await res.json()) as { items: { id: string; url: string }[] };
  return data.items;
}

/** POST /api/enquiries → 201 { reference: 'ENQ-YYYY-NNNN' }. */
export async function submitEnquiry(payload: EnquiryPayload): Promise<string> {
  const parsed = enquiryPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new EnquiryError("validation", "Invalid enquiry payload");
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    throw new EnquiryError("network", "Network error during enquiry submit");
  }
  if (!res.ok) throw toEnquiryError(res);
  const data = (await res.json()) as { reference: string };
  return data.reference;
}
