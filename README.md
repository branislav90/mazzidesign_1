# Woodwork Studio — Website + 3D Enquiry Configurator + CMS

Monorepo for a custom woodworking company platform:

- **`/frontend`** — Next.js 14 (App Router, TypeScript, Tailwind). Landing site (port of `design/hrast.html`), enquiry configurator with live 3D preview (`/configure`), admin area (`/admin`).
- **`/backend`** — .NET 8 ASP.NET Core Web API. Custom CMS (projects, page content, media, enquiries), Identity + JWT auth, EF Core + SQL Server.
- **`/design`** — client-approved prototype (`hrast.html`), reference only.

Full build brief: [`AGENTS.md`](AGENTS.md).

## Prerequisites

- Node.js 20+, .NET 8 SDK, Docker

## Run locally

```bash
# 1. Database (MSSQL on port 14333) + smtp4dev (UI on http://localhost:5025)
docker compose up -d

# 2. API — http://localhost:5080 (Swagger at /swagger, applies EF migrations + seeds admin in dev)
cd backend && dotnet run --project src/Api

# 3. Frontend — http://localhost:3000
cd frontend && npm install && npm run dev
```

Dev admin login (seeded automatically): `admin@woodwork.local` / `Admin!Dev2026`
(override via `Admin__Email` / `Admin__Password` env vars — see `.env.example`).

## Useful commands

| Command | Where | What |
| --- | --- | --- |
| `npm run build` / `npm run lint` | `frontend/` | Production build / ESLint |
| `npm run gen:api` | `frontend/` | Regenerate API types from the running API's OpenAPI spec |
| `dotnet build` / `dotnet test` | `backend/` | Build / run tests |
| `dotnet ef migrations add <Name> --project src/Infrastructure --startup-project src/Api` | `backend/` | New EF migration |

## Status — done

- [x] **M1 — Scaffold**: monorepo, Next 14 + Tailwind tokens from `design/hrast.html`, .NET 8 solution (Api/Domain/Infrastructure + tests), EF Core + initial Identity migration, JWT auth (login / refresh rotation / logout), Serilog, Swagger, docker-compose MSSQL + smtp4dev
- [x] **M2 — CMS backend**: Project/PageSection/MediaAsset/Enquiry entities, `CmsCore` migration, seed (full landing copy sl+en, 6 sample projects), public + admin endpoints, ImageSharp media pipeline (webp thumb/medium/large), MailKit enquiry email, rate limiting (5/min/IP), revalidation webhook
- [x] **M3 — Landing port**: pixel-faithful hrast port, fully CMS-driven with built-in fallback, gallery category filter + keyboard lightbox, all CTAs → `/configure`, SL/EN toggle, reduced-motion support
- [x] **M4 — Admin UI**: JWT in httpOnly cookies via Next proxy (refresh-and-retry), dashboard, projects editor (sl/en side-by-side, image upload/reorder/cover, draft/publish), typed page-content forms, media library, enquiries with status + internal notes
- [x] **M5–M7 — Configurator + 3D**: full catalog (5 categories, 15 item groups), Zustand store = enquiry payload, 6-step wizard, 9 procedural R3F generators, species tinting + finish roughness, human-scale silhouette, derived measurements
- [x] **M8 — Enquiry flow**: 3D snapshot + photo upload, `POST /api/enquiries`, workshop email with inline snapshot + JSON attachment, success page with `ENQ-YYYY-NNNN` reference, admin enquiry detail
- [x] **Section images**: hero / rooms / video-cover photos manageable from the admin (media picker in Vsebina strani); wood-grain SVG placeholders render until a photo is set
- [x] Fixes after review: project image upload (`DbUpdateConcurrencyException`), duplicate image in upload response

## Status — remaining

- [ ] **M9 — Polish**: native-speaker pass over Slovenian copy, full a11y audit (axe/keyboard walkthrough), Lighthouse ≥90/≥95 run + image `sizes`/preload tuning, frontend unit tests (catalog integrity, derived math, stairs computation — Vitest not yet installed), Playwright happy-path (Kitchen → L → dims → submit), backend integration tests with Testcontainers MSSQL
- [ ] **Production config**: real SMTP credentials, strong `Jwt__Secret` + admin password via env, HTTPS/host setup, Azure Blob `IFileStorage` implementation if/when needed (interface is in place)
- [ ] **Content**: replace placeholder social URLs, set the real YouTube film id, upload real photography through the admin (gallery projects + hero/rooms/video covers)
- [ ] Optional (client-gated): scroll-stacking services cards from `mizar.html` — only if the client asks (per brief §1)
