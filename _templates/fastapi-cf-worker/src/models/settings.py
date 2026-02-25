"""
Typed settings extracted from the Cloudflare Workers env object.

The Workers env is a JS-backed proxy — pydantic-settings (which reads
os.environ) doesn't work. Instead we define a plain Pydantic model and
populate it from the env proxy in the get_settings() dependency.

This model is the SINGLE SOURCE OF TRUTH for which env vars and secrets
the worker expects. The health check, dependencies, and route handlers
all read from here instead of touching the raw env proxy.

Adding a new env var or secret:
  1. Add the field here (with a default if optional)
  2. Map it in get_settings() in dependencies.py
  3. That's it — health check auto-discovers it
"""

from typing import Any
from pydantic import BaseModel, ConfigDict


class WorkerSettings(BaseModel):
    """Validated configuration extracted from Cloudflare Workers env.

    Fields are grouped into three categories:
      - env_vars:  non-sensitive values from wrangler.jsonc `vars`
      - secrets:   sensitive values from `wrangler secret put` / .dev.vars
      - bindings:  Cloudflare service objects (KV, D1, AI) — typed as Any
                   because they're JS proxy objects, not Python types
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # --- Env vars (wrangler.jsonc vars section) ---
    environment: str = "development"

    # --- Secrets (wrangler secret put / .dev.vars) ---
    api_key: str | None = None
    admin_api_key: str | None = None
    sanity_api_read_token: str | None = None
    sanity_api_write_token: str | None = None
    discord_bot_token: str | None = None
    discord_app_id: str | None = None
    discord_public_key: str | None = None
    cf_api_token: str | None = None
    turnstile_secret_key: str | None = None

    # --- Bindings (Cloudflare service objects) ---
    kv: Any = None      # KV namespace
    db: Any = None      # D1 database
    ai: Any = None      # Workers AI

    @property
    def required_secrets(self) -> dict[str, str | None]:
        """Secrets that MUST be set for the worker to function."""
        return {
            "api_key": self.api_key,
            "admin_api_key": self.admin_api_key,
        }

    @property
    def optional_secrets(self) -> dict[str, str | None]:
        """Secrets that are only needed by specific features."""
        return {
            "sanity_api_read_token": self.sanity_api_read_token,
            "sanity_api_write_token": self.sanity_api_write_token,
            "discord_bot_token": self.discord_bot_token,
            "discord_app_id": self.discord_app_id,
            "discord_public_key": self.discord_public_key,
            "cf_api_token": self.cf_api_token,
            "turnstile_secret_key": self.turnstile_secret_key,
        }

    @property
    def env_vars(self) -> dict[str, str]:
        """Non-sensitive env vars (safe to log)."""
        return {
            "environment": self.environment,
        }

    @property
    def bindings(self) -> dict[str, Any]:
        """Cloudflare service bindings."""
        return {
            "kv": self.kv,
            "db": self.db,
            "ai": self.ai,
        }

    @classmethod
    def from_worker_env(cls, env) -> "WorkerSettings":
        """Extract and validate settings from the Workers env proxy.

        Reads each expected attribute from the JS-backed env object.
        Missing attributes become None (the proxy raises AttributeError
        or returns undefined for missing bindings).
        """

        def _get(name: str):
            try:
                val = getattr(env, name, None)
                # Workers env returns JS null/undefined as falsy objects
                if val is None:
                    return None
                s = str(val)
                return s if s.strip() else None
            except BaseException:
                return None

        def _get_binding(name: str):
            try:
                val = getattr(env, name, None)
                return val if val else None
            except BaseException:
                return None

        return cls(
            # Env vars
            environment=_get("ENVIRONMENT") or "development",
            # Secrets
            api_key=_get("API_KEY"),
            admin_api_key=_get("ADMIN_API_KEY"),
            sanity_api_read_token=_get("SANITY_API_READ_TOKEN"),
            sanity_api_write_token=_get("SANITY_API_WRITE_TOKEN"),
            discord_bot_token=_get("DISCORD_BOT_TOKEN"),
            discord_app_id=_get("DISCORD_APP_ID"),
            discord_public_key=_get("DISCORD_PUBLIC_KEY"),
            cf_api_token=_get("CF_API_TOKEN"),
            turnstile_secret_key=_get("TURNSTILE_SECRET_KEY"),
            # Bindings
            kv=_get_binding("KV"),
            db=_get_binding("DB"),
            ai=_get_binding("AI"),
        )
