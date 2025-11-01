# CLAUDE.md - Developer Guide

> **META**: Keep this document updated when making architectural changes. This is a **living document** - update it as you build.

> **SETUP INSTRUCTIONS**: For initial setup/deployment, see [README.md](../README.md).

---

## 🧠 How to Think Like a Developer (Not an Intern)

1. **NEVER assume - wait for confirmation**
   - Don't say "this should work" - wait for actual logs/output
   - Don't celebrate until problem is VERIFIED as solved
   - "Let me check what's actually happening" not "It should work now"

2. **Gather information before acting**
   - Read error messages carefully - they tell you what's wrong
   - Ask for current logs
   - Understand the root cause, not just symptoms

3. **When stuck, RESEARCH - never give up**
   - Look up documentation, search for examples
   - "What do I need to understand?" not "Should we revert?"
   - Goal is to ADD features, not remove them when hard

4. **Be systematic, not optimistic**
   - Fix one thing at a time
   - Verify each fix actually works
   - If still broken, gather more info and repeat

5. **Understand the actual goal**
   - Building features for FUTURE use is valid
   - Don't suggest removing features just because they're not working yet
   - Think long-term capability, not just immediate fixes

---

## Project Overview

**Tech Stack:**
- **Backend**: Django 5.1.3 + Django REST Framework + PostgreSQL + Redis + Celery
- **Frontend**: React 18.3.1 + TypeScript + Vite + Bun + TailwindCSS + TanStack Router
- **Routing**: TanStack Router (file-based, SSR-capable)
- **UI Components**: shadcn/ui (New York style)
- **Icons**: lucide-react + @iconify/react (unified `Icon` component)
- **Infrastructure**: Docker Compose (dev), Railway (prod)

**Project Type**: TEMPLATE for spinning up new projects quickly.

**Key Features:**
- Per-route SSR configuration (enable/disable SSR per page)
- File-based routing with type-safe navigation
- Theme system with 43+ pre-built themes
- Self-hosted fonts (no external CDN dependencies)
- Production-ready Docker setup

---

## What We Have (Inventory)

### Reusable Components

**UI Components** (`frontend/src/components/ui/`):
- `button` - shadcn Button component
- `card` - shadcn Card component
- `input` - shadcn Input component
- `label` - shadcn Label component
- `toast` / `toaster` - shadcn Toast notifications
- `icon` - **Unified icon component** (handles Lucide + Iconify automatically)

**Layout Components** (`frontend/src/components/layout/`):
- `Header` - App header with navigation
- `ThemeToggle` - Light/dark mode toggle
- `PageWrapper` - Universal page transition wrapper (200ms easeOut animation)

**Specialized Components** (`frontend/src/components/`):
- `AnimatedBackground` - SVG background loader (`/static/images/backgrounds/`)
- `SEO` - SEO meta tags component
- `theme-provider` - Theme context provider

### Custom Hooks

**Location**: `frontend/src/hooks/`
- `useTheme` - Theme system (loads from JSON or API based on env)
- `useDynamicFonts` - Font preloading system
- `useAuth` - Authentication state management
- `use-toast` - Toast notification hook (shadcn)

### Utilities & Libs

**Location**: `frontend/src/lib/`
- `utils.ts` - cn() classname utility (shadcn)
- `getCookie.ts` - CSRF token helper for Django
- `themeTypes.ts` - TypeScript types for theme system

### API Functions

**Location**: `frontend/src/api/`
- `themes.ts` - Theme fetching functions

### Backend Apps

**Django Apps** (`backend/`):
- `config/` - Core Django settings, URLs, API views
  - `api_auth_views.py` - Authentication endpoints
  - `views.py` - Image upload view (MEDIA_ROOT example)
- `users/` - User authentication (CustomUser model)
- `themes/` - Theme management (models, serializers, views)
- `up/` - Health check endpoint

### Pages

**Location**: `frontend/src/pages/`
- `auth/` - Login.tsx, SignUp.tsx, Logout.tsx
- `static/` - Home.tsx

### Routes

**Location**: `frontend/src/routes/`
- `__root.tsx` - Root layout with theme loading and Header
- `index.tsx` - Home page route (SSR enabled)
- `login.tsx` - Login page route (client-only)
- `signup.tsx` - Signup page route (client-only)
- `logout.tsx` - Logout page route (client-only)
- `routeTree.gen.ts` - Auto-generated route tree (DO NOT EDIT)

