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

## Status

- [x] **M1 — Scaffold**: monorepo, Next 14 + Tailwind tokens from `design/hrast.html`, .NET 8 solution (Api/Domain/Infrastructure + tests), EF Core + initial Identity migration, JWT auth skeleton (login / refresh rotation / logout), Serilog, Swagger, docker-compose MSSQL + smtp4dev
- [x] **M2 — CMS backend**: Project/PageSection/MediaAsset/Enquiry entities, `CmsCore` migration, seed (full landing copy sl+en, 6 sample projects), public + admin endpoints, ImageSharp media pipeline, MailKit enquiry email, rate limiting, revalidation webhook
- [x] **M3 — Landing port**: pixel-faithful hrast port, fully CMS-driven with fallback, gallery category filter + keyboard lightbox, all CTAs → `/configure`
- [x] **M4 — Admin UI**: cookie-based auth proxy, dashboard, projects editor (sl/en, images, publish), typed page-content forms, media library, enquiries view
- [x] **M5–M7 — Configurator + 3D**: full §6 catalog, Zustand store, 6-step wizard, 9 procedural R3F generators, species/finish materials, human-scale silhouette
- [x] **M8 — Enquiry flow**: snapshot + photo upload, `POST /api/enquiries`, workshop email, success page with reference, admin enquiry detail with status + notes
- [ ] M9 — Polish (content pass, a11y audit, more tests, Lighthouse)
