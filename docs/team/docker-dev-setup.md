# Docker Dev Environment Setup

Containerized development for the astro-shadcn-sanity monorepo. Run Astro, Sanity Studio, and Storybook in Docker — no local Node.js required.

## Prerequisites

- **Docker Desktop v4.24+** (Windows/Mac) or Docker Engine 24+ with Compose v2.24+ plugin (Linux)
- Apple Silicon (M1/M2): Docker Desktop handles arm64 natively, no Rosetta needed
- Node.js is **NOT** required on the host — it runs inside the container

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> && cd astro-shadcn-sanity

# 2. Copy env files (REQUIRED before starting containers)
cp astro-app/.env.example astro-app/.env
cp studio/.env.example studio/.env

# 3. Fill in your Sanity credentials in both .env files

# 4. Start Astro + Studio
docker compose up

# 5. (Optional) Start with Storybook too
docker compose --profile storybook up
```

## Accessing Services

| Service | URL |
|---------|-----|
| Astro | http://localhost:4321 |
| Sanity Studio | http://localhost:3333 |
| Storybook | http://localhost:6006 |

Studio preview links work once the Astro service is fully started.

## Common Operations

```bash
# Restart a single service
docker compose restart astro-app

# View logs for one service
docker compose logs -f studio

# After dependency changes (new/updated packages in package.json)
docker compose down -v && docker compose up --build

# Stop all services
docker compose down

# Full reset (fresh volumes + rebuild)
docker compose down -v && docker compose up --build
```

**Important:** After dependency changes, the `-v` flag is required to clear stale `node_modules` volumes. Running `--build` alone will NOT update dependencies because named volumes persist across rebuilds.

## Troubleshooting

### "Port already in use"

Stop host-level dev servers or change port mapping in `docker-compose.yml`.

### "Module not found" after pulling new deps

Run `docker compose down -v && docker compose up --build` (NOT just `--build` — named volumes must be recreated).

### Missing `.env` file error

You must copy `.env.example` to `.env` in both `astro-app/` and `studio/` before starting containers.

### HMR not working on Windows

Ensure Docker Desktop uses the WSL 2 backend and the project lives inside the WSL filesystem (`~/projects/...`), **NOT** on the mounted Windows filesystem (`/mnt/c/...`). File watching through `/mnt/c/` is extremely slow.

### HMR not working on macOS

`CHOKIDAR_USEPOLLING=true` is already set in `docker-compose.yml`. If still not working, add `server.watch.usePolling: true` to the Vite config in `astro.config.mjs`. If performance is unacceptable, consider `docker compose watch` (Compose v2.22+).

### Storybook not starting with `docker compose up`

Storybook is behind a Compose profile. Use `docker compose --profile storybook up` to include it. Note: `docker compose up storybook` starts **only** Storybook without the other services.