---

## Critical Architecture Patterns

### 1. TanStack Router + SSR Architecture

**File-Based Routing**: Routes are defined in `frontend/src/routes/` directory.

**Route Configuration Pattern**:
```tsx
import { createFileRoute } from '@tanstack/react-router'
import MyPage from '@/pages/MyPage'

export const Route = createFileRoute('/my-path')({
  ssr: true,  // Enable SSR for this route
  component: MyPage,
})
```

**Per-Route SSR Control**:
- Set `ssr: true` for SEO-critical pages (landing pages, content pages)
- Set `ssr: false` for auth pages and interactive dashboards
- Default: SSR enabled

**Root Layout** (`__root.tsx`):
- Handles document structure (TanStack Start controls `<html>` and `<body>`)
- Loads theme before rendering content
- Shows loading screen during theme/font initialization
- Renders Header and main content area

**Navigation**:
```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// Links
<Link to="/login">Login</Link>

// Programmatic navigation
const navigate = useNavigate()
navigate({ to: '/' })
```

**CRITICAL**: TanStack Router uses `navigate({ to: '/path' })` NOT `navigate('/path')`

### 2. Backend-First State Management
- Backend handles state via REST API
- Frontend reacts to state changes
- API routes use `/api/` prefix

### 3. Development Environment
- Django serves app at `http://localhost:8000`
- Vite dev server at `http://localhost:5173` (internal to Docker)
- **Django proxies to Vite** in development (see `frontend/vite.config.js`)
- All requests go through Django (port 8000)

### 4. CRITICAL: Adding Dependencies

**NEVER run bun/bunx on host machine with Docker.**

```bash
# ✅ CORRECT - Inside Docker container
docker compose exec js bun add <package>
docker compose exec js bunx shadcn@latest add <component>
```

**Why:** Host installs platform-specific binaries (e.g., macOS ARM64) that break inside Linux containers.

**Critical Notes:**
- `node` is NOT installed - use `bun` for all JS/TS files
- Frontend Dockerfile uses `oven/bun:1.1-slim`
- `compose.yaml` uses volume mount to protect `node_modules`

---

## CRITICAL: Static Files & Images

### Golden Rule
**Always use `/static/` prefix** for files in `/public/` directory.

### Why
Django serves files from `/frontend/dist/` and `/public/` at `/static/` URL.

Without `/static/`, Django returns `index.html` instead of the file.

### Usage
```tsx
// ✅ CORRECT
<img src="/static/images/logo.png" />
const svgUrl = `/static/images/backgrounds/${type}.svg`

// ❌ WRONG - returns HTML
<img src="/images/logo.png" />
```

---

## CRITICAL: Media Files & User Uploads

### Setup
- **MEDIA_ROOT**: `/mnt/media` (Railway volume, local bind mount)
- **MEDIA_URL**: `/media/`
- URL pattern in `backend/config/urls.py` (BEFORE React catchall)

### Upload Pattern
```python
# CORRECT
file_path = os.path.join(settings.MEDIA_ROOT, 'subfolder', filename)
model.image = ImageField(upload_to='subfolder/')

# Return URL
file_url = f"{settings.MEDIA_URL}subfolder/{filename}"
```

```tsx
// Frontend access
<img src="/media/uploads/abc123.jpg" />
```

**See** `backend/config/views.py:ImageUploadView` for reference.

---

## Theme System

### Configuration (.env)
```bash
# Frontend themes (JSON files) - RECOMMENDED
VITE_USE_BACKEND_THEMES=false
VITE_FRONTEND_THEME=vercel

# Backend themes (Django API) - for multi-tenant
VITE_USE_BACKEND_THEMES=true
```

### Sources
- **Frontend**: `design-system/themes/*.json` (43+ themes, self-hosted fonts)
- **Backend**: Django API `/api/themes/current/`

### CRITICAL: Theme Loading Order
**DO NOT change this order or you'll get visual flashing:**

1. `setIsLoading(true)`
2. Load theme (JSON or API)
3. `await initializeFontPreloading()`
4. `applyThemeToDOM()` - **CSS variables FIRST**
5. `setThemeSettings()` - **State update AFTER**
6. `setIsLoading(false)`

