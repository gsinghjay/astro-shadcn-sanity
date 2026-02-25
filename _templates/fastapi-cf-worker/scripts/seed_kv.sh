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

# --- Seed values ---
echo "Setting config:version..."
npx wrangler kv key put --namespace-id="$KV_NAMESPACE_ID" $ENVIRONMENT \
    "config:version" '"1.0.0"'

echo "Setting config:features..."
npx wrangler kv key put --namespace-id="$KV_NAMESPACE_ID" $ENVIRONMENT \
    "config:features" '{"notifications": true, "maintenance_mode": false}'

# Example: webhook mapping for Discord notifications
echo "Setting webhooks:general..."
npx wrangler kv key put --namespace-id="$KV_NAMESPACE_ID" $ENVIRONMENT \
    "webhooks:general" '"https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"'

echo ""
echo ">>> KV seeding complete!"
echo ">>> Verify with: npx wrangler kv key get --namespace-id=$KV_NAMESPACE_ID $ENVIRONMENT \"config:version\""
