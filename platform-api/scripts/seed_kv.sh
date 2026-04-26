#!/usr/bin/env bash
# ============================================================
# Seed KV namespace with initial config values.
#
# Usage:
#   bash scripts/seed_kv.sh              # Preview (local dev) namespace
#   bash scripts/seed_kv.sh --production # Production namespace
#
# Prerequisites:
#   - npx wrangler must be installed and authenticated
#   - KV namespace must exist (create with: npx wrangler kv namespace create "KV")
#   - Update KV_NAMESPACE_ID below with your actual namespace ID
# ============================================================

set -euo pipefail

# --- Configuration ---
KV_NAMESPACE_ID="<your-kv-namespace-id>"  # From wrangler.jsonc kv_namespaces[0].id
ENVIRONMENT=""

if [[ "${1:-}" == "--production" ]]; then
    echo ">>> Seeding PRODUCTION KV namespace"
    ENVIRONMENT="--env production"
else
    echo ">>> Seeding PREVIEW KV namespace (local dev)"
    ENVIRONMENT="--preview"
fi

# Build args array to avoid word-splitting issues with ENVIRONMENT
ARGS=(--namespace-id="$KV_NAMESPACE_ID")
if [[ -n "$ENVIRONMENT" ]]; then
    # Append environment tokens as distinct, quoted array elements
    if [[ "$ENVIRONMENT" == "--preview" ]]; then
        ARGS+=(--preview)
    else
        ARGS+=(--env "production")
    fi
fi

# --- Seed values ---
echo "Setting config:version..."
npx wrangler kv key put "${ARGS[@]}" \
    "config:version" '"1.0.0"'

echo "Setting config:features..."
npx wrangler kv key put "${ARGS[@]}" \
    "config:features" '{"notifications": true, "maintenance_mode": false}'

# Example: webhook mapping for Discord notifications
echo "Setting webhooks:general..."
npx wrangler kv key put "${ARGS[@]}" \
    "webhooks:general" '"https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"'

# Discord webhook channels - only write if environment variables are set
if [[ -n "${DISCORD_WEBHOOK_ANNOUNCEMENTS:-}" ]]; then
    echo "Setting discord-webhook:announcements..."
    npx wrangler kv key put "${ARGS[@]}" \
        "discord-webhook:announcements" "\"$DISCORD_WEBHOOK_ANNOUNCEMENTS\""
fi

if [[ -n "${DISCORD_WEBHOOK_BOT_AUDIT:-}" ]]; then
    echo "Setting discord-webhook:bot-audit..."
    npx wrangler kv key put "${ARGS[@]}" \
        "discord-webhook:bot-audit" "\"$DISCORD_WEBHOOK_BOT_AUDIT\""
fi

if [[ -n "${DISCORD_WEBHOOK_EVENTS:-}" ]]; then
    echo "Setting discord-webhook:events..."
    npx wrangler kv key put "${ARGS[@]}" \
        "discord-webhook:events" "\"$DISCORD_WEBHOOK_EVENTS\""
fi

if [[ -n "${DISCORD_WEBHOOK_FORM_SUBMISSIONS:-}" ]]; then
    echo "Setting discord-webhook:form-submissions..."
    npx wrangler kv key put "${ARGS[@]}" \
        "discord-webhook:form-submissions" "\"$DISCORD_WEBHOOK_FORM_SUBMISSIONS\""
fi

echo ""
echo ">>> KV seeding complete!"
echo ">>> Verify with: npx wrangler kv key get --namespace-id=$KV_NAMESPACE_ID $ENVIRONMENT \"config:version\""