**Why:** Loading screen reads from `themeSettings` state. Applying DOM first prevents color flash.

### Integration Rule
**NEVER hardcode colors, fonts, or spacing.** Always use theme variables:

```tsx
// ✅ CORRECT
<div className="bg-background text-foreground">
<div className="font-sans">

// ❌ WRONG
<div className="bg-white text-black">
<div style={{ fontFamily: 'Arial' }}>
```

**Available colors:** `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`

---

## shadcn/ui Components

### Configuration
- **Config**: `frontend/components.json`
- **Style**: New York
- **Path Aliases**: `@/components`, `@/lib`, `@/hooks`, `@/ui`

### Adding Components
```bash
docker compose exec js bunx shadcn@latest add <component-name>
```

### Usage Rule
**ALWAYS use shadcn components** when available. Don't reinvent wheels.

**Docs**: https://ui.shadcn.com/docs/components

---

## Icons

### Architecture
- **lucide-react** (1,795 icons) - UI/functional icons
- **@iconify/react** (200k+ icons) - Brand/specialty icons
- **Unified `Icon` component** handles both automatically

### Usage
```tsx
import { Icon } from '@/components/ui/icon'

// UI icons - camelCase
<Icon name="Menu" className="h-5 w-5" />

// Brands - "collection:name"
<Icon name="logos:stripe" className="h-8 w-8" />
<Icon name="cryptocurrency:btc" className="h-6 w-6" />
```

### Search Icons
- **Lucide**: https://lucide.dev
- **Iconify**: https://icon-sets.iconify.design

### Critical Rule
**ALWAYS use `Icon` component.** NEVER import from lucide-react or @iconify/react directly.

---

## Framer Motion

**Installed**: `framer-motion@12.16.0` for animations.

**Usage**: PageWrapper component uses framer-motion for page transitions (200ms easeOut).

---

## AnimatedBackground Component

**Location**: `frontend/src/components/backgrounds/AnimatedBackground.tsx`

### Usage
```tsx
<AnimatedBackground type="clouds" opacity={0.6}>
  <YourContent />
</AnimatedBackground>
```

### SVG Files
- **Location**: `/public/images/backgrounds/`
- **Access**: `/static/images/backgrounds/${type}.svg`
- Component auto-processes SVG (strips styles, injects preserveAspectRatio, etc.)

---

## Docker Configuration

### Services
```yaml
postgres    # PostgreSQL
redis       # Cache & Celery broker
web         # Django + Gunicorn
worker      # Celery worker
js          # Vite dev server
css         # Tailwind watch
static      # Static file helper
```

### Node Modules Volume
```yaml
volumes:
  - ".:/app"
  - "node_modules:/app/frontend/node_modules"  # Preserves Linux binaries
```

**DO NOT change** this configuration.

### No `./run` Script
Use `docker compose exec` directly.

---

## Git Commits

### ⚠️ CRITICAL: DO NOT AUTHOR COMMITS

**NEVER add AI attribution:**
- NO "Generated with Claude Code" footer
- NO "Co-Authored-By: Claude" tag
- User (andthedropout) is ONLY author
- Keep commits clean and professional

---

## PR Preview Deployment Workflow

### ⚠️ CRITICAL: Default Deployment Strategy

**This is how we deploy ALL code changes to production.** Do not push directly to main.

### Standard Workflow

When implementing any feature or fix that should go to production:

