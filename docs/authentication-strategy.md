---
title: "Authentication Strategy: Why We Use Two Systems"
description: "Explains why the project uses both Cloudflare Access and Better Auth, what each does, and why consolidating would cost more than it saves."
date: 2026-03-01
---

# Authentication Strategy: Why We Use Two Systems

The YWCC Capstone Portal uses two authentication systems — Cloudflare Access for sponsors and Better Auth for students. This page covers how they work, why each is the right tool for its job, and why keeping both is the correct call for a $0/month Cloudflare deployment.

## Who Uses the Portal

The site serves two distinct groups with very different needs:

| Group | Size | How they log in | What they access |
|:------|:-----|:----------------|:-----------------|
| **Sponsors** | ~20 (stable, known individuals) | Email OTP or Google via a Cloudflare login screen | `/portal/*` dashboard pages |
| **Students** | ~400/semester (open, rotating population) | Google sign-in (`@njit.edu` accounts) | `/student/*` pages |

These groups differ in population size, turnover rate, and trust model. No single auth system serves both without compromise.

## What Each System Does

### Cloudflare Access (sponsors)

Cloudflare Access is a security gate built into Cloudflare's network. It sits *between* the visitor and the server. When a sponsor visits `/portal/`, Cloudflare itself blocks the request and shows a login screen before the request ever reaches our code.

```text
Sponsor visits /portal/dashboard
        │
        ▼
┌──────────────────────────┐
│   Cloudflare Edge (CDN)  │
│                          │
│   Is this request to     │
│   /portal/* ?            │
│     YES → Show CF login  │◄── Auth happens HERE,
│     screen (OTP/Google)  │    at Cloudflare's edge,
│                          │    before our server
│   Identity verified?     │    runs any code
│     YES → Forward with   │
│     JWT header attached  │
│     NO  → Block request  │
└──────────┬───────────────┘
           │ (authenticated requests only)
           ▼
┌──────────────────────────┐
│   Our Astro Server       │
│                          │
│   Middleware reads JWT   │
│   header (defense check) │
│   Renders portal page    │
└──────────────────────────┘
```

**Key idea:** Our server never sees unauthenticated sponsor requests. Cloudflare handles the hard security work. Our code just reads a verified identity from a header.

### Better Auth + D1 (students)

Better Auth is an authentication library that runs inside our Astro application. When a student visits `/student/`, our code handles the entire login flow: redirecting to Google, receiving the callback, creating a user record in our D1 database, and setting a session cookie.

```text
Student visits /student/projects
        │
        ▼
┌──────────────────────────┐
│   Cloudflare Edge (CDN)  │
│                          │
│   Is this request to     │
│   /portal/* ?             │
│     NO → Forward as-is   │◄── No edge gate for
└──────────┬───────────────┘    student routes
           │
           ▼
┌──────────────────────────┐
│   Our Astro Server       │
│                          │
│   Middleware checks for  │
│   session cookie         │
│     Found + valid?       │
│       → Render page      │
│     Missing or expired?  │
│       → Redirect to      │
│         Google sign-in   │◄── Auth happens HERE,
│       → Google callback  │    inside our code,
│       → Create user in   │    using our database
│         D1 database      │
│       → Set session      │
│         cookie           │
│       → Redirect back    │
└──────────────────────────┘
```

**Key idea:** Our server does all the authentication work. We control the login flow, store user data, and manage sessions in our own database.

## Why Not Pick One?

### Why not use Cloudflare Access for everyone?

Cloudflare Access has a **hard limit of 50 seats** on the free plan. A "seat" is any unique user who authenticates in a given month.

- 20 sponsors fit comfortably (with room for growth)
- 400 students do not fit at all
- Exceeding 50 seats requires the paid Zero Trust plan

There is no workaround. You cannot batch users, share seats, or bypass the limit. Cloudflare Access is designed for small, stable teams — not open student populations.

### Why not use Better Auth for everyone?

Better Auth *could* handle sponsors. The spike validated that it runs correctly on Cloudflare Workers. But moving sponsors away from Cloudflare Access trades a real security benefit for a marginal simplicity gain.

**What Cloudflare Access provides that Better Auth cannot:**

- **Edge-level blocking.** Unauthenticated requests to `/portal/*` are stopped at the CDN before consuming any Worker CPU. With Better Auth, every unauthenticated request to a protected route hits our server, burns CPU cycles, and counts against the free plan's 100K requests/day limit.

