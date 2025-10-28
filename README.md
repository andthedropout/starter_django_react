# Django + React Starter Template

A modern full-stack starter template for building web applications with Django, React, and TypeScript.

## Tech Stack

### Backend
- **Django 5.1.3** - Python web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Database
- **Redis** - Caching and session storage
- **Celery** - Background task queue
- **Gunicorn** - WSGI server

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool with HMR
- **TailwindCSS 3.4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Framer Motion** - Animation library

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **WhiteNoise** - Static file serving

## Features

- User authentication (login/signup)
- Advanced theming system with light/dark mode (43+ pre-built themes)
- Responsive design components
- Custom animated SVG backgrounds
- Hot module replacement in development
- Docker development environment
- Environment-based configuration
- React Scan integration for performance monitoring
- AI-assisted development ready (Claude Code optimized)

## Quick Start

### Prerequisites
- Docker and Docker Compose v2.20.2+
- Git

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/andthedropout/starter_django_react.git
   cd starter_django_react
   ```

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Build and start containers:**
   ```bash
   docker compose up --build
   ```

4. **Run migrations (in a new terminal):**
   ```bash
   docker compose exec web python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

6. **Visit the app:**
   Open [http://localhost:8000](http://localhost:8000)

## Project Structure

```
├── backend/              # Django backend
│   ├── config/          # Django settings
│   ├── users/           # User authentication
│   └── themes/          # Theming system
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── package.json
├── public/              # Static assets
├── compose.yaml         # Docker Compose config
├── Dockerfile.django    # Django container
└── .env.example         # Environment template
```

## Common Commands

```bash
# Start development environment
docker compose up

# Start in background
docker compose up -d

# Stop containers
docker compose down

# Run Django management commands
docker compose exec web python manage.py <command>

# Run migrations
docker compose exec web python manage.py migrate

# Create superuser
docker compose exec web python manage.py createsuperuser

# Run tests
docker compose exec web python manage.py test

# Access Django shell
docker compose exec web python manage.py shell

# View logs
docker compose logs -f web
docker compose logs -f js

# Rebuild after dependency changes
docker compose up --build
```

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). Add components as needed:

```bash
cd frontend
npx shadcn@latest add button
npx shadcn@latest add card
```

## Design System

The `design-system/` folder contains design assets and configurations:

### Themes (`design-system/themes/`)
- **43+ pre-built themes** in JSON format (vercel, cyberpunk, nature, etc.)
- Used when `VITE_USE_BACKEND_THEMES=false` in `.env`
- Each theme includes:
  - Light and dark mode color palettes
  - Font configurations (Google Fonts)
  - Border radius and spacing settings
- Create custom themes by copying and modifying existing JSON files
- Theme structure:
  ```json
  {
    "theme_name": "mytheme",
    "display_name": "My Theme",
    "cssVars": {
      "theme": { "font-sans": "...", "font-mono": "...", "radius": "..." },
      "light": { /* color tokens */ },
      "dark": { /* color tokens */ }
    }
  }
  ```

### Backgrounds (`design-system/backgrounds/`)
- Source files for animated SVG backgrounds
- Production SVGs are in `/public/images/backgrounds/`
- Use with the `AnimatedBackground` component:
  ```tsx
  import AnimatedBackground from '@/components/backgrounds/AnimatedBackground';

  <AnimatedBackground type="clouds" opacity={0.6}>
    <YourContent />
  </AnimatedBackground>
  ```
- **Important**: SVG files must be in `/public/images/backgrounds/` and accessed via `/static/images/backgrounds/` prefix

## Development Tools

### React Scan (Performance Monitoring)