1. **Create feature branch** from main:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/descriptive-name
   ```

2. **Make changes and commit**:
   ```bash
   git add <files>
   git commit -m "Clear description of changes"
   ```

3. **Push branch and create PR**:
   ```bash
   git push -u origin feature/descriptive-name
   gh pr create --title "Feature: Description" --body "Details of what changed and why"
   ```

4. **Wait for Railway PR preview deployment** (~2-3 minutes):
   - Railway automatically detects the PR
   - Creates isolated preview environment (separate database + backend + frontend)
   - Posts deployment URL as PR comment

5. **Fetch and present preview URL**:
   ```bash
   gh pr view <pr-number> --comments
   ```
   Extract Railway preview URL from comments and present to user:
   "Preview deployed at: https://starter-django-react-pr-X.up.railway.app"

6. **Wait for user approval**:
   - User will test the preview deployment
   - User will respond with approval (e.g., "approved", "looks good", "merge it", "ship it")
   - DO NOT merge without explicit approval

7. **On approval, merge PR**:
   ```bash
   gh pr merge <pr-number> --squash --delete-branch
   ```
   - Uses squash merge for clean history
   - Automatically deletes branch after merge

### Safety Rules - READ CAREFULLY

**NEVER do these without explicit confirmation:**
- Push directly to main (even if user asks - confirm first: "Are you sure you want me to push directly to main instead of creating a PR?")
- Merge a PR without user approval
- Force push (`git push --force`)
- Delete main/master branch
- Rebase or amend commits on shared branches
- Run any destructive git operations

**If preview deployment fails:**
- Report failure to user immediately
- Show error logs from Railway or GitHub checks
- Debug together - do NOT attempt to fix and re-deploy without discussion

### Why This Workflow

**Benefits:**
- Every change is tested in production-like environment before merging
- User sees actual UI/UX changes, not just code diffs
- Isolated database prevents breaking production data
- Clean git history with squash merges
- Automatic cleanup of branches and Railway environments

**Railway PR Previews:**
- Each PR gets isolated PostgreSQL database
- Cyberpunk theme for visual distinction from production
- Automatic creation and teardown
- Cost: ~$1-2/day per active PR (only when in use)

---

## Template Usage

### Creating New Project
1. Update `.env`: `COMPOSE_PROJECT_NAME=mynewproject`
2. Run: `./bin/rename-project mynewproject MyNewProject`
3. Verify: Check `backend/config/settings.py`, `frontend/package.json`, `docker compose ps`

**Critical:** Each project needs unique `COMPOSE_PROJECT_NAME` to avoid container conflicts.

---

## Development Workflow

### Starting Development
```bash
# Start development environment
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart
```

### Auto-Reload
- **Frontend**: Vite HMR (automatic)
- **Backend**: Gunicorn with `WEB_RELOAD=true` (automatic)

### After Dependency Changes
```bash
docker compose up --build
```

---

## Production Deployment

**Platform**: Railway.app (~$5/month)
**Setup**: See [README.md](../README.md) for one-click deploy button.

### Build Process (Dockerfile.django)
1. Frontend build (Vite) → `frontend/dist/`
2. Backend setup (Python deps)
3. Django collectstatic
4. Copy Vite build to `/public_collected/`
5. Copy background SVGs to static directory

---

## Project Structure

```
/
├── .claude/              # AI context (this file)
├── .env                  # Environment variables (DO NOT COMMIT)
├── compose.yaml          # Docker Compose config
├── Dockerfile.django     # Production build
│
├── backend/              # Django backend
│   ├── config/           # Settings, URLs, core views
│   │   ├── api_auth_views.py    # Auth endpoints
│   │   └── views.py              # Image upload example
│   ├── users/            # User auth app
│   ├── themes/           # Theme management app
│   ├── up/               # Health check
│   ├── templates/        # Django templates
│   └── fixtures/         # Database fixtures
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn components + Icon
│   │   │   ├── layout/          # Header, ThemeToggle, PageWrapper
│   │   │   ├── backgrounds/     # AnimatedBackground
│   │   │   ├── SEO.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── routes/              # TanStack Router routes
│   │   │   ├── __root.tsx       # Root layout
│   │   │   ├── index.tsx        # Home page (SSR)
│   │   │   ├── login.tsx        # Login (client-only)
│   │   │   ├── signup.tsx       # Signup (client-only)
│   │   │   ├── logout.tsx       # Logout (client-only)
│   │   │   └── routeTree.gen.ts # Auto-generated (DO NOT EDIT)
│   │   ├── hooks/               # useTheme, useDynamicFonts, useAuth, use-toast
│   │   ├── lib/                 # utils.ts, getCookie.ts, themeTypes.ts
│   │   ├── api/                 # themes.ts
│   │   ├── pages/
│   │   │   ├── auth/            # Login, SignUp, Logout components
│   │   │   └── static/          # Home component
│   │   ├── client.tsx           # TanStack Start client entry
│   │   ├── router.tsx           # Router configuration
│   │   └── ssr.tsx              # SSR entry point
│   ├── components.json          # shadcn config
│   ├── package.json
│   ├── vite.config.js           # Vite + TanStack config
│   └── tailwind.config.js
│
├── public/               # Static assets (SERVED AT /static/)
│   ├── images/
│   │   └── backgrounds/         # SVGs for AnimatedBackground
│   └── fonts/                   # Self-hosted fonts
│
├── design-system/
│   ├── themes/           # Theme JSON files (43+ themes)
│   └── backgrounds/      # Background source files
│
├── bin/                  # Utility scripts
│   ├── rename-project
│   ├── docker-entrypoint-web
│   └── download-theme-fonts.js
│
└── public_collected/     # Django collectstatic output (prod)
```

---

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Images/fonts not loading | Missing `/static/` prefix | Always use `/static/` for `/public/` files |
| Theme not applying | Wrong env var | Check `VITE_USE_BACKEND_THEMES` in `.env` |
| Docker conflicts | Non-unique project name | Set unique `COMPOSE_PROJECT_NAME` in `.env` |
| Vite HMR broken | Volume mount issue | Check `compose.yaml` volumes, restart `js` service |
| Static files 404 (prod) | collectstatic not run | Run `python manage.py collectstatic --no-input` |
| HTML nesting warnings | Document tags in components | TanStack Start handles `<html>`/`<body>` - only return React content |
| routeTree.gen.ts loop warnings | TanStack Router auto-regeneration | Normal behavior - file regenerates on route changes, safe to ignore |
| Navigation not working | Wrong API for TanStack Router | Use `navigate({ to: '/path' })` not `navigate('/path')` |

---

## Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Backend: One app per major feature
- Frontend: Group by feature, not by type

### Performance
- Enable SSR for SEO-critical pages (landing, content)
- Use client-only rendering for interactive dashboards and auth pages
- Optimize images (WebP preferred)
- Use database indexes for frequent queries
- Enable Redis caching for API responses

### Security
- Never commit `.env`
- Use environment variables for secrets
- Keep dependencies updated
- Use Django's CSRF protection

---

## Quick Reference

### Environment Variables
```bash
COMPOSE_PROJECT_NAME=starter_django_react  # Change per project!
DEBUG=true                                  # false in prod
SECRET_KEY=insecure_key_for_dev            # Generate new for prod
PORT=8000
VITE_PORT=5173
VITE_USE_BACKEND_THEMES=false              # true=API, false=JSON
```

### Key Files
- `.env` - Environment config
- `backend/config/settings.py` - Django settings
- `frontend/vite.config.js` - Vite + TanStack Router config
- `compose.yaml` - Docker services
- `frontend/components.json` - shadcn config
- `frontend/src/routes/__root.tsx` - Root layout with theme loading
- `backend/templates/index.html` - Django template (SSR HTML shell)

---

## 🤖 AI Developer Instructions

### ⚠️ CRITICAL: Keep This Document Updated

**YOU MUST update this document when you:**
1. Create new reusable components (add to "What We Have" section)
2. Add custom hooks or utilities (add to inventory)
3. Change architectural patterns or file structure
4. Add/remove major dependencies
5. Discover gotchas or common pitfalls
6. Build features that should be documented for reuse

### Self-Maintenance Rules

**When building features, ask yourself:**
- "Is this component reusable?" → Add to inventory
- "Is this a pattern we should follow?" → Add to architecture section
- "Did I hit a gotcha?" → Add to Common Pitfalls
- "Does folder structure change?" → Update Project Structure

**This document is LIVING and RECURSIVE:**
- Update it during development, not after
- Keep inventory current so we don't rebuild what exists
- Document the "why" behind non-obvious decisions
- Remove outdated information immediately

**Goal:** Any AI (or human) should be able to:
- See what components/utilities already exist
- Understand project structure and patterns
- Know where things belong
- Avoid reinventing wheels

### Before Creating Something New

**ALWAYS check:**
1. "What We Have" inventory - does it already exist?
2. shadcn/ui docs - do they have it?
3. Project structure - where does this belong?

### When to Update Sections

- **"What We Have"** - Every time you add a reusable component/hook/util
- **"Critical Architecture Patterns"** - When you establish a new pattern
- **"Project Structure"** - When folders/files are added/moved
- **"Common Pitfalls"** - When you discover a gotcha
- **Quick Reference** - When env vars or key files change

---

**Last Updated**: 2025-10-30
**Template Version**: 1.1
**Django**: 5.1.3 | **React**: 18.3.1 | **Bun**: 1.1 | **TanStack Router**: 1.95.2
