# AGENTS.md — Woodwork Studio: Website + 3D Enquiry Configurator + CMS

> Drop this file in the repo root (Claude Code also reads it if named `CLAUDE.md`).
> It is the single source of truth for what to build, how, and in what order.

## 1. Project overview

A platform for a custom woodworking company (kitchens, bathrooms, bedrooms, custom furniture, millwork, outdoor structures) with three parts:

1. **Landing site** — a one-page marketing site. The **chosen design is `design/hrast.html`** — the final, client-approved direction (quiet-luxury atelier look). It must be ported into Next.js pixel-faithfully, preserving every element:
   - warm-white / ink / sand palette (`--white:#F7F4EF`, `--ink:#221C16`, `--sand:#C8B49A`), Marcellus serif + Mulish typography, letterspaced small-caps labels
   - symmetric nav with the brand centered, ceremonial centered hero with line-by-line serif headline reveal
   - **scroll-expanding hero image** (signature: pinned panel grows from small/rounded to full-bleed as the user scrolls, caption fades in)
   - quiet centered statement section (no marquees, no scrolling text strips — explicitly rejected)
   - **sticky chapters section** ("Rooms"): left column pinned while images scroll on the right; Roman numeral, title and text cross-fade per room; images un-mask via clip-path
   - gallery: keep hrast's visual language, but implement the functionality agreed earlier — **category filter + lightbox with keyboard navigation**, fed from the CMS `Project` entity (the horizontal snap strip in the prototype is the visual starting point; extend it with filters and a lightbox in the same style)
   - video showcase section with frosted-glass play button (YouTube-nocookie embed or self-hosted, CMS-configurable)
   - testimonial quote, serif animated counters, "Begin with a conversation" CTA, social links (Instagram / Facebook / YouTube, CMS-configurable)
   - slow, elegant motion throughout: 1.3 s blur-to-sharp reveals, fill-from-below button hover; **no custom cursor / mouse-follower effects** (explicitly rejected); `prefers-reduced-motion` respected
   - procedural SVG wood-grain textures remain as placeholders until real photography is uploaded through the CMS
   `design/mizar.html` is kept only as an alternative reference and is NOT to be built. (Note: the scroll-stacking cards interaction the client liked lives in mizar; if the client later asks to bring it into hrast for the services section, treat that as an approved pattern — but do not add it unprompted.)
   All content on the landing page is **served from the CMS**, not hardcoded.
2. **Enquiry configurator** (`/configure`) — every "Get a quote / Enquire" CTA leads to a guided multi-step builder with a **live 3D preview**: pick category → item → shape → dimensions → material → submit. The workshop receives machine-readable specs so quoting and calculation become easy.
3. **CMS / Admin** (`/admin`) — the workshop admin logs in to: add/edit/publish **projects** (gallery items with photos), edit **page content** (every text/number/link on the landing page), manage media, and view incoming **enquiries**.

Customer-facing language is **Slovenian first, English second** (content is stored per-locale in the CMS; UI strings in locale files).

## 2. Tech stack (fixed — do not deviate without asking)

**Frontend** — `/frontend`
- **Next.js 14, App Router, React, TypeScript**
- Tailwind CSS, tokens extracted from `design/hrast.html` (`--white`, `--ink`, `--sand`, Marcellus/Mulish → `tailwind.config.ts`)
- **React Three Fiber + drei** for the 3D configurator preview
- **Zustand** for configurator state (the store IS the enquiry payload)
- **TanStack Query** for API data; **Zod** for client-side validation mirroring API contracts
- Public pages fetch published content server-side with ISR (`revalidate` tag-based); the .NET API calls a Next revalidation webhook on publish

**Backend** — `/backend`
- **.NET 8 ASP.NET Core Web API** (single project or thin vertical slices — no microservices)
- **EF Core 8 + SQL Server (MSSQL)** — migrations checked in; `docker-compose.yml` provides `mcr.microsoft.com/mssql/server:2022-latest` for local dev
- **ASP.NET Core Identity + JWT** (access + refresh) for admin auth — admin users seeded via migration/env, no public registration
- **FluentValidation** on all write endpoints; ProblemDetails for errors
- File storage: local disk under `/backend/storage` behind an `IFileStorage` abstraction (so Azure Blob can replace it later); images re-encoded and resized on upload (thumb/medium/large) with ImageSharp
- Email to the workshop via SMTP (`MailKit`), config from env; if SMTP env is missing, log the rendered email and continue (dev mode)
- **Serilog** structured logging; **Swashbuckle/OpenAPI** at `/swagger` in dev — the frontend generates its API types from this spec (`openapi-typescript`)
- Tests: **xUnit** + Testcontainers (MSSQL) for integration tests of the API