This template includes [React Scan](https://github.com/aidenybai/react-scan) for detecting performance issues:

- **Enabled in development only** (via `VITE_REACT_SCAN=true` in `.env`)
- Automatically highlights unnecessary re-renders in your React components
- Visual overlay shows render count and component names
- Great for identifying performance bottlenecks during development
- No configuration needed - works out of the box

To disable: Set `VITE_REACT_SCAN=false` in `.env`

### AI-Assisted Development

This project is optimized for AI-assisted development with Claude Code:

- **Comprehensive documentation** in `.claude/CLAUDE.md`
- Includes architecture patterns, best practices, and common pitfalls
- AI-friendly project structure with clear separation of concerns
- All critical paths and workflows documented for AI context
- To update AI instructions: Edit `.claude/CLAUDE.md`

## Environment Variables

Key variables in `.env`:

**Project Configuration:**
- `COMPOSE_PROJECT_NAME` - Docker project name (change this for each new project!)
- `SECRET_KEY` - Django secret key (generate new for production)
- `DEBUG` - Debug mode (true/false)

**Default Superuser (Auto-created on deployment):**
- `DJANGO_SUPERUSER_USERNAME` - Admin username (default: admin)
- `DJANGO_SUPERUSER_EMAIL` - Admin email (default: admin@example.com)
- `DJANGO_SUPERUSER_PASSWORD` - Admin password (default: changeme)

**Theme System:**
- `VITE_USE_BACKEND_THEMES` - Theme source (true = API, false = JSON files)
- `VITE_FRONTEND_THEME` - Theme to use when VITE_USE_BACKEND_THEMES=false (e.g., vercel, cyberpunk, nature)

**Development Tools:**
- `VITE_REACT_SCAN` - Enable React Scan performance monitoring (true/false)

See `.env.example` for all available variables.

## Theme System

This template includes a flexible theming system that supports:
- **Frontend themes**: Fast loading from JSON files (43+ themes in `design-system/themes/`)
- **Backend themes**: Dynamic themes from Django API (for multi-tenant apps)
- Light/dark mode support
- Custom font loading
- Configurable via `VITE_USE_BACKEND_THEMES` environment variable

## Deploy to Production (Railway)

Deploy this template to Railway with one click:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

### Pre-Deployment Setup

Before deploying, you'll need to set these environment variables in Railway:

**Required Variables:**
- `DJANGO_SUPERUSER_USERNAME` - Admin username (e.g., "admin")
- `DJANGO_SUPERUSER_EMAIL` - Admin email (e.g., "admin@example.com")
- `DJANGO_SUPERUSER_PASSWORD` - Admin password (choose a secure password)

**Optional Variables:**
- `VITE_USE_BACKEND_THEMES` - Set to "true" to manage themes via Django admin (default: "false")
- `VITE_FRONTEND_THEME` - Choose theme when using JSON themes (default: "vercel")

All other configuration (database, SECRET_KEY, etc.) is handled automatically by Railway.

### How It Works

1. Click "Deploy on Railway" button
2. Authorize GitHub access
3. Set the 3 superuser variables in Railway dashboard
4. Railway automatically:
   - Provisions PostgreSQL database
   - Generates secure SECRET_KEY
   - Builds frontend (Vite) and backend (Django)
   - Runs database migrations
   - Creates your admin account
   - Deploys your app

Your app will be live at `https://your-app.up.railway.app`

## Using This Template Locally

When creating a new project from this template:

1. **Update the project name:**
   ```bash
   # Edit .env and change COMPOSE_PROJECT_NAME
   export COMPOSE_PROJECT_NAME=mynewproject

   # Run the rename script
   ./bin/rename-project mynewproject MyNewProject
   ```

2. **Clear old containers:**
   ```bash
   docker compose down -v
   ```

3. **Start fresh:**
   ```bash
   docker compose up --build
   ```

## Documentation

See [.claude/CLAUDE.md](./.claude/CLAUDE.md) for detailed developer documentation including:
- Architecture patterns
- Theme system configuration
- Static file handling
- Production deployment
- Common pitfalls and solutions

## License

MIT License - See [LICENSE](./LICENSE) file for details
