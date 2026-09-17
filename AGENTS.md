# Working on this starter

Read `README.md` for commands and deployment. Manifests, lockfiles, and code are authoritative. Keep this stack: **Django/DRF + React + TanStack Start (selective SSR) + shadcn/Tailwind + Bun + Docker**.

## Boundaries

- Django owns persistence, validation, authorization, and sessions. All application UI is React. Do not replace React SSR with Django templates or turn the app into an SPA-only stack.
- Backend features use `models.py` for persistence/constraints, `serializers.py` for validation/representation, `services.py` for named write operations, `views.py` for HTTP/permissions, and `urls.py` for routes. No generic repository framework or empty layers.
- Frontend features live in `src/features/<feature>/{api.ts,queries.ts,types.ts,components/,pages/}`. Flow: transport → feature API → Query hooks → page/container → presentational component.
- Only `src/lib/api-client.ts` performs browser HTTP transport. API modules cannot import React; presentational components cannot import API modules or Query hooks; pages compose state rather than fetching directly. ESLint enforces these boundaries.
- TanStack Query owns server state; do not duplicate sessions/query results in context or local state. Construct a QueryClient per router/request, never a process-wide SSR singleton.
- TanStack Start owns React SSR and file-based routing. Public SEO routes use `ssr: true`; auth/private routes use `ssr: false` and `noindex`. Public HTML must contain meaningful content and metadata without JavaScript. Do not fetch private session data in the shared SSR layout.
- Use the official Start Vite plugin and generated `routeTree.gen.ts`; never hand-edit generated routes or disable generation to mask a watch loop. Keep the generated output outside the route input directory.
- `frontend/server.ts` only adapts Start's fetch handler to Bun, serves built assets, and forwards reserved backend paths. No domain logic, authentication, or alternate rendering engine there.
- Use existing shadcn primitives and Tailwind tokens. No theme API/font-preload gate, dynamic icon registry, global animation wrapper, or parallel design system.

## Security and data

- Same-origin session authentication. CSRF protects anonymous login/signup as well as authenticated writes. Obtain tokens through the API, not a hardcoded cookie name; do not persist them in browser storage.
- Backend permissions are authoritative. Route guards are UX. A failed session request is an error, not an anonymous success.
- Existing databases use Django's built-in `auth.User`. Use `get_user_model()` and related profile models; changing `AUTH_USER_MODEL` on populated databases requires a deliberate migration.
- Never delete volumes, rewrite applied migrations, create default admin credentials, or run migrations on every web-process startup.
- Never expose env files, secrets, cookies, database dumps, or uploads in logs, client bundles, git, or images. Frontend service receives no database/secret env.

## Workflow

- New branch from current main. Leave changes uncommitted unless asked. No main pushes, force pushes, merges, or AI commit attribution.
- Read nearby patterns; migrate every caller and remove obsolete code instead of adding compatibility shims.
- Use Python 3.13/uv and Bun; install frontend dependencies inside Docker, not into its Linux node_modules volume from the host. Update the corresponding lockfile with each manifest change.
- Run README checks, browser verification for UI changes, and a built-image smoke test for deployment changes. Regression tests must defend behavior/security, not source text or implementation details.
- Keep three default dev services (Django, Vite, PostgreSQL). Add a worker/cache only for a real feature. Bound workers, log growth, and container resources; don't poll unnecessarily or prune unrelated Docker resources.
- Update this file and README when contracts change. Do not create duplicate architecture guides, inventories, task reports, or speculative scaffolding.
