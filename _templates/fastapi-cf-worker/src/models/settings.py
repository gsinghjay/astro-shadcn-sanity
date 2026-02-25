"""Typed settings extracted from the Cloudflare Workers ``env`` object.

In a normal Python app, you'd use ``os.environ`` or ``pydantic-settings``
to read configuration. In Cloudflare Workers, that doesn't work because:

- The runtime is **Pyodide** (Python compiled to WebAssembly), not a
  regular OS process — there is no real ``os.environ``.
- Configuration comes from a **JavaScript proxy object** called ``env``
  that the Workers runtime provides at request time.
- ``env`` contains three types of values:

  1. **Env vars** — non-sensitive values set in ``wrangler.jsonc`` under
     ``vars`` (e.g., ``ENVIRONMENT=development``). Visible in the
     Cloudflare dashboard.
  2. **Secrets** — sensitive values set via ``npx wrangler secret put``
     or ``.dev.vars`` for local dev. Encrypted at rest, never visible
     in the dashboard.
  3. **Bindings** — JavaScript proxy objects that connect to Cloudflare
     services (KV, D1, AI). You declare them in ``wrangler.jsonc`` and
     the runtime provides live handles at ``env.KV``, ``env.DB``, etc.

This module defines ``WorkerSettings`` — a Pydantic model that is the
**single source of truth** for all configuration the Worker expects.
The health check, dependencies, and route handlers all read from this
model instead of touching the raw ``env`` proxy directly.

Adding a new env var or secret:
    1. Add a typed field to ``WorkerSettings`` (with a default if optional).
    2. Map it in ``from_worker_env()`` below.
    3. Categorize it in the appropriate property (``required_secrets``,
       ``optional_secrets``, ``env_vars``, or ``bindings``).
    4. Add it to ``.dev.vars.example`` with a placeholder value.
    5. That's it — the health endpoint auto-discovers it.
"""

from typing import Any
from pydantic import BaseModel, ConfigDict


class WorkerSettings(BaseModel):
    """Validated configuration extracted from the Cloudflare Workers env proxy.

    Fields are organized into three groups that mirror how Cloudflare
    delivers configuration:

    Env vars:
        Non-sensitive values from ``wrangler.jsonc`` ``vars`` section.
        Safe to log or expose in responses.

    Secrets:
        Sensitive values (API keys, tokens) set via
        ``npx wrangler secret put`` (production) or ``.dev.vars`` (local).
        Never log these values — the health check only reports whether
        they are configured, not what they contain.

    Bindings:
        Cloudflare service proxy objects (KV, D1, Workers AI). These are
        JavaScript objects accessed through Pyodide's foreign function
        interface. They're typed as ``Any`` because no Python type stubs
        exist for the JS proxy protocol. Use them with ``await``:
        ``await settings.kv.get("key")``,
        ``await settings.db.prepare("SELECT 1").all()``.

    Attributes:
        model_config: Allows ``Any``-typed binding fields (JS proxy objects
            are not standard Python types, so Pydantic needs
            ``arbitrary_types_allowed=True``).
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
    kv: Any = None      # KV namespace — key-value store (< 25 MiB per value)
    db: Any = None      # D1 database — serverless SQLite at the edge
    ai: Any = None      # Workers AI — run ML models on Cloudflare GPUs

    @property
    def required_secrets(self) -> dict[str, str | None]:
        """Secrets that MUST be set for the Worker to function.

        The health check uses this to determine ``"degraded"`` status when
        any required secret is missing. Add secrets here that every route
        depends on (e.g., API authentication keys).

        Returns:
            A dict mapping secret names to their current values (or None).
        """
        return {
            "api_key": self.api_key,
            "admin_api_key": self.admin_api_key,
        }

    @property
    def optional_secrets(self) -> dict[str, str | None]:
        """Secrets needed only by specific features.

        The health check reports how many of these are configured but does
        NOT flag missing ones as errors — they're optional by definition.
        Each fork of this template will use a different subset.

        Returns:
            A dict mapping secret names to their current values (or None).
        """
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
        """Non-sensitive environment variables (safe to log).

        These come from the ``vars`` section of ``wrangler.jsonc`` and are
        visible in the Cloudflare dashboard.

        Returns:
            A dict mapping var names to their current values.
        """
        return {
            "environment": self.environment,
        }

    @property
    def bindings(self) -> dict[str, Any]:
        """Cloudflare service bindings (KV, D1, AI).

        Each binding is a JavaScript proxy object or None if not configured
        in ``wrangler.jsonc``.

        Returns:
            A dict mapping binding names to their proxy objects (or None).
        """
        return {
            "kv": self.kv,
            "db": self.db,
            "ai": self.ai,
        }

    @classmethod
    def from_worker_env(cls, env) -> "WorkerSettings":
        """Create a validated settings instance from the Workers env proxy.

        The ``env`` object is a JavaScript proxy provided by the Cloudflare
        runtime. Each binding, secret, and env var is an attribute on this
        proxy (e.g., ``env.API_KEY``, ``env.KV``, ``env.ENVIRONMENT``).

        This method reads each expected attribute safely — missing attributes
        return None rather than raising errors, since not every deployment
        will have every binding configured.

        Args:
            env: The raw Cloudflare Workers env proxy (JavaScript object).
                Comes from ``request.scope["env"]`` in FastAPI routes or
                ``self.env`` in the ``WorkerEntrypoint`` class.

        Returns:
            A new ``WorkerSettings`` instance with all fields populated
            from the env proxy (or defaults where values are missing).
        """

        def _get(name: str):
            """Read a string value (secret or env var) from the JS env proxy.

            Handles the quirks of the Pyodide JS bridge:
            - ``getattr`` returns None for missing attributes.
            - JS null/undefined appear as falsy Python objects.
            - We convert to ``str`` and strip whitespace.
            - ``except BaseException`` is intentional — some JS bridge
              errors don't inherit from Python's ``Exception`` class.
            """
            try:
                val = getattr(env, name, None)
                if val is None:
                    return None
                s = str(val)
                return s if s.strip() else None
            except BaseException:
                return None

        def _get_binding(name: str):
            """Read a binding (KV, D1, AI) from the JS env proxy.

            Unlike secrets/vars, bindings are JavaScript proxy objects that
            should be passed through as-is (not converted to strings).
            We use ``is not None`` instead of truthiness because a valid
            JS proxy object may have unexpected truthiness behavior in
            Python.
            """
            try:
                val = getattr(env, name, None)
                return val if val is not None else None
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