- **Zero code surface for sponsor auth.** Cloudflare Access has no code in our codebase to maintain, patch, or accidentally break. The login screen, email verification, session management, and token signing are all Cloudflare infrastructure. With Better Auth, we own that entire surface — including its security bugs.

- **Defense-in-depth architecture.** The current setup has two independent layers: Cloudflare Access blocks at the edge, then our middleware re-validates the JWT in code. An attacker who bypasses one layer still faces the other. Consolidating to one system removes a security layer.

The operational simplicity of "one auth system" is real, but it is not worth what you give up. Sponsors access sensitive data (project evaluations, agreements, financial commitments). Edge-level blocking is the strongest protection available at $0/month.

## How They Coexist

Both systems converge on the same result: a `user` object in `Astro.locals` that the rest of the application uses without caring which system authenticated the request.

```text
┌─────────────────────────────────────────────────┐
│                Astro Middleware                  │
│                                                 │
│   Route starts with /portal/* ?                 │
│     → Read CF-Access-JWT header                 │
│     → Validate signature (jose library)         │
│     → Set locals.user = { email, role: sponsor }│
│                                                 │
│   Route starts with /student/* ?                │
│     → Read session cookie                       │
│     → Validate against D1 (Better Auth)         │
│     → Set locals.user = { email, role: student }│
│                                                 │
│   Any other route?                              │
│     → No auth needed (public page)              │
│                                                 │
└─────────────────────────────────────────────────┘
                      │
                      ▼
           Page renders using locals.user
           (same API regardless of auth method)
```

Downstream pages and components never interact with Cloudflare Access or Better Auth directly. They receive `locals.user` and render accordingly. The middleware is the only place where the two systems exist side by side, and it is a short `if/else` branch.

## Free Plan Budget

Both systems fit within the $0/month Cloudflare free tier:

| Resource | Free Limit | Sponsor Usage (CF Access) | Student Usage (Better Auth) | Total | Headroom |
|:---------|:-----------|:--------------------------|:----------------------------|:------|:---------|
| CF Access seats | 50/month | ~20 | 0 (not using Access) | ~20 | 2.5x |
| Worker requests | 100K/day | ~200 (portal page loads) | ~2K (student page loads) | ~2.2K | 45x |
| D1 reads | 5M/day | 0 (no DB for sponsors) | ~200 (session lookups) | ~200 | 25,000x |
| D1 writes | 100K/day | 0 | ~50 (logins, sessions) | ~50 | 2,000x |
| CPU per request | 10ms | 0 (auth at edge) | ~3-5ms (session validation) | ~5ms | 2x |

Neither system pushes any limit. The headroom across every metric is substantial.

## When This Decision Gets Revisited

This architecture stays correct as long as:

- Sponsor count stays under 50
- Student count stays under the D1 free tier limits (~5M reads/day)
- The project stays on Cloudflare's free plan

If any of these change:

| Trigger | Action |
|:--------|:-------|
| Sponsors exceed 50 | Move sponsors to Better Auth (consolidate to one system) or upgrade to paid Zero Trust |
| Student count exceeds D1 free tier | Upgrade to Workers Paid plan ($5/month) — no architecture change needed |
| Project moves to VPS | Replace CF Access with Authentik, replace D1 with PostgreSQL — both auth systems change, but the middleware pattern stays the same |

The VPS migration path is documented separately in [VPS migration plan](vps-migration-plan.md). The middleware `if/else` pattern works identically regardless of which providers sit behind it.

## Summary

Two user groups with different sizes, turnover rates, and security requirements call for two authentication systems — each chosen because it is the best fit for its specific job.

| Attribute | Sponsors (CF Access) | Students (Better Auth) |
|:----------|:---------------------|:-----------------------|
| **Population** | ~20 stable, known individuals | ~400/semester, rotating |
| **Seat limit** | 50 (comfortable fit) | Unlimited within D1 free tier |
| **Where auth runs** | Cloudflare edge (before our code) | Inside our Astro server |
| **Code we maintain** | JWT header validation only | Full OAuth flow + session management |
| **CPU cost per request** | 0ms (handled at edge) | ~3-5ms |
| **Security posture** | "Not our code" infrastructure | Application-level (Better Auth library) |

The hybrid approach is not accidental complexity. It is the architecture that serves both groups well, stays within $0/month, and provides the strongest security posture available at this price point.