## 3. Repository layout (monorepo)

```
/design/                       ← existing prototypes (mizar.html, hrast.html) — reference only
/frontend/
  src/app/(site)/page.tsx      ← landing (CMS-driven)
  src/app/configure/           ← configurator wizard
  src/app/admin/               ← admin SPA area (login, dashboard, projects, content, enquiries)
  src/components/landing/      ← Hero, StackCards, Gallery, Video, Process, Contact
  src/components/configurator/ ← Wizard.tsx, steps/, three/
  src/lib/catalog.ts           ← product catalog (section 6)
  src/lib/api/                 ← generated API client + fetch helpers
/backend/
  src/Api/                     ← controllers/endpoints, auth, DI, Program.cs
  src/Domain/                  ← entities, value objects
  src/Infrastructure/          ← EF Core DbContext, migrations, file storage, email
  tests/
/docker-compose.yml            ← mssql + (optional) smtp4dev
```

## 4. CMS — content model and admin

### Entities (EF Core, schema `cms`)

- **Project** — the gallery/portfolio item. Fields: `Id`, `Slug`, `Category` (kitchen|bath|bedroom|custom|millwork|outdoor), `Title_sl/Title_en`, `Description_sl/Description_en`, `Species` (oak|walnut|ash|smoked_oak|other), `Town`, `Year`, `SortOrder`, `IsFeatured`, `Status` (Draft|Published), `CoverImageId`, navigation → `ProjectImage[]` (ordered, each with optional caption per locale).
- **PageSection** — structured landing-page content. One row per section key: `hero`, `statement`, `craftCards` (JSON array of 4 cards: number, title, text, features[]), `processSteps` (JSON array), `stats` (JSON array of {value, suffix, label}), `videoSection` ({title, youtubeId|videoUrl, captionTitle, captionMeta}), `contact` ({phone, email, address, hours}), `socialLinks` ({instagram, facebook, youtube, tiktok?}), `seo` ({title, description, ogImage}). Each: `Key`, `Json_sl`, `Json_en`, `UpdatedAt`, `UpdatedBy`. Define a Zod/JSON-schema per key shared in docs so admin forms and the frontend agree.
- **MediaAsset** — uploaded files: `Id`, `FileName`, `ContentType`, `SizeBytes`, variant paths (original/large/medium/thumb), `AltText_sl/en`, `CreatedAt`.
- **Enquiry** — the configurator submission (schema in section 8) + `Status` (New|Seen|Quoted|Won|Lost) + `InternalNotes`.
- **AdminUser** — via Identity.

### API surface (prefix `/api`)

- Public, read-only, cached: `GET /content/page` (all published sections for a locale), `GET /projects?category=&featured=` , `GET /projects/{slug}`, `POST /enquiries` (rate-limited 5/min/IP, anonymous).
- Admin (JWT, role `Admin`): full CRUD for projects + images (multipart upload, drag-to-reorder via `SortOrder` patch), `PUT /content/{key}` per section with validation against that key's schema, media library list/upload/delete (block delete when referenced), `GET /enquiries` list with filters + `PATCH /enquiries/{id}` status/notes, `POST /revalidate-frontend` is invoked automatically on any publish (calls Next.js revalidation webhook with a shared secret).

### Admin UI (`/admin` in the Next app)

- Login page (JWT in httpOnly cookie via a small Next route handler proxy — never localStorage).
- **Dashboard**: new enquiries count, recent enquiries table.
- **Projects**: list with status/category filters; editor with both locales side-by-side, image upload with preview + ordering, Draft/Publish toggle. Publishing instantly updates the public gallery (revalidation).
- **Page content**: one form per section key, generated from the section schema (typed forms, not a generic JSON editor), with a "preview on site" link.
- **Enquiries**: table → detail view rendering the full configuration (dimensions, derived measurements, 3D snapshot image, customer photos), status dropdown, internal notes.
- Keep the admin visually plain (shadcn/ui or simple Tailwind forms) — design effort belongs to the public site.

