# Django + TanStack Start app starter

The same full-stack foundation, with less machinery: **Django 5.2 LTS / DRF, PostgreSQL 17, React, TanStack Start, TypeScript, shadcn/ui, Tailwind 4, Bun, and Docker**. uv locks Python dependencies; Bun locks frontend dependencies. Exact versions are in the manifests and lockfiles.

**Public React routes use SSR for SEO. Auth/app routes are client-rendered.** Django owns the API, validation, permissions, sessions, and admin. No Django templates for application UI, no theme service/font downloads, and no always-on Redis/Celery scaffolding.

## Start

Requires Docker/Compose v2 and Git; no host Python/JavaScript installation needed.

```sh
# For a fresh clone only; never overwrite existing credentials.
cp -n .env.example .env
# Set a unique PROJECT_NAME before the first startup of each clone.
# Adjust WEB_PORT / VITE_PORT if 8000 / 5173 are already occupied.
./bin/setup
```

Open `http://localhost:5173` (or your `VITE_PORT`). Start/Vite proxies `/api`, `/admin`, `/static`, `/media`, and `/up` to Django. Use the frontend origin for the application. When changing the frontend port, update `SITE_URL` and `CSRF_TRUSTED_ORIGINS` too. Django's direct development port defaults to 8000.

Sign up in the app. There is **no default admin or automatic superuser creation**.

```sh
docker compose exec web python manage.py createsuperuser
docker compose logs -f web js
docker compose stop                 # retain containers and data
docker compose down                 # retain named volumes/data
```

Never use `down -v` unless you intend to erase this project's database. Changing `PROJECT_NAME` selects different volumes; it does not migrate an existing database. Setup preserves an existing `.env` and applies migrations explicitly.

## Code boundaries

```text
backend/
  config/                settings, URL composition, Gunicorn
  users/                 auth serializers, services, views, tests
  up/                    liveness and database readiness
frontend/
  server.ts              thin Bun adapter: Start fetch, assets, Django proxy
  src/
    router.tsx           per-request router and QueryClient
    routes/              Start file routes, SSR flags, metadata
    features/auth/
      api.ts             typed HTTP operations
      queries.ts         TanStack Query server state
      types.ts           API contracts
      pages/             stateful page composition
      components/        presentational forms
    components/ui/       shadcn primitives
    lib/                 browser transport and shared utilities
    index.css            Tailwind/theme tokens
```

Backend: **model/constraints → serializer → service when needed → view**. Frontend: **transport → feature API → Query hooks → page → presentational component**. Keep features together; don't build generic repository/store frameworks. ESLint checks frontend import boundaries; CI checks backend import direction. `AGENTS.md` is the single agent guide, imported by `CLAUDE.md`.

Session auth lives under `/api/v1/auth/{csrf,session,signup,login,logout}/`. Login/signup require CSRF even before authentication. The client obtains a fresh token before writes, so cookie rotation doesn't leave a stale browser token. Django permissions remain authoritative; client route guards are only UX.

Existing databases use Django's built-in user table. Use `get_user_model()` and related profile models for app-specific fields. Changing `AUTH_USER_MODEL` on a populated database requires a deliberate migration.

### SSR for SEO

Public routes use `ssr: true` and return meaningful React HTML, title, description, canonical, and social metadata without JavaScript. Private/auth routes use `ssr: false` and `noindex`. Set `SITE_URL` to the canonical public origin; keep the sitemap limited to indexable routes.

Use Start's normal Vite plugin and file-based routes. `routeTree.gen.ts` is generated, not hand-edited. There is no host-only generation step or `DISABLE_ROUTE_GEN` workaround. Keep the generated file outside `src/routes`. A QueryClient is created per router/request, never shared between SSR users. The public root doesn't fetch private session state.

The production Bun adapter delegates rendering to Start's built fetch handler; it does not implement a second renderer. Hashed frontend assets live at `/assets/`; Django's admin assets live at `/static/`.

Tailwind scans only `src`, not generated output. Keep the explicit `source('./')` in `index.css`: otherwise client and SSR builds can produce different stylesheet hashes.

## Checks and dependencies

```sh
docker compose exec -w /app web uv run ruff check backend .github
docker compose exec -w /app web uv run ruff format --check backend .github
docker compose exec web python manage.py check
docker compose exec web python manage.py makemigrations --check --dry-run
docker compose exec web python manage.py test
docker compose run --rm --no-deps js bun run lint
docker compose run --rm --no-deps js bun run typecheck
docker compose run --rm --no-deps js bun run build
```

CI checks both layers, migration drift, and production image behavior. Regression tests defend auth/CSRF and request boundaries rather than implementation details. Verify UI changes in a browser and SSR changes with JavaScript disabled.

Run frontend checks in disposable containers, not alongside Vite in its memory-limited container. They share the Linux dependency volume but have separate memory limits.

```sh
docker compose exec -w /app web uv add <python-package>
docker compose exec js bun add <package>
docker compose exec js bunx --bun shadcn@latest add <component>
# Commit the corresponding manifest AND uv.lock / frontend/bun.lock.
docker compose up -d --build
```

Install frontend dependencies inside Linux, never into Docker's node_modules from macOS. Tailwind tokens live in `frontend/src/index.css`; use ordinary shadcn components and static Lucide imports where needed. No external font loading is required.

## Resource use

