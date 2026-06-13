# Deploying & showing the demo to a customer

Three ways to get a public, clickable demo, from fastest to most complete.

| Option | What the customer sees | Backend needed? | Best for |
| --- | --- | --- | --- |
| **A. Vercel (frontend only)** | Full landing site + 3D configurator. Enquiry _submit_ and `/admin` won't work. | No | A quick, polished public URL in minutes |
| **B. Full stack on one host (Docker)** | Everything — landing, configurator, working enquiries, admin, CMS. | Yes (bundled) | A complete, real demo |
| **C. Live demo from your machine (tunnel)** | Everything, served from your laptop. | Runs locally | An ad-hoc demo while you're online |

The frontend ships with a built-in copy of all content (the seed), so the **landing page and configurator look complete even with no backend** — that's why Option A is enough for a visual walkthrough.

---

## Option A — Vercel (fastest public URL)

1. Push the repo to GitHub (see "Pushing to GitHub" below).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import `mazzidesign_1`.
3. Set **Root Directory** to `frontend` (Vercel auto-detects Next.js).
4. (Optional) add env var `NEXT_PUBLIC_API_URL` pointing at a deployed API if you also do Option B; otherwise leave it — the site falls back to built-in content.
5. **Deploy.** You get a `https://<project>.vercel.app` URL to send the customer.

Every push to `main` redeploys automatically.

> **If you see "No Output Directory named `public` found"** after the build prints its
> route table, the build ran but Vercel's **Framework Preset is "Other"** instead of
> Next.js, so it looked for a static `public/` folder. `frontend/vercel.json` pins
> `"framework": "nextjs"` to prevent this; you can also set it in the dashboard:
> Settings → Build and Deployment → Framework Settings → **Framework Preset → Next.js**
> (and turn off any **Output Directory** override) → Save → Redeploy.
>
> **Also set Root Directory to `frontend` (step 3).** Otherwise Vercel builds at the repo
> root and won't find the Next.js app at all.

> **GitHub Pages won't work for this app** — Pages serves only static files, but the
> frontend renders on the server (dynamic routes, the `/admin` auth proxy, middleware,
> revalidation). Use Vercel (above) as the Next.js-native "Pages equivalent".

---

## Option B — Full stack on one host (one command)

Runs database + API + web + a mail viewer together. Works on any machine with Docker (your laptop, or a small cloud VM — DigitalOcean/Hetzner/Azure VM, ~$5–10/mo).

```bash
cp .env.prod.example .env.prod
# edit .env.prod: set strong passwords, and PUBLIC_WEB_URL / PUBLIC_API_URL
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Then:

- **Web** → `http://<host>:3000`
- **Admin** → `http://<host>:3000/admin` (login from `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **API / Swagger** → `http://<host>:5080/swagger`
- **Outgoing enquiry emails** → `http://<host>:5025` (smtp4dev inbox)

The API auto-applies migrations and seeds the landing content, 6 sample projects, and the admin user on first boot. Uploaded media and the database persist in named volumes.

> **Cheaper still:** the app uses **PostgreSQL**, so for production you can drop the bundled `postgres` container and point the API at a free/low-cost managed database (Neon, Supabase, Railway, or Render Postgres all have free tiers). Just set `ConnectionStrings__Default` to its connection string (`Host=…;Port=5432;Database=…;Username=…;Password=…;SSL Mode=Require;Trust Server Certificate=true`) and remove the `postgres` service + `depends_on`.

**On a public VM**, set in `.env.prod`:

```
PUBLIC_WEB_URL=http://YOUR_HOST_OR_IP:3000
PUBLIC_API_URL=http://YOUR_HOST_OR_IP:5080
```

These bake the right URLs into the browser bundle and the API's CORS allow-list. Open ports 3000, 5080 (and 5025 if you want to show the email). For a real domain + HTTPS, put a reverse proxy (Caddy/Nginx) in front — ask and I'll add one.

> Demo settings note: the API runs in its Development profile here so it self-migrates, seeds, and exposes Swagger. Before a true production launch, harden it (Production profile, real SMTP, secrets via your host's secret store, HTTPS).

---

## Option C — Live demo from your machine (tunnel)

Keep the local dev stack running (`docker compose up -d`, `dotnet run`, `npm run dev`) and expose it:

```bash
# install once: brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

It prints a temporary public `https://….trycloudflare.com` URL. Good for a one-off call; the URL dies when you stop the tunnel.

---

## Pushing to GitHub

The remote is set to `git@github.com:branislav90/mazzidesign_1.git` (SSH).

```bash
git push -u origin main
```

If that fails with `Permission denied (publickey)`, either:

- **Authorize your SSH key** — add `~/.ssh/id_ed25519.pub` to GitHub → Settings → SSH keys, then retry; **or**
- **Switch to HTTPS** (GitHub will prompt for a Personal Access Token):
  ```bash
  git remote set-url origin https://github.com/branislav90/mazzidesign_1.git
  git push -u origin main
  ```

## Continuous integration

`.github/workflows/ci.yml` builds, lints, type-checks and tests both apps on every push and PR to `main` — so the repo stays green as you iterate.