## 5. Configurator UX — step by step

Full-screen wizard: **left = choices, right = live 3D viewport** (mobile: 3D on top, sticky). Progress bar, back/forward always preserved, jump back to any completed step. Every step writes to the Zustand store; the 3D preview reacts immediately.

1. **What do you need?** — category cards (section 6) with subcategory preview text.
2. **Pick the item** — item types within the category.
3. **Shape / layout** — per item (kitchen: straight / L / U / galley / with island; wardrobe: straight / corner L / walk-in U; table: rectangular / round / oval; staircase: straight / quarter turn / half turn…). Selecting swaps the parametric model.
4. **Dimensions** — sliders + numeric inputs (mm) with per-item min/default/max from the catalog. Live 3D regeneration. Show derived figures: linear meters of cabinetry, m² of fronts, board volume estimate.
5. **Material & finish** — species (oak / walnut / ash / smoked oak) re-tints the 3D material; finish (oiled / lacquered / hardwax); per-item extras (pull-out spice racks, drawer organizers, LED interior, soft-close…).
6. **Review & send** — summary + 3D snapshot (canvas `toDataURL`), contact form (name, email, phone, town, timeframe, notes, up to 3 photos of their space, 5 MB each) → `POST /api/enquiries` → success page with reference number (`ENQ-2026-0001`) and "we reply within one working day".

Tone: friendly, zero jargon; each step explains in one line why it's asked. Any configuration value may be "not sure" (→ `null` + note); only contact info is required.

## 6. Product catalog (seed data — implement exactly, extendable)

Typed data in `frontend/src/lib/catalog.ts`: `Category → ItemType → { shapes, dimensions (min/default/max per axis), extras }`.

### Kitchen & Dining
- **Cabinetry**: custom island units, pantry cupboards, overhead shelving
- **Storage**: pull-out spice racks, custom drawer organizers, wine racks
- **Serveware**: heavy-duty cutting boards, wooden bowls, custom knife blocks

### Closet & Storage
- **Walk-in closets**: built-in shoe racks, customized hanging sections, dresser islands
- **Wardrobes**: freestanding armoires, linen closets, hallway coat storage
- **Utility boxes**: blanket chests, toy boxes, decorative trunks

### Living & Bedroom Furniture
- **Seating**: dining chairs, benches, stools, armchair frames
- **Tables**: coffee tables, side tables, desks, large dining tables
- **Bedding**: custom bed frames, headboards, nightstands

### Architectural & Millwork (Built-ins)
- **Trim work**: crown molding, baseboards, window casings, wainscoting
- **Fixtures**: floating bookshelves, fireplace mantels, radiator covers
- **Structural**: wooden staircases, handrails, doors, window frames

### Outdoor & Garden
- **Structures**: pergolas, gazebos, garden sheds, decking
- **Furniture**: patio tables, Adirondack chairs, porch swings
- **Planters**: heavy-duty window boxes, raised garden beds

Notes:
- Small serveware items skip shape complexity: simple length × width × thickness box preview.
- Trim work is quoted per linear meter: ask total running length + profile height; preview shows an extruded profile along a wall segment.

## 7. 3D preview — parametric models, not artist assets

Everything **procedurally generated from boxes/extrusions** in R3F — no GLB downloads. Quality bar: clean proportions, soft shadows, wood-toned PBR material tinted per species, drei `<Environment>` lighting, OrbitControls with sensible limits, slow auto-rotate when idle.

Per-shape generator functions `(dims, options) => JSX`:
- **Kitchen straight run**: base cabinets (600 deep) as segmented boxes with 18 mm front gaps, worktop slab, overhead cabinets, optional island block. **L/U**: joined runs.
- **Wardrobe**: tall box subdivided into door segments (~500–600 each, computed from width), plinth, optional open shoe section.
- **Table**: top slab + legs (or trestle), `RoundedBox` edges.
- **Bed**: platform + headboard + toggleable nightstand blocks.
- **Stairs**: step count computed from total rise (170–185 mm/step), stringers, optional handrail cylinders.
- **Pergola**: posts + beam grid from footprint.

