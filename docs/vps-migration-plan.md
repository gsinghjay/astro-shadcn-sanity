---
title: "VPS Migration Plan: Cloudflare Pages to Dockerized Self-Hosting"
description: "Migration plan from Cloudflare Pages free tier to a Dockerized VPS stack with nginx, PostgreSQL, Authentik, and Sanity API CDN"
date: 2026-02-19
status: proposed
---

# VPS Migration Plan: Cloudflare Pages to Dockerized Self-Hosting

> **Last updated:** 2026-02-19
> **Status:** Proposed
> **Supersedes:** Current Cloudflare Pages deployment (see [Cloudflare Guide](cloudflare-guide.md))

**Note:** Replace all instances of `your-domain.com` with your actual domain name throughout this document.

---

## Table of Contents

1. [Decision Context](#1-decision-context)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites](#3-prerequisites)
4. [Docker Compose Stack](#4-docker-compose-stack)
5. [Application Code Changes](#5-application-code-changes)
6. [Self-Hosted GitHub Actions Runner](#6-self-hosted-github-actions-runner)
7. [CI/CD Deploy Pipeline](#7-cicd-deploy-pipeline)
8. [Sanity Webhook Rebuild](#8-sanity-webhook-rebuild)
9. [Cloudflare DNS Proxy (Optional)](#9-cloudflare-dns-proxy-optional)
10. [Authentik Configuration](#10-authentik-configuration)
11. [Epic 9 Impact Assessment](#11-epic-9-impact-assessment)
12. [Security Hardening](#12-security-hardening)
13. [Rollback Plan](#13-rollback-plan)
14. [Post-Migration Verification](#14-post-migration-verification)
15. [File Reference](#15-file-reference)

---

## 1. Decision Context

### Current State

The site runs on **Cloudflare Pages** (free tier) with static output. All pages pre-render at build time. Cloudflare's CDN serves the HTML/CSS/JS with zero Worker invocations. This costs $0/month and works well for the public site.

### Problem

Epic 9 introduces SSR portal routes that require Workers runtime, D1 database, KV storage, R2 object storage, and Cloudflare Access. The free tier imposes hard limits that force descoping 4 stories and partially redesigning 2 others (see [Cloudflare Guide](cloudflare-guide.md#55-epic-9-descoping-decisions)).

Key constraints:

| Resource | Free Tier Limit | Impact |
|----------|----------------|--------|
| Worker CPU time | 10 ms/invocation | JWT validation + data fetch must fit in 10ms |
| D1 rows read | 5M/day | Full table scans exhaust this quickly |
| D1 rows written | 100K/day | Activity tracking alone uses 1K+/day |
| Worker subrequests | 50/invocation | Each D1 query = 1 subrequest |
| CF Access seats | 50 users | Hard user cap |

### Proposed Alternative

Move hosting to an **existing VPS** ($6/month, already provisioned) running a fully Dockerized stack: nginx, PostgreSQL, Authentik, and the Astro Node.js server. Use **Sanity's API CDN** for build-time content fetching (free tier: 500K requests/month). Optionally place **Cloudflare's free DNS proxy** in front for CDN caching and DDoS protection.

### Trade-off Summary

| Factor | Cloudflare Pages (Free) | VPS + Docker |
|--------|------------------------|--------------|
| Monthly cost | $0 | $6 (already paying) |
| Global CDN | Yes (edge network) | Via Cloudflare DNS proxy (free) |
| SSR CPU limit | 10ms hard cap | None (full Node.js runtime) |
| Database | D1 (daily limits) | PostgreSQL (no limits) |
| Auth | CF Access (50 seats) | Authentik (no seat limit) |
| Epic 9 stories | 10 of 15 (descoped) | All 15 feasible |
| Maintenance | Zero | `docker compose up -d` + OS updates |
| DDoS protection | Built-in | Via Cloudflare DNS proxy (free) |
| Preview deploys | Automatic per branch | Manual (script-based) |

---

## 2. Architecture Overview

### Target Architecture

```mermaid
flowchart TB
    subgraph internet ["Internet"]
        User([Visitor])
    end

    subgraph cf ["Cloudflare (Free DNS Proxy)"]
        DNS[DNS + CDN Edge Cache]
        DDoS[DDoS Protection]
    end

    subgraph vps ["VPS ($6/month · 2 GB RAM)"]
        subgraph docker ["Docker Compose Stack (~750 MB)"]
            NGINX["nginx\n:443 → :80"]
            AK["Authentik\n:9000 / :9443"]
            ASTRO["Astro Node.js\n:4321"]
            PG["PostgreSQL\n:5432"]
            REDIS["Redis\n:6379"]
        end
        RUNNER["GitHub Actions Runner\n(host)"]
        CERTS["Let's Encrypt\ncertificates"]
    end

    subgraph external ["External Services"]
        SANITY["Sanity API CDN\napicdn.sanity.io"]
        GTM["GTM / GA4\n(client-side)"]
        GH["GitHub\nrepository"]
    end

    User --> DNS --> DDoS --> NGINX
    NGINX -->|"static files"| ASTRO
    NGINX -->|"/portal/* auth_request"| AK
    AK -->|"authenticated"| ASTRO
    ASTRO --> PG
    AK --> PG
    AK --> REDIS
    RUNNER -->|"docker compose build"| ASTRO
    RUNNER -->|"build-time fetch"| SANITY
    GH -->|"webhook trigger"| RUNNER
    User -.->|"browser-side"| GTM

    style cf fill:#f0f8ff,stroke:#4a9eff
    style docker fill:#f0fff0,stroke:#4a9e4a
```

### Request Flow: Static Pages

```mermaid
sequenceDiagram
    participant V as Visitor
    participant CF as Cloudflare DNS Proxy
    participant N as nginx container
    participant A as Astro container

    V->>CF: GET /sponsors
    CF->>CF: Check edge cache
    alt Cache hit
        CF-->>V: 200 (cached HTML)
    else Cache miss
        CF->>N: Forward request
        N->>A: Proxy to astro:4321
        A->>A: Serve pre-rendered static file
        A-->>N: 200 HTML
        N-->>CF: 200 HTML
        CF->>CF: Cache response
        CF-->>V: 200 HTML
    end
```

### Request Flow: SSR Portal Pages

```mermaid
sequenceDiagram
    participant V as Sponsor
    participant CF as Cloudflare DNS Proxy
    participant N as nginx container
    participant AK as Authentik container
    participant A as Astro container
    participant PG as PostgreSQL container
    participant S as Sanity API

    V->>CF: GET /portal/dashboard
    CF->>N: Forward (no cache for /portal/*)
    N->>AK: auth_request subrequest
    alt No session cookie
        AK-->>V: 302 Redirect to Authentik login
        V->>AK: Login (email, Google, GitHub)
        AK-->>V: Set session cookie + 302 to original URL
        V->>CF: GET /portal/dashboard (with cookie)
        CF->>N: Forward
        N->>AK: auth_request subrequest
    end
    AK->>AK: Validate session
    AK-->>N: 200 + X-authentik-email/groups headers
    N->>A: Forward + user identity headers
    A->>S: Fetch sponsor data (GROQ)
    A->>PG: Query RSVPs, agreements
    A->>A: Render HTML
    A-->>N: 200 HTML
    N-->>CF: 200 HTML
    CF-->>V: 200 HTML
```

### Memory Budget (2 GB VPS)

| Service | Estimated RAM | Notes |
|---------|--------------|-------|
| Linux kernel + OS | ~150–200 MB | Minimal Ubuntu |
| Docker daemon | ~60–80 MB | containerd + shims |
| PostgreSQL | ~40–60 MB | Tuned `shared_buffers=64MB` |
| Redis | ~10–15 MB | Session store for Authentik |
| Authentik server | ~180–220 MB | Django/Gunicorn |
| Authentik worker | ~120–160 MB | Celery background tasks |
| Astro/Node.js | ~50–100 MB | Depends on page count |
| nginx | ~5–10 MB | Alpine, static config |
| **Total at idle** | **~615–845 MB** | |
| **Headroom** | **~1,155–1,385 MB** | Available for traffic spikes and OS buffers |

This fits comfortably within 2 GB. The Authentik stack uses ~365 MB total compared to Keycloak's 400–700 MB, and the built-in proxy outpost eliminates oauth2-proxy as a separate service.

---

## 3. Prerequisites

### VPS Requirements

| Requirement | Minimum | Current VPS |
|-------------|---------|-------------|
| OS | Ubuntu 22.04+ or Debian 12+ | ✓ |
| RAM | 2 GB | 2 GB |
| Disk | 20 GB | ✓ |
| Docker Engine | 24+ | Install below |
| Docker Compose | v2 (bundled) | Install below |

That's it. No Node.js, PostgreSQL, nginx, Java, or certbot installed on the host. Everything runs in containers. The only host-level software is Docker and the GitHub Actions runner.

### Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Domain DNS

Point your domain to the VPS IP address. If using Cloudflare DNS proxy (Section 9), set the A record with the orange cloud enabled (proxied).

### Sanity API CDN Budget

| Resource | Free Plan Limit | Expected Build Usage |
|----------|----------------|---------------------|
| API CDN requests/month | 500,000 | ~3,000–12,000 (1–2 builds/day) |
| API requests/month | 100,000 | Near zero (CDN handles queries) |
| Datasets | 2 | 1 (`production`) |
| Documents | 500,000 | ~200 current |
| Asset storage | 20 GB | ~500 MB current |

Build-time queries use `apicdn.sanity.io` (the CDN endpoint). The `useCdn: true` setting in `astro.config.mjs` already routes queries through Sanity's CDN.

---

## 4. Docker Compose Stack

The entire infrastructure lives in a single `docker-compose.yml`. All services communicate over a Docker bridge network. Only nginx exposes ports to the host.

### Directory Structure on VPS

```text
/opt/ywcc/
├── docker-compose.yml
├── .env                          # Secrets (not in git)
├── Dockerfile.astro              # Multi-stage Astro build
├── nginx/
│   └── default.conf              # nginx reverse proxy config
├── certbot/
│   ├── conf/                     # Let's Encrypt certificates
│   └── www/                      # ACME challenge directory
├── media/                        # Authentik media storage
├── custom-templates/             # Authentik custom branding (optional)
└── reports/                      # Site health reports
```

### `docker-compose.yml`

```yaml
services:
  # --- Database ---
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    command: >
      postgres
        -c shared_buffers=64MB
        -c effective_cache_size=256MB
        -c work_mem=2MB
        -c maintenance_work_mem=32MB
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # --- Session Store ---
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --maxmemory 32mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # --- Identity Provider ---
  authentik-server:
    image: ghcr.io/goauthentik/server:2024.12
    restart: unless-stopped
    command: server
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgres
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASSWORD}
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - ./media:/media
      - ./custom-templates:/templates
    networks:
      - internal

  authentik-worker:
    image: ghcr.io/goauthentik/server:2024.12
    restart: unless-stopped
    command: worker
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgres
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASSWORD}
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - ./media:/media
      - ./custom-templates:/templates
    networks:
      - internal

  # --- Astro SSR + Static ---
  astro:
    build:
      context: .
      dockerfile: Dockerfile.astro
      args:
        PUBLIC_SANITY_STUDIO_PROJECT_ID: ${PUBLIC_SANITY_STUDIO_PROJECT_ID}
        PUBLIC_SANITY_STUDIO_DATASET: ${PUBLIC_SANITY_STUDIO_DATASET}
        PUBLIC_GTM_ID: ${PUBLIC_GTM_ID}
        PUBLIC_SITE_URL: ${PUBLIC_SITE_URL}
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      HOST: "0.0.0.0"
      PORT: "4321"
      DATABASE_URL: postgresql://${PG_USER}:${PG_PASSWORD}@postgres:5432/${APP_DB}
    networks:
      - internal

  # --- Reverse Proxy ---
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    depends_on:
      - astro
      - authentik-server
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - internal

  # --- SSL Certificate Renewal ---
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks: []

volumes:
  pgdata:
  redisdata:

networks:
  internal:
    driver: bridge
```

### `.env`

```bash
# Domain
DOMAIN=your-domain.com

# PostgreSQL (shared by Authentik and app)
PG_USER=ywcc
PG_PASSWORD=generate-a-strong-password

# Databases
APP_DB=ywcc

# Authentik
AUTHENTIK_SECRET_KEY=generate-a-long-random-string

# Sanity (public, used at build time)
PUBLIC_SANITY_STUDIO_PROJECT_ID=49nk9b0w
PUBLIC_SANITY_STUDIO_DATASET=production
PUBLIC_GTM_ID=GTM-NS9N926Q
PUBLIC_SITE_URL=https://your-domain.com
```

Generate secrets:

```bash
# PostgreSQL password
openssl rand -base64 32

# Authentik secret key (50+ chars recommended)
openssl rand -base64 60
```

### `Dockerfile.astro`

Multi-stage build — installs dependencies, builds the Astro site, and runs the Node.js server in a minimal image:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY astro-app/package.json astro-app/
COPY studio/package.json studio/
RUN npm ci --workspace=astro-app

COPY astro-app/ astro-app/

ARG PUBLIC_SANITY_STUDIO_PROJECT_ID
ARG PUBLIC_SANITY_STUDIO_DATASET
ARG PUBLIC_GTM_ID
ARG PUBLIC_SITE_URL

RUN npm run build --workspace=astro-app

# Stage 2: Run
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -S astro && adduser -S astro -G astro

COPY --from=builder --chown=astro:astro /app/astro-app/dist ./dist
COPY --from=builder --chown=astro:astro /app/node_modules ./node_modules

USER astro

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
```

### `nginx/default.conf`

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=portal_api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=authentik_login:10m rate=5r/s;

# HTTP → HTTPS redirect + ACME challenge
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io" always;

    # --- Authentik outpost endpoints ---
    location /outpost.goauthentik.io {
        proxy_pass http://authentik-server:9000/outpost.goauthentik.io;
        proxy_set_header Host $host;
        proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Set-Cookie $auth_cookie;
        auth_request_set $auth_cookie $upstream_http_set_cookie;
    }

    # Authentik sign-in redirect (used by error_page 401)
    location @goauthentik_proxy_signin {
        internal;
        add_header Set-Cookie $auth_cookie;
        return 302 /outpost.goauthentik.io/start?rd=$request_uri;
    }

    # --- Portal routes (authenticated via Authentik) ---
    location /portal/ {
        auth_request /outpost.goauthentik.io/auth/nginx;
        error_page 401 = @goauthentik_proxy_signin;

        # Translate Authentik headers into upstream headers
        auth_request_set $authentik_username $upstream_http_x_authentik_username;
        auth_request_set $authentik_groups $upstream_http_x_authentik_groups;
        auth_request_set $authentik_email $upstream_http_x_authentik_email;
        auth_request_set $authentik_name $upstream_http_x_authentik_name;
        auth_request_set $authentik_uid $upstream_http_x_authentik_uid;
        auth_request_set $auth_cookie $upstream_http_set_cookie;
        add_header Set-Cookie $auth_cookie;

        proxy_set_header X-authentik-username $authentik_username;
        proxy_set_header X-authentik-groups $authentik_groups;
        proxy_set_header X-authentik-email $authentik_email;
        proxy_set_header X-authentik-name $authentik_name;
        proxy_set_header X-authentik-uid $authentik_uid;

        proxy_pass http://astro:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        limit_req zone=portal_api burst=20 nodelay;
    }

    # --- Authentik UI (login, enrollment, admin) ---
    location /if/flow/ {
        proxy_pass http://authentik-server:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        limit_req zone=authentik_login burst=10 nodelay;
    }

    location /if/ {
        proxy_pass http://authentik-server:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Authentik API + static assets (required for UI)
    location ~ ^/(api|static|media)/ {
        proxy_pass http://authentik-server:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Authentik WebSocket (live updates in admin)
    location /ws/ {
        proxy_pass http://authentik-server:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- Dev dashboard (direct to Astro, no auth) ---
    location /dev {
        proxy_pass http://astro:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- All other routes (static + SSR via Astro) ---
    location / {
        proxy_pass http://astro:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://astro:4321;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
}
```

All `proxy_pass` directives use Docker service names (`astro`, `authentik-server`) — Docker's internal DNS resolves these on the `internal` network.

### SSL Certificates (Initial Setup)

Obtain the initial certificate before starting the full stack:

```bash
cd /opt/ywcc

# Start a temporary nginx for the ACME challenge
docker run -d --name certbot-nginx \
  -p 80:80 \
  -v ./certbot/www:/var/www/certbot:ro \
  nginx:alpine \
  sh -c 'echo "server { listen 80; location /.well-known/acme-challenge/ { root /var/www/certbot; } }" > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"'

# Request the certificate
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d your-domain.com -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos --non-interactive

# Clean up
docker stop certbot-nginx && docker rm certbot-nginx
```

The `certbot` service in `docker-compose.yml` handles automatic renewal after initial setup.

### Create Databases

```bash
cd /opt/ywcc

# Start only PostgreSQL
docker compose up -d postgres

# Wait for healthy
docker compose exec postgres pg_isready -U ywcc

# Create the Authentik database
docker compose exec postgres psql -U ywcc -c "CREATE DATABASE authentik;"

# Create the app database
docker compose exec postgres psql -U ywcc -c "CREATE DATABASE ywcc;"
```

### Start the Stack

```bash
cd /opt/ywcc
docker compose up -d
```

Verify all services are running:

```bash
docker compose ps
```

Expected: `postgres`, `redis`, `authentik-server`, `authentik-worker`, `astro`, `nginx` all show `Up`. View logs:

```bash
docker compose logs -f               # All services
docker compose logs -f authentik-server  # Single service
```

### Initial Authentik Admin Setup

On first launch, create the admin account:

```bash
docker compose exec authentik-server ak create_recovery_key 10 akadmin
```

This outputs a recovery URL. Open it in your browser to set the admin password. Then access the Authentik admin UI at `https://your-domain.com/if/admin/`.

---

## 5. Application Code Changes

These changes happen in the repository, not on the VPS.

### Astro Adapter Swap

Replace the Cloudflare adapter with the Node.js adapter:

```bash
npm install @astrojs/node --workspace=astro-app
```

Update `astro-app/astro.config.mjs`:

```diff
- import cloudflare from "@astrojs/cloudflare";
+ import node from "@astrojs/node";

  export default defineConfig({
-   output: "static",
-   adapter: cloudflare({ platformProxy: { enabled: true } }),
+   output: "hybrid",
+   adapter: node({ mode: "standalone" }),
    // ... rest unchanged
  });
```

| Setting | Before | After |
|---------|--------|-------|
| `output` | `"static"` | `"hybrid"` (static by default, SSR opt-in) |
| `adapter` | `cloudflare()` | `node({ mode: "standalone" })` |
| Build output | `dist/` (static + `_worker.js`) | `dist/client/` (static) + `dist/server/entry.mjs` (SSR) |

All existing pages remain static. Only pages with `export const prerender = false` use SSR. No existing pages do this, so the public site behaves identically.

Add a `start` script to `astro-app/package.json`:

```json
{
  "scripts": {
    "start": "node dist/server/entry.mjs",
    "build": "astro check && astro build"
  }
}
```

### Remove Cloudflare-Specific Files

- Delete `astro-app/wrangler.jsonc`
- Remove `@astrojs/cloudflare` and `wrangler` from `package.json`
- Delete `astro-app/public/_headers` (security headers move to nginx config)
- Update `astro-app/src/env.d.ts` if it references Cloudflare runtime types

### Drizzle ORM (PostgreSQL)

```bash
npm install drizzle-orm postgres --workspace=astro-app
npm install -D drizzle-kit --workspace=astro-app
```

Create `astro-app/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Create `astro-app/src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const eventRsvps = pgTable("event_rsvps", {
  id: text("id").primaryKey(),
  eventSanityId: text("event_sanity_id").notNull(),
  sponsorEmail: text("sponsor_email").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailEventIdx: uniqueIndex("email_event_idx").on(table.sponsorEmail, table.eventSanityId),
}));

export const agreementSignatures = pgTable("agreement_signatures", {
  id: text("id").primaryKey(),
  sponsorEmail: text("sponsor_email").notNull(),
  agreementType: text("agreement_type").notNull(),
  agreementVersion: text("agreement_version").notNull(),
  signedAt: timestamp("signed_at").defaultNow(),
  signatureData: jsonb("signature_data"),
});

export const portalActivity = pgTable("portal_activity", {
  id: text("id").primaryKey(),
  sponsorEmail: text("sponsor_email").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Create `astro-app/src/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### Astro Middleware (User Identity from Authentik)

Create `astro-app/src/middleware.ts` to extract the authenticated user from headers injected by Authentik's proxy outpost:

```typescript
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const email = context.request.headers.get("x-authentik-email");
  const groups = context.request.headers.get("x-authentik-groups");
  const username = context.request.headers.get("x-authentik-username");
  const name = context.request.headers.get("x-authentik-name");

  if (email) {
    context.locals.user = {
      email,
      username: username ?? email,
      name: name ?? "",
      groups: groups?.split("|") ?? [],
      isAdmin: groups?.includes("authentik Admins") ?? false,
    };
  }

  return next();
});
```

Update `astro-app/src/env.d.ts`:

```typescript
declare namespace App {
  interface Locals {
    user?: {
      email: string;
      username: string;
      name: string;
      groups: string[];
      isAdmin: boolean;
    };
  }
}
```

Portal pages access the user via `Astro.locals.user`. The Astro server never handles authentication — it receives pre-authenticated requests with user identity in headers set by Authentik's outpost through nginx's `auth_request` module.

---

## 6. Self-Hosted GitHub Actions Runner

The runner lives on the **host** (not in a container) because it needs the Docker CLI to rebuild and redeploy containers.

```bash
# Create a dedicated user with Docker access
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner
sudo loginctl enable-linger github-runner

# Switch to the runner user
sudo su - github-runner

# Download the runner (check GitHub for latest version)
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64.tar.gz

# Configure (get token from GitHub repo Settings → Actions → Runners → New self-hosted runner)
./config.sh --url https://github.com/gsinghjay/astro-shadcn-sanity --token YOUR_TOKEN --labels vps

# Install and start as a service
sudo ./svc.sh install github-runner
sudo ./svc.sh start
```

The runner is the **one exception** to the "everything in Docker" rule — GitHub's runner installer manages its own service. Every other component runs in the Docker Compose stack.

---

## 7. CI/CD Deploy Pipeline

The deploy workflow builds a new Astro Docker image and hot-swaps the container. No file copying — the build output is baked into the image.

### `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [sanity-content-published]

jobs:
  deploy:
    runs-on: [self-hosted, vps]
    steps:
      - uses: actions/checkout@v4

      - name: Copy source to deploy directory
        run: |
          rsync -a --delete \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='studio/' \
            ./ /opt/ywcc/repo/

      - name: Build and deploy Astro container
        working-directory: /opt/ywcc
        run: docker compose up -d --build astro

      - name: Run database migrations
        working-directory: /opt/ywcc
        run: |
          docker compose exec -T astro sh -c \
            'npx drizzle-kit migrate 2>/dev/null || echo "No pending migrations"'

      - name: Verify deployment
        run: |
          sleep 5
          curl -sf http://localhost:4321/ > /dev/null
          echo "Deployment verified"
```

The `Dockerfile.astro` build context needs the source files, so the workflow syncs them to `/opt/ywcc/repo/` and the Dockerfile's `context` would point there. Alternatively, update the Dockerfile context in `docker-compose.yml` to `./repo`.

---

## 8. Sanity Webhook Rebuild

The existing Sanity webhook triggers rebuilds via GitHub `repository_dispatch`. This works unchanged with the VPS setup.

1. Keep the Sanity webhook at `sanity.io/manage` pointing to GitHub's API (as configured today)
2. The `repository_dispatch` event triggers the deploy workflow (Section 7)
3. The self-hosted runner builds and deploys the new Astro container
4. No webhook URL changes needed

---

## 9. Cloudflare DNS Proxy (Optional)

Place Cloudflare's free DNS proxy in front of the VPS for CDN edge caching and DDoS protection at zero cost.

```mermaid
flowchart LR
    V([Visitor]) --> CF["Cloudflare Edge\n(free proxy)"]
    CF -->|Cache miss| VPS["Your VPS\nnginx container :443"]
    CF -->|Cache hit| V

    style CF fill:#f0f8ff,stroke:#4a9eff
    style VPS fill:#f0fff0,stroke:#4a9e4a
```

### Setup Steps

1. Add your domain to Cloudflare (free plan) at `dash.cloudflare.com`
2. Update your domain registrar's nameservers to Cloudflare's assigned nameservers
3. In Cloudflare DNS settings, create an A record pointing to the VPS IP with the **orange cloud (Proxied)** enabled
4. Set SSL/TLS mode to **Full (strict)** — this requires a valid SSL certificate on the VPS (the Let's Encrypt cert from Section 4)

### Cache Rules

| URL Pattern | Cache Setting | Reason |
|------------|--------------|--------|
| `*.js`, `*.css`, `*.woff2` | Cache Everything, Edge TTL 1 year | Astro uses hashed filenames — safe to cache indefinitely |
| `/portal/*` | Bypass Cache | SSR routes return personalized content |
| `/if/*`, `/api/*` | Bypass Cache | Authentik login/API flows |
| `/dev` | Bypass Cache | Admin page |
| Everything else | Standard caching | HTML pages cache at Cloudflare's discretion |

---

## 10. Authentik Configuration

After the stack is running, configure Authentik via its admin UI at `https://your-domain.com/if/admin/`.

### Why Authentik Over Keycloak

| Factor | Keycloak | Authentik |
|--------|----------|-----------|
| RAM usage | 384–700 MB (JVM) | ~330 MB (server + worker) |
| Auth proxy | Requires separate oauth2-proxy | Built-in proxy outpost |
| Container count | 1 (+ oauth2-proxy) | 2 (server + worker) |
| Admin UI | Functional but dated | Modern, polished |
| User self-service | Limited | Enrollment, recovery, profile management |
| Config approach | Admin console only | Admin UI + Blueprints (YAML-as-code) |
| Session store | Database | Redis (faster, lighter) |

### Create the Proxy Provider

1. Navigate to **Applications → Providers → Create**
2. Select **Proxy Provider**
3. Configure:
   - **Name:** `ywcc-portal-proxy`
   - **Authorization flow:** `default-provider-authorization-implicit-consent`
   - **Mode:** Forward auth (single application)
   - **External host:** `https://your-domain.com`

### Create the Application

1. Navigate to **Applications → Applications → Create**
2. Configure:
   - **Name:** `YWCC Portal`
   - **Slug:** `ywcc-portal`
   - **Provider:** `ywcc-portal-proxy` (created above)
   - **Launch URL:** `https://your-domain.com/portal/`

### Create the Outpost

1. Navigate to **Applications → Outposts**
2. The **embedded outpost** is created automatically — verify it lists `ywcc-portal-proxy` in its providers
3. If not, edit the embedded outpost and add the provider

The embedded outpost runs inside the `authentik-server` container — no separate outpost container needed. nginx's `auth_request` subrequest hits the embedded outpost's `/outpost.goauthentik.io/auth/nginx` endpoint.

### Create Groups and Users

1. **Groups** — Navigate to **Directory → Groups → Create**:
   - `sponsors` — portal access
   - `admins` — full portal + dev dashboard access
2. **Users** — Navigate to **Directory → Users → Create** and assign groups
3. **Social login** (optional) — Navigate to **Directory → Federation & Social login** to add Google, GitHub, or other providers

### Branding (Optional)

Customize the login page under **System → Brands** to match the YWCC site design. Authentik supports custom CSS, logos, and flow templates.

---

## 11. Epic 9 Impact Assessment

> **Note (2026-02-27):** All 15 Epic 9 stories are now fully in scope on Cloudflare with the Workers Paid plan ($5/mo). The CF column below reflects the updated paid-plan status. VPS remains a viable alternative with its own advantages.

| Story | CF Paid Plan Status | VPS Status | What Changes (VPS) |
|-------|-------------------|------------|--------------|
| 9.1 — CF Access Config | **IN** (50 seats) | **IN** (no seat limit) | Authentik replaces CF Access |
| 9.2 — Sponsor Project View | **IN** | **IN** (no cap) | Node.js adapter instead of Workers |
| 9.3 — Events & Program Info | **IN** | **IN** (no cap) | Same |
| 9.4 — GitHub Dev Dashboard | **IN** | **IN** (no risk) | Same |
| 9.5 — Site Health CI | **IN** | **IN** | Write to filesystem + PostgreSQL instead of R2/KV |
| 9.6 — Site Health Dashboard | **IN** | **IN** | Read from filesystem + PostgreSQL instead of R2/KV |
| 9.7 — Submission Dashboard | **IN** (full dashboard) | **IN** | GA4 Data API calls have no CPU limit |
| 9.8 — D1 Setup | **IN** (all 6 tables) | **IN** (all tables) | PostgreSQL, no table or row limit |
| 9.9 — Activity Tracking | **IN** (Analytics Engine) | **IN** | PostgreSQL writes have no daily limit |
| 9.10 — Event RSVPs | **IN** | **IN** | Same patterns, PostgreSQL instead of D1 |
| 9.11 — Evaluations | **IN** (paid plan unlocks) | **IN** | JSONB columns simplify score storage |
| 9.12 — Agreement Signatures | **IN** | **IN** | Same |
| 9.13 — Notifications | **IN** (Queues + KV) | **IN** | No per-page query budget |
| 9.14 — Multi-Provider Auth | **IN** (CF dashboard) | **IN** | Authentik federation (Google, GitHub, SAML) |
| 9.15 — Admin Analytics | **IN** (Analytics Engine SQL API) | **IN** | PostgreSQL query planner handles aggregates efficiently |

**Result:** All 15 stories are feasible on both platforms. Zero descoping required.

---

## 12. Security Hardening

### Host Firewall (UFW)

Only Docker-published ports and SSH need to be open on the host:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

If using Cloudflare DNS proxy, restrict HTTP/HTTPS to Cloudflare IP ranges only. For current ranges, see the [Cloudflare IP Ranges page](https://www.cloudflare.com/ips/):

```bash
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp

for ip in 173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 \
          141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 \
          197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 \
          104.24.0.0/14 172.64.0.0/13 131.0.72.0/22; do
    sudo ufw allow from $ip to any port 80,443 proto tcp
done
```

### Docker Network Isolation

The `docker-compose.yml` uses a single `internal` bridge network. Only nginx publishes ports to the host (80, 443). PostgreSQL, Redis, Authentik, and Astro are unreachable from the internet — they communicate exclusively through Docker's internal network.

### Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Docker Image Updates

Periodically pull updated base images and rebuild:

```bash
cd /opt/ywcc
docker compose pull
docker compose up -d --build
```

### Authentik Security

- **Brute force protection** is enabled by default in Authentik's login flows
- **Admin UI access** is controlled through Authentik's own RBAC — only users in the `authentik Admins` group can access `/if/admin/`
- **Session security** — Redis-backed sessions with configurable TTL. Sessions invalidate on password change.
- **Audit log** — Authentik logs all authentication events under **Events → Logs** in the admin UI

---

## 13. Rollback Plan

If the VPS migration encounters issues, restore Cloudflare Pages hosting with minimal disruption.

### Rollback Steps

1. **DNS:** Remove the Cloudflare proxy (set to DNS-only) or point the A record back to Cloudflare Pages' CNAME
2. **Adapter:** Revert `astro.config.mjs` to use `@astrojs/cloudflare` with `output: "static"`
3. **Workflow:** Restore `sanity-deploy.yml` to deploy via `wrangler pages deploy`
4. **Webhook:** Update the Sanity webhook URL to point to the Cloudflare deploy hook

### Keep Cloudflare Pages Project Alive

Do not delete the `ywcc-capstone` Cloudflare Pages project during migration. Keep it as a dormant fallback. The free tier has no cost for idle projects.

---

## 14. Post-Migration Verification

### Docker Stack Health

```bash
# All containers running
docker compose ps

# Check logs for each service
docker compose logs authentik-server | grep -i "ready"
docker compose logs postgres | grep "ready to accept"
docker compose logs astro | tail -5
docker compose logs nginx | tail -5
```

### Functional Checklist

- [ ] `https://your-domain.com` serves the static site with HTTPS
- [ ] All pages render: `/`, `/sponsors`, `/projects`, `/events`, `/contact`
- [ ] Response headers include security headers: `curl -I https://your-domain.com`
- [ ] Authentik admin UI loads: `https://your-domain.com/if/admin/`
- [ ] Proxy provider and application are configured in Authentik
- [ ] Visiting `/portal/` without a session redirects to Authentik login
- [ ] After login, Authentik redirects back to `/portal/`
- [ ] Astro receives `X-authentik-email` header (check with a test endpoint)
- [ ] Group memberships appear in `X-authentik-groups`
- [ ] PostgreSQL accepts queries: `docker compose exec postgres psql -U ywcc -d ywcc -c "SELECT 1;"`
- [ ] Drizzle migrations applied: `docker compose exec astro sh -c 'npx drizzle-kit migrate'`
- [ ] Publishing content in Sanity Studio triggers a rebuild via the deploy workflow
- [ ] New content appears on the live site after rebuild
- [ ] If using Cloudflare DNS proxy: static assets show `cf-cache-status: HIT` on second request
- [ ] `docker stats` shows total memory usage under 1 GB at idle
- [ ] All existing Vitest tests pass
- [ ] All existing Playwright E2E tests pass

---

## 15. File Reference

### Files to Create (on VPS)

| File | Purpose |
|------|---------|
| `/opt/ywcc/docker-compose.yml` | Full stack definition (7 services) |
| `/opt/ywcc/.env` | Secrets and configuration |
| `/opt/ywcc/Dockerfile.astro` | Multi-stage Astro build + run |
| `/opt/ywcc/nginx/default.conf` | nginx reverse proxy + Authentik auth config |
| `/opt/ywcc/certbot/` | Let's Encrypt certificates (auto-managed) |
| `/opt/ywcc/media/` | Authentik media storage |
| `/opt/ywcc/reports/` | Site health reports |

### Files to Modify (in repo)

| File | Change |
|------|--------|
| `astro-app/astro.config.mjs` | Swap adapter from `cloudflare` to `node`, output to `hybrid` |
| `astro-app/package.json` | Add `@astrojs/node`, `drizzle-orm`, `postgres`. Remove `@astrojs/cloudflare`, `wrangler`. Add `start` script. |
| `.github/workflows/deploy.yml` | New workflow: `docker compose up -d --build astro` on self-hosted runner |

### Files to Create (in repo)

| File | Purpose |
|------|---------|
| `astro-app/src/db/schema.ts` | Drizzle ORM schema (PostgreSQL tables) |
| `astro-app/src/db/index.ts` | Database connection setup |
| `astro-app/drizzle.config.ts` | Drizzle Kit migration configuration |
| `astro-app/src/middleware.ts` | Extract `X-authentik-*` headers into `Astro.locals.user` |

### Files to Delete (from repo)

| File | Reason |
|------|--------|
| `astro-app/wrangler.jsonc` | No longer deploying to Cloudflare Workers/Pages |
| `astro-app/public/_headers` | Security headers move to nginx container config |
| `astro-app/src/cloudflare/__tests__/` | Tests for Cloudflare-specific behavior |
| `.github/workflows/sanity-deploy.yml` | Replaced by unified `deploy.yml` |

### Documentation to Update

| Document | Update Needed |
|----------|--------------|
| `docs/cloudflare-guide.md` | Add note about VPS alternative in Section 10 |
| `docs/team/portal-react-islands-guide.md` | Update auth flow from CF Access to Authentik |
| `docs/team/contact-form-pipeline-explained.md` | Update D1 references to PostgreSQL |
| `CLAUDE.md` | Update build/deploy commands, add Docker and PostgreSQL references |