- Three dev services: PostgreSQL, Django, Start/Vite. No idle helper container, duplicated CSS watcher, or unused task worker.
- Two production app images: Python/Gunicorn/WhiteNoise and Bun/compiled Start output. Neither includes compilers; the frontend runtime has no full node_modules tree. No nginx/supervisor layer inside either image.
- One Gunicorn worker/two threads by default; tune `WEB_CONCURRENCY` and `WEB_THREADS` only after measuring. PostgreSQL remains major 17 with its existing volume name.
- Separate dependency/build/runtime layers, dependency-layer caching, named Linux dependency volumes, rotated logs, and bounded Compose resources. Watchers use filesystem events, not blanket polling.
- Stop the stack when idle. Inspect `docker stats` and `docker system df`; never automatically prune unrelated containers, images, caches, or volumes.

## Deploy

Production uses separate backend and frontend services with one public origin. The frontend proxies reserved backend paths, preserving session cookies and request origins. Configure `SITE_URL` on the frontend and `DJANGO_API_URL` to the backend's private URL. Never expose the backend/database publicly or pass database secrets to the frontend.

Backend requires `DEBUG=false`, a long random `SECRET_KEY`, PostgreSQL `DATABASE_URL`, exact `ALLOWED_HOSTS`, HTTPS `CSRF_TRUSTED_ORIGINS`, and stable `PROJECT_NAME`. Set `TRUST_PROXY_HEADERS=true` only behind the controlled frontend/platform proxy. Don't deploy the development `.env` unchanged.

Production enables HTTPS redirects, secure cookies, and one-hour HSTS. `SECURE_HSTS_INCLUDE_SUBDOMAINS` and `SECURE_HSTS_PRELOAD` default to false; enable only after confirming every subdomain supports permanent HTTPS. CI runs Django's strict deployment check with both enabled; the default profile deliberately retains their two opt-in warnings.

Migrations are a release step, not a web-start side effect. Back up the database first; apply backward-compatible migrations before replacing app images. Arrange off-host backups and test restoration: a volume is not a backup. User uploads/object storage are intentionally not implemented.

### Railway

1. Add PostgreSQL and **two services from this repository**. Backend builds `Dockerfile.django`; frontend builds `Dockerfile.frontend`. Keep their Dockerfile start commands.
2. Set backend variables above. Its pre-deploy command is `python /app/backend/manage.py migrate --noinput`; healthcheck is `/up/`. Include the public frontend hostname and `healthcheck.railway.app` in backend `ALLOWED_HOSTS`, and the public HTTPS origin in `CSRF_TRUSTED_ORIGINS`.
3. Give only the frontend a public domain. Set its `SITE_URL` to that HTTPS origin and `DJANGO_API_URL` to the backend's private address including its port. No database or Django secret on this service.
4. The frontend healthcheck `/up/` forwards to Django. `/up/ready/` also checks the database; avoid frequent readiness polling if you want the database to sleep.
5. Create an administrator explicitly in the backend environment. Configure PR environments in Railway with an isolated database; repo files alone do not create preview resources.

[Railway has deprecated Config-as-Code](https://docs.railway.com/infrastructure-as-code). Configure each service explicitly in the dashboard; no root `railway.toml` is shipped because it overrides both services' Dockerfile settings. For Infrastructure-as-Code, import the actual project with `railway config pull` and review its plan instead of embedding project-specific IDs in this template.

Dockerfiles use ordinary dependency-layer caching, not cache mounts: Railway requires literal service-specific cache IDs, which would tie this template to one project.

### DigitalOcean droplet / other Docker host

Install Docker/Compose, point DNS to the droplet, allow 80/443, and restrict SSH. Create a gitignored, mode-600 `.env.production` with the backend variables plus `DOMAIN`, `ACME_EMAIL`, `SITE_URL`, and `POSTGRES_USER/POSTGRES_DB/POSTGRES_PASSWORD`. `DATABASE_URL` uses host `postgres`; URL-encode special characters in credentials. Use the public HTTPS origin for trusted origins and canonical URL.

```sh
docker compose --env-file .env.production -f compose.production.yaml build
docker compose --env-file .env.production -f compose.production.yaml up -d postgres
docker compose --env-file .env.production -f compose.production.yaml run --rm web python /app/backend/manage.py migrate --noinput
docker compose --env-file .env.production -f compose.production.yaml up -d
```

Caddy is the droplet's HTTPS edge; it forwards to the frontend, which forwards API/admin requests to Django. Database and app ports stay internal. Certificates and PostgreSQL data persist in named volumes. The application images are the same ones used on Railway.

## Upgrading an older copy

Themes/backgrounds, duplicated Start packages, custom font loading, unused Redis/Celery services, automatic admin creation, and the destructive rename script are removed. **React SSR is retained.** Old theme tables and existing user volumes are not dropped. Review new env keys while preserving credentials. Stop old services, then remove only this project's obsolete containers with `docker compose up -d --remove-orphans`; don't delete volumes. Auth API paths changed; update external consumers before deployment. Railway now runs the frontend and backend as separate services rather than three processes in one root container. Before merging an upgrade, configure both production services' Dockerfile paths and Django's migration command in Railway; the old root TOML configuration is removed.

## References

[Django releases](https://www.djangoproject.com/download/) · [Start setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch) · [Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr) · [Bun hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#bun) · [shadcn/Vite](https://ui.shadcn.com/docs/installation/vite) · [Docker practices](https://docs.docker.com/build/building/best-practices/)

MIT license; see `LICENSE`.