Toggleable human-scale silhouette (1.8 m) for size reference; dimension lines with labels on axis hover. Performance: memoize geometry per 10 mm bucket so slider drags stay <16 ms; cap DPR at 1.5 on mobile.

## 8. Enquiry payload (single contract: C# DTO + FluentValidation ⇄ TS types from OpenAPI)

```ts
{
  reference: string,            // server-generated ENQ-YYYY-NNNN
  category: CategoryId,
  itemType: ItemTypeId,
  shape: ShapeId | null,
  dimensionsMm: Record<string, number | null>,
  derived: { linearMeters?: number, frontAreaM2?: number, boardVolumeM3?: number },
  material: { species: 'oak'|'walnut'|'ash'|'smoked_oak'|null, finish: 'oiled'|'lacquered'|'hardwax'|null },
  extras: string[],
  snapshotDataUrl: string | null,   // stored as MediaAsset server-side
  contact: { name: string, email: string, phone: string, town: string|null },
  timeframe: 'asap'|'1-3m'|'3-6m'|'exploring'|null,
  notes: string|null,
  photos: MediaAssetId[],
  locale: 'sl'|'en'
}
```

On submit the API: persists, stores snapshot + photos as MediaAssets, emails the workshop a tidy HTML table + snapshot inline + JSON attachment. This structure is what "makes it calculable" — never lose a field to free text.

## 9. Quality bar / definition of done

- `npm run build` clean (frontend); `dotnet build` + `dotnet test` clean (backend); both linted (ESLint / `dotnet format`).
- One command up: `docker compose up` (MSSQL) + `dotnet run` + `npm run dev`; document in README. EF migrations apply automatically in dev.
- Lighthouse landing: ≥90 perf / ≥95 a11y. Configurator interactive <3 s on mid-range mobile.
- Keyboard-navigable wizard and admin; labeled inputs; `prefers-reduced-motion` respected (no auto-rotate, no landing animations).
- All public content from CMS; seed migration inserts the full landing content (taken from the prototype copy) and 6 sample projects so the site renders complete on first run.
- Security: JWT in httpOnly cookies, refresh rotation, admin endpoints `[Authorize(Roles="Admin")]`, upload type/size whitelist, rate limiting on `POST /enquiries`, no secrets in repo (`.env.example` provided).
- Tests — backend: enquiry create flow, content publish + revalidation call, auth, project CRUD (Testcontainers MSSQL); frontend: catalog integrity, derived-measurement math, stairs computation (Vitest); one Playwright happy path: Kitchen → L-shape → dims → submit (mock API).
- Commit per milestone, conventional commits.

## 10. Milestones (work in this order, stop after each for review)

1. **Scaffold** — monorepo, Next app + Tailwind tokens from `design/hrast.html`, .NET solution + EF Core + docker-compose MSSQL, Identity + JWT auth skeleton, Swagger, CI-ready scripts.
2. **CMS backend** — entities, migrations, seed content + sample projects, public content/projects endpoints, admin CRUD endpoints, media upload pipeline, revalidation webhook.
3. **Landing port (CMS-driven)** — pixel-faithful port of the prototype consuming `GET /content/page` + `GET /projects`; gallery, lightbox, video, socials all CMS-fed; CTAs → `/configure`.
4. **Admin UI** — login, dashboard, projects editor, page-content forms, media library.
5. **Configurator: catalog + store + wizard shell** — steps 1–2, no 3D yet.
6. **3D core** — Canvas, materials, generators for kitchen straight + L, wardrobe, table; live dimensions step.
7. **Remaining generators + material/extras** — bed, stairs, pergola, simple-box items, trim-profile mode.
8. **Enquiry flow** — review/snapshot/upload, `POST /enquiries`, email, success page; admin enquiries view with status + notes.
9. **Polish** — Slovenian content pass, a11y, tests, Lighthouse, README.

## 11. Things NOT to do

- No third-party CMS (Strapi/Sanity/Umbraco) — the custom one above is the requirement.
- No microservices, no message bus — one API project.
- No GLTF/asset downloads for 3D; everything parametric.
- No customer-facing price estimates in v1 — derived measurements only (pricing rules may come later).
- Don't break the design language of the chosen prototype; when in doubt, open `design/hrast.html` and match it.
- Don't store customer data outside MSSQL + the workshop email.
