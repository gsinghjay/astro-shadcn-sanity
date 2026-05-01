#!/usr/bin/env bash
# Bundle-scrub guard — runs after `sanity build`. Fails the build if a Sanity
# API token (or any reference to the retired admin-token env var) made it into
# the static JS chunks. Studio's Vite-style env convention inlines every
# SANITY_STUDIO_* variable into the client bundle, so storing a server-only
# secret in a SANITY_STUDIO_* var leaks it to anyone who fetches the bundle.
#
# Story 24.1 retired the legacy admin-token bearer; this script enforces the
# invariant going forward. Add new forbidden patterns to FORBIDDEN_PATTERNS as
# the threat model expands (e.g. additional API-token prefixes).

set -euo pipefail

# Sanity v3 emits chunks under `dist/static/` plus vendor `.mjs` files under
# `dist/vendor/<pkg>/`. Scan the whole `dist/` tree to catch both. Verified
# 2026-05-01: `dist/static/` has only `.js`; `dist/vendor/` has only `.mjs`.
DIST_DIR="${DIST_DIR:-$(cd "$(dirname "$0")/.." && pwd)/dist}"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "[check-no-secrets] no dist directory at $DIST_DIR — did sanity build run?" >&2
  exit 1
fi

# Reject empty/incomplete builds: a `sanity build` that crashes after creating
# `dist/` but before emitting any JS chunks would otherwise pass scrub silently.
script_count=$(find "$DIST_DIR" \
    \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \
       -o -name '*.html' -o -name '*.json' \) \
    -not -name '*.map' \
    -type f 2>/dev/null | wc -l)
if [[ "$script_count" -eq 0 ]]; then
  echo "[check-no-secrets] no script artifacts found in $DIST_DIR — refusing to vouch for an empty build." >&2
  exit 1
fi

# Patterns that must not appear in any shipped JS chunk.
# - sat_<32+ url-safe-base64>: Sanity API token literal. The documented
#   generation recipe (`openssl rand -base64 32 | tr '/+' '_-' | tr -d '='`)
#   produces tokens whose body is `[A-Za-z0-9_-]+`, so the alphabet must
#   include `_` and `-` or ~64 % of real tokens slip through.
# - SANITY_STUDIO_ADMIN_TOKEN: the retired env-var name; if it reappears in
#   the bundle, someone re-introduced the foot-gun.
# - STUDIO_ADMIN_TOKEN (without the SANITY_STUDIO_ prefix): the matching
#   server-side var name; should never be referenced from Studio code.
FORBIDDEN_PATTERNS=(
  'sat_[A-Za-z0-9_-]{32,}'
  'SANITY_STUDIO_ADMIN_TOKEN'
  'STUDIO_ADMIN_TOKEN'
)

found_any=0
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Scan every shipped script artifact under `dist/`: `.js` (static chunks),
  # `.mjs` / `.cjs` (vendor + future code-split formats), `.html` / `.json`
  # (rare but possible inline embedding). Exclude `.map` source maps — Sanity
  # v3 doesn't emit them today, but if it ever does, source maps would carry
  # the original variable names and would themselves be reachable, so this
  # `--exclude` is the only knob we'd need to flip if/when that changes.
  if matches=$(grep -rE \
      --include='*.js' --include='*.mjs' --include='*.cjs' \
      --include='*.html' --include='*.json' \
      --exclude='*.map' \
      "$pattern" "$DIST_DIR" 2>/dev/null); then
    echo "[check-no-secrets] FORBIDDEN PATTERN found in studio bundle:" >&2
    echo "  pattern: $pattern" >&2
    echo "$matches" | head -10 >&2
    found_any=1
  fi
done

if [[ $found_any -ne 0 ]]; then
  echo "" >&2
  echo "[check-no-secrets] Bundle scrub failed — refusing to ship secrets." >&2
  echo "  Studio's Vite convention inlines SANITY_STUDIO_* env vars into the client bundle." >&2
  echo "  Move the offending secret to a server-side env var and re-authorize via" >&2
  echo "  the Studio user's session (see SponsorAcceptancesTool / Story 24.1 pattern)." >&2
  exit 2
fi

echo "[check-no-secrets] OK — no forbidden patterns found in $DIST_DIR"
