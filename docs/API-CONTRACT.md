# API Contract — single source of truth for backend and frontend

Base URL (dev): `http://localhost:5080`. All routes below are relative to it.
Locales: `sl` (default) | `en`. Public endpoints localize server-side via `?locale=`.

## Media reference (shared shape)

```ts
interface MediaRef {
  id: string;          // GUID
  url: string;         // absolute URL of the "large" variant
  thumbUrl: string;    // absolute URL, ~400px
  mediumUrl: string;   // absolute URL, ~1000px
  alt: string;         // localized alt text
}
```

Uploaded files are stored under `/backend/storage` and served by the API at
`/uploads/...` (absolute URLs returned, e.g. `http://localhost:5080/uploads/abc_large.webp`).

## Public endpoints (anonymous, cached)

### `GET /api/content/page?locale=sl`

```ts
{ sections: Record<SectionKey, object> }   // every PUBLISHED section for that locale
```

Section keys and their exact per-locale JSON shapes (these mirror `design/hrast.html`):

- `hero`: `{ label: string, titleLines: { text: string, em?: string }[], sub: string, imageCaption: { title: string, meta: string } }`
  (`em` is a substring of `text` rendered as italic sand-colored serif)
- `statement`: `{ label: string, text: string, em?: string }`
- `rooms`: `{ items: { numeral: string, title: string, text: string, linkText: string, imageTag: { title: string, meta: string }, species: Species }[] }`
- `gallery`: `{ label: string, title: string }`  (section heading only; cards come from projects)
- `videoSection`: `{ label: string, title: string, youtubeId: string | null, videoUrl: string | null, captionTitle: string, captionMeta: string }`
- `testimonial`: `{ quote: string, who: string }`
- `stats`: `{ items: { value: number, suffix?: string, label: string }[] }`
- `contact`: `{ label: string, title: string, em?: string, text: string, ctaText: string, altText: string, email: string, phone: string, phoneDisplay: string, address: string }`
- `socialLinks`: `{ instagram?: string, facebook?: string, youtube?: string, tiktok?: string }`
- `seo`: `{ title: string, description: string, ogImage?: string }`

### `GET /api/projects?locale=sl&category=&featured=`

```ts
{ items: ProjectDto[] }

interface ProjectDto {
  id: string;
  slug: string;
  category: 'kitchen'|'bath'|'bedroom'|'custom'|'millwork'|'outdoor';
  title: string;          // localized
  description: string;    // localized
  species: 'oak'|'walnut'|'ash'|'smoked_oak'|'other';
  town: string;
  year: number;
  isFeatured: boolean;
  coverImage: MediaRef | null;
  images: MediaRef[];     // ordered
}
```

When `images` is empty the frontend renders the procedural SVG wood-grain
placeholder, pattern chosen by `species` (oak→g1, walnut/smoked_oak→g2, ash→g3,
matching the `<pattern>` defs in `design/hrast.html`).

### `GET /api/projects/{slug}?locale=sl` → `ProjectDto`

### `POST /api/enquiries`  (rate-limited 5/min/IP)

Body — exactly AGENTS.md §8 minus `reference`:

```ts
{
  category: string, itemType: string, shape: string | null,
  dimensionsMm: Record<string, number | null>,
  derived: { linearMeters?: number, frontAreaM2?: number, boardVolumeM3?: number },
  material: { species: 'oak'|'walnut'|'ash'|'smoked_oak'|null, finish: 'oiled'|'lacquered'|'hardwax'|null },
  extras: string[],
  snapshotDataUrl: string | null,        // data:image/png;base64,...
  contact: { name: string, email: string, phone: string, town: string | null },
  timeframe: 'asap'|'1-3m'|'3-6m'|'exploring'|null,
  notes: string | null,
  photos: string[],                       // MediaAsset GUIDs from the photos endpoint
  locale: 'sl'|'en'
}
```

Response `201`: `{ reference: string }` — format `ENQ-YYYY-NNNN` (year + zero-padded sequence).

### `POST /api/enquiries/photos`  (rate-limited; multipart field `files`, max 3 files, 5 MB each, jpeg/png/webp)

Response: `{ items: { id: string, url: string }[] }`

## Auth (already implemented)

`POST /api/auth/login { email, password }` → `{ accessToken, refreshToken, accessTokenExpiresAtUtc }`
`POST /api/auth/refresh { refreshToken }` → same shape (rotation).
`POST /api/auth/logout { refreshToken }` (Bearer required).

## Admin endpoints (Bearer JWT, role `Admin`, prefix `/api/admin`)

- `GET /projects?status=&category=` → `{ items: AdminProjectDto[] }` (both locales raw:
  `titleSl/titleEn/descriptionSl/descriptionEn`, plus `status: 'Draft'|'Published'`, `sortOrder`)
- `POST /projects` / `PUT /projects/{id}` / `DELETE /projects/{id}`
- `POST /projects/{id}/images` (multipart `files`) → adds ordered `ProjectImage`s
- `PATCH /projects/{id}/images/order` `{ imageIds: string[] }`
- `DELETE /projects/{id}/images/{imageId}`
- `GET /content` → `{ items: { key, jsonSl, jsonEn, updatedAt }[] }` (raw JSON strings)
- `PUT /content/{key}` `{ jsonSl: string, jsonEn: string }` — validated against that key's schema
- `GET /media` / `POST /media` (multipart) / `DELETE /media/{id}` (409 if referenced)
- `GET /enquiries?status=` → list (summary), `GET /enquiries/{id}` → full payload incl. snapshot/photo MediaRefs
- `PATCH /enquiries/{id}` `{ status?: 'New'|'Seen'|'Quoted'|'Won'|'Lost', internalNotes?: string }`

Publishing a project or saving content triggers the API to call the frontend:
`POST {Frontend:BaseUrl}/api/revalidate` with header `X-Revalidate-Secret: <secret>`
and body `{ "tags": ["content", "projects"] }`. Dev secret: `dev-revalidate-secret`
(API config `Frontend:BaseUrl=http://localhost:3000`, `Frontend:RevalidateSecret`;
Next env `REVALIDATE_SECRET`). The Next route handler calls `revalidateTag` for each tag.

## Frontend data fetching

- Landing page: server-side `fetch` with `next: { tags: ['content'] }` / `['projects']`.
- Admin SPA: client components → Next route-handler proxy `/admin/api/*` which attaches
  the JWT from an httpOnly cookie (set by the login route handler) — tokens never in localStorage.
