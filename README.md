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
- [ ] M2 — CMS backend (entities, seed content, public + admin endpoints, media pipeline, revalidation webhook)
- [ ] M3 — Landing port (CMS-driven, pixel-faithful to `design/hrast.html`)
- [ ] M4 — Admin UI
- [ ] M5 — Configurator: catalog + store + wizard shell
- [ ] M6 — 3D core
- [ ] M7 — Remaining 3D generators + material/extras
- [ ] M8 — Enquiry flow
- [ ] M9 — Polish (Slovenian content, a11y, tests, Lighthouse)
