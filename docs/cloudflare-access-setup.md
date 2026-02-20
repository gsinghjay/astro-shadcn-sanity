---
title: "Cloudflare Access Setup — Sponsor Portal Authentication"
date: 2026-02-19
status: active
---

# Cloudflare Access Setup — Sponsor Portal Authentication

> **Last updated:** 2026-02-19
> **Story:** 9.1 — Cloudflare Access Configuration

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Access Application Setup](#2-access-application-setup)
3. [Identity Providers](#3-identity-providers)
4. [Email Allow Policy](#4-email-allow-policy)
5. [Add Sponsor Access](#5-add-sponsor-access)
6. [Remove Sponsor Access](#6-remove-sponsor-access)
7. [Logging Out / Switching Accounts](#7-logging-out--switching-accounts)
8. [Environment Variables](#8-environment-variables)
9. [How JWT Validation Works](#9-how-jwt-validation-works)
10. [Troubleshooting](#10-troubleshooting)
11. [Free Tier Limits](#11-free-tier-limits)
12. [VPS + Authentik Migration Path](#12-vps--authentik-migration-path)

---

## 1. Architecture Overview

Cloudflare Access sits at the edge. Unauthenticated requests to `/portal/*` never reach the Astro Worker.

```
Browser → Cloudflare Edge (Access enforces auth)
  → CF login page (OTP) → email verified
  → Request forwarded with Cf-Access-Jwt-Assertion header
  → Cloudflare Pages Worker (Astro SSR route)
  → middleware.ts intercepts /portal* requests
  → lib/auth.ts validates JWT signature (defense-in-depth)
  → Sets Astro.locals.user = { email }
  → Portal page renders (reads locals.user — no auth logic)
```

**Key point:** `lib/auth.ts` JWT validation is defense-in-depth. CF Access is the primary auth gate. The middleware catches misconfiguration or bypass attempts.

---

## 2. Access Application Setup

These steps are performed in the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com).

1. Navigate to **Access → Applications**
2. Click **Add an application** → select **Self-hosted**
3. Configure:
   - **Application name:** `YWCC Capstone Sponsor Portal`
   - **Session duration:** 24 hours (recommended for sponsor convenience)
   - **Public hostname:** Select your project domain (custom domain or `*.pages.dev`)
   - **Path:** `/portal/`
4. **Important:** Create a second rule for exact path `/portal` — the wildcard `/portal/*` does **not** match `/portal` alone
5. Record the **Application Audience (AUD) tag** — needed for JWT verification (see [Environment Variables](#7-environment-variables))
6. Verify non-portal routes (`/`, `/sponsors`, `/projects`, `/about`, `/contact`) remain publicly accessible — no auth prompt

### Path Wildcard Rules

- `/portal/*` protects all subpaths under `/portal/` but **not** `/portal` itself
- To protect both, create two rules: `/portal` (exact) and `/portal/*`
- Only one wildcard per path segment
- Query strings, ports, and anchors are stripped from path matching

---

## 3. Identity Providers

Two login methods are configured: **One-Time PIN** (internal/fallback) and **Google** (external sponsors).

### One-Time PIN (OTP)

1. Navigate to **Cloudflare One → Settings → Authentication → Login methods**
2. Click **Add new** → select **One-time PIN**
3. Save — no client ID or secret needed (OTP is a built-in Cloudflare IdP)

### Google Login (External Sponsors)

Google login lets sponsors authenticate with their existing Google accounts — no OTP email needed.

**Google Cloud Console setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a project
2. Navigate to **APIs & Services → OAuth consent screen**
3. Set User Type to **External**, fill in app name and support email
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Add authorized JavaScript origin: `https://ywcc-capstone-pages.cloudflareaccess.com`
7. Add authorized redirect URI: `https://ywcc-capstone-pages.cloudflareaccess.com/cdn-cgi/access/callback`
8. Copy the **Client ID** and **Client Secret**

**Cloudflare Zero Trust setup:**

1. Navigate to **Cloudflare One → Settings → Authentication → Login methods**
2. Click **Add new** → select **Google**
3. Enter the **Client ID** (as "App ID") and **Client Secret**
4. Save

Sponsors now see both "Google" and "One-time PIN" on the login page. Google is the primary method for external sponsors; OTP serves as a fallback for users without Google accounts.

> **Reference:** [Cloudflare Docs — Identity Provider Integration](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/)

---

## 4. Email Allow Policy

1. In the Access Application, add an **Allow** policy
2. Add **Include** rules for allowed emails:
   - **Individual emails:** Use "Emails" selector → `sponsor@company.com`
   - **Domain patterns:** Use "Emails ending in" selector → `@njit.edu`
3. For multiple domains, use **separate Include rules** (OR logic)

> **Warning:** NEVER put multiple domains in a single "Require" rule. Require uses AND logic — a user can't have an email ending in both `@njit.edu` AND `@company.com`, so everyone gets locked out.

---

## 5. Add Sponsor Access

To grant a new sponsor portal access:

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com) → **Access → Applications**
2. Click on **YWCC Capstone Sponsor Portal**
3. Open the **Allow** policy
4. Add a new **Include** rule:
   - **For an individual:** Select "Emails" → enter `sponsor@company.com`
   - **For an entire organization:** Select "Emails ending in" → enter `@company.com`
5. Save the policy

The sponsor can now visit `/portal/` and authenticate via email OTP. No account creation needed — CF Access handles it.

---

## 6. Remove Sponsor Access

1. Go to **Access → Applications → YWCC Capstone Sponsor Portal**
2. Open the **Allow** policy
3. Find the email or domain pattern to remove
4. Delete the Include rule
5. Save the policy

The sponsor's existing session remains valid until it expires (24 hours by default). To force immediate revocation:

1. Go to **Access → Applications → YWCC Capstone Sponsor Portal**
2. Navigate to **Overview → Active sessions**
3. Revoke the specific user's session

---

## 7. Logging Out / Switching Accounts

To log out of a CF Access session (e.g., to switch to a different email):

```
https://ywcc-capstone-pages.cloudflareaccess.com/cdn-cgi/access/logout
```

This clears the session cookie. The next visit to `/portal/` will show the login page again.

---

## 8. Environment Variables

Two environment variables are required for JWT validation:

| Variable | Description | Example |
|----------|-------------|---------|
| `CF_ACCESS_TEAM_DOMAIN` | Your Cloudflare Access team domain | `https://ywcc-capstone-pages.cloudflareaccess.com` |
| `CF_ACCESS_AUD` | Application Audience tag from CF dashboard | (64-char hex string from Task 1 step 5) |

### Where to set them

- **Local development:** `astro-app/.env`
- **Cloudflare Pages production:** Wrangler secrets or CF Pages dashboard → Environment variables
- **Wrangler config:** `astro-app/wrangler.jsonc` `vars` section (non-secret values only)

```bash
# Set the AUD as a secret (don't commit to wrangler.jsonc)
npx wrangler pages secret put CF_ACCESS_AUD
```

---

## 9. How JWT Validation Works

`astro-app/src/lib/auth.ts` implements defense-in-depth JWT validation:

1. Reads the `Cf-Access-Jwt-Assertion` header from the request
2. Fetches Cloudflare's public keys from `{team-domain}/cdn-cgi/access/certs`
3. Verifies the JWT signature using `jose` library's `createRemoteJWKSet`
4. Validates `iss` (team domain) and `aud` (application AUD tag)
5. Extracts the `email` claim from the verified payload

### Key rotation

Cloudflare rotates signing keys every **6 weeks**. The previous key remains valid for 7 days after rotation. The `jose` library's `createRemoteJWKSet` handles this automatically via `kid` (key ID) matching — no manual intervention needed.

---

## 10. Troubleshooting

### OTP email not received

- Check spam/junk folder
- Allowlist `noreply@notify.cloudflare.com` in the email provider
- Verify the email address is spelled correctly
- Try again — OTP emails are rate-limited (wait 60 seconds between attempts)

### "Access denied" after entering OTP

- The email is not in the Allow policy → add it (see [Add Sponsor Access](#5-add-sponsor-access))
- Note: Cloudflare always shows "A code has been emailed" regardless of whether the email is allowed — this prevents email enumeration

### JWT validation failing (401 from middleware)

- Verify `CF_ACCESS_TEAM_DOMAIN` matches your team domain exactly (include `https://`)
- Verify `CF_ACCESS_AUD` matches the Application Audience tag in the CF dashboard
- Check that the env vars are available at runtime (not just build time)
- If keys were recently rotated, wait a few minutes for JWK cache to refresh

### Portal routes not protected

- Confirm the Access Application has paths `/portal` and `/portal/*`
- Confirm the application is enabled (not paused)
- Check that the domain/subdomain matches your deployment URL

### Public routes showing auth prompt

- Verify the Access Application path is `/portal/` (not `/`)
- Check for other Access Applications that might have broader path rules

---

## 11. Free Tier Limits

Cloudflare Zero Trust free tier:

| Resource | Limit |
|----------|-------|
| Users (seats) | **50** |
| Access Applications | Unlimited |
| Identity providers | Unlimited |
| Policy rules | Unlimited |

Monitor seat usage at **Cloudflare One → Settings → Account → Usage**. A "seat" is consumed when a user authenticates. Seats are released after 30 days of inactivity.

For programs with more than 50 sponsors, consider the [VPS + Authentik migration path](#11-vps--authentik-migration-path).

---

## 12. VPS + Authentik Migration Path

A full VPS migration plan exists at [`docs/vps-migration-plan.md`](vps-migration-plan.md). This section summarizes the auth-relevant differences.

### Why migrate

- **No seat limit:** Authentik has no user cap (CF Access free tier caps at 50)
- **Full Node.js runtime:** No 10ms CPU cap — JWT validation, GROQ queries, and DB access run without constraint
- **PostgreSQL:** No daily row read/write limits (D1 free tier is capped)
- **All Epic 9 stories feasible:** 5 stories are descoped or deferred under CF free tier; all 15 are feasible on VPS

### Architecture comparison

| Factor | Cloudflare Pages (Free) | VPS + Docker + Authentik |
|--------|------------------------|-----------------------------|
| **Cost** | $0 (CF Pages free tier) | ~$6/month (existing VPS) |
| **Auth** | CF Access (50 seats, OTP) | Authentik (no seat limit, OTP + social + SAML) |
| **Auth mechanism** | Edge-enforced JWT in `Cf-Access-Jwt-Assertion` | nginx `auth_request` → Authentik outpost → `X-authentik-*` headers |
| **Middleware** | `lib/auth.ts` validates CF JWT | Reads `X-authentik-email` header (no JWT needed — Authentik validates upstream) |
| **SSR runtime** | Workers (10ms CPU cap) | Node.js standalone (no limit) |
| **Database** | D1 (5M reads/day, 100K writes/day) | PostgreSQL (unlimited) |
| **Deployment** | Cloudflare Pages CI/CD | Self-hosted GitHub Actions runner → `docker compose up -d --build` |
| **CDN** | Built-in edge network | Cloudflare free DNS proxy (optional) |

### What changes in code

When migrating to Authentik, the auth layer simplifies:

1. **`astro.config.mjs`:** Swap `@astrojs/cloudflare` → `@astrojs/node` with `output: "hybrid"`
2. **`middleware.ts`:** Replace JWT validation with header extraction:
   ```typescript
   // After migration: Authentik sets headers via nginx auth_request
   const email = context.request.headers.get("x-authentik-email");
   if (email) {
     context.locals.user = { email };
   }
   ```
3. **`lib/auth.ts`:** Can be removed — Authentik handles validation before requests reach Astro
4. **`wrangler.jsonc`:** Deleted — no longer deploying to CF Workers
5. **`env.d.ts`:** `App.Locals` gains additional fields (`username`, `name`, `groups`, `isAdmin`)

### Recommendation

Start with CF Access (this story) — it's zero-cost and gets the portal functional. When the program exceeds 50 sponsors or needs features from the descoped stories (activity tracking, evaluations, analytics), execute the VPS migration. The CF Access config translates directly to Authentik — both use the same `/portal/*` path-based protection pattern, just with different auth headers.

See [`docs/vps-migration-plan.md`](vps-migration-plan.md) for the complete migration plan including Docker Compose stack, nginx config, Authentik setup, CI/CD pipeline, and rollback procedure.
