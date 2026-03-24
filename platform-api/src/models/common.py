"""Shared Pydantic models for consistent API response shapes.

Every Worker in this project returns the same response structures, which
means consumers (frontends, other Workers, monitoring tools) can rely on
a predictable JSON format.

These models serve double duty:
    1. **Runtime validation** — FastAPI uses them to serialize responses
       and validate request bodies automatically.
    2. **OpenAPI documentation** — FastAPI generates Swagger UI (``/docs``)
       and ReDoc (``/redoc``) from these models, including the
       ``json_schema_extra`` examples defined below.
"""

from typing import Generic, Literal, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ErrorResponse(BaseModel):
    """Standard error response returned by exception handlers.

    All API errors (4xx, 5xx) use this shape so clients can always expect
    ``{"detail": "...", "status_code": N}`` in the response body.

    Attributes:
        detail: A human-readable error message describing what went wrong.
        status_code: The HTTP status code (duplicated in the body for
            convenience — some clients find it easier to parse from JSON
            than from the HTTP response object).
    """

    detail: str
    status_code: int

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"detail": "Not found", "status_code": 404},
                {"detail": "Internal server error", "status_code": 500},
            ]
        }
    )


class ServiceCheck(BaseModel):
    """Result of a single health probe against a Cloudflare service.

    The ``/health`` endpoint runs one of these checks for each configured
    binding (KV, D1, AI) and for configuration items (env vars, secrets).

    Attributes:
        status: The probe result:

            - ``"ok"`` — the service responded successfully.
            - ``"error"`` — the service is configured but the probe failed
              (e.g., timeout, connection refused, query error).
            - ``"not_configured"`` — the binding is not set up in
              ``wrangler.jsonc`` (not necessarily an error — the template
              may not use every binding).
            - ``"degraded"`` — the service is partially working (e.g.,
              some required secrets are missing).

        latency_ms: Round-trip time for the probe in milliseconds, or
            None for checks that don't involve I/O (e.g., verifying
            that an env var exists).
        message: Additional context about the check result. For security,
            this never includes actual secret values or stored data —
            only counts and generic status messages.
    """

    status: Literal["ok", "error", "not_configured", "degraded"]
    latency_ms: float | None = None
    message: str | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"status": "ok", "latency_ms": 2.3, "message": None},
                {"status": "error", "latency_ms": None, "message": "TimeoutError: KV read timed out"},
            ]
        }
    )


class HealthResponse(BaseModel):
    """Aggregate response from ``GET /health``.

    Combines individual ``ServiceCheck`` results into an overall status.
    Monitoring tools and load balancers can poll this endpoint to determine
    if the Worker is healthy.

    Attributes:
        status: Overall Worker health:

            - ``"ok"`` — all probes passed (or are ``not_configured``).
            - ``"degraded"`` — at least one probe returned ``"error"``
              or ``"degraded"``. The Worker is running but some features
              may not work.

        checks: A dict mapping check names (e.g., ``"kv"``, ``"d1"``,
            ``"secrets"``) to their individual ``ServiceCheck`` results.
        timestamp: ISO 8601 UTC timestamp of when the health check ran.
    """

    status: Literal["ok", "degraded"]
    checks: dict[str, ServiceCheck]
    timestamp: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "status": "ok",
                    "checks": {
                        "kv": {"status": "ok", "latency_ms": 1.2, "message": None},
                        "d1": {"status": "ok", "latency_ms": 3.4, "message": None},
                        "ai": {"status": "ok", "latency_ms": 0.1, "message": "binding available"},
                        "env_vars": {"status": "ok", "latency_ms": None, "message": "1 env var(s) configured"},
                        "secrets": {"status": "ok", "latency_ms": None, "message": "2 required secret(s) configured"},
                    },
                    "timestamp": "2026-02-25T12:00:00+00:00",
                }
            ]
        }
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper for list endpoints.

    Cloudflare Workers have a **128 MB memory limit**, so you should never
    load an entire dataset into memory. Use this model to return results
    in pages with ``offset`` and ``limit`` parameters.

    Type parameter ``T`` is the type of items in the list. FastAPI uses
    this for automatic OpenAPI schema generation.

    Attributes:
        items: The current page of results.
        total: Total number of items across all pages (for UI pagination).
        offset: Number of items skipped (0-based).
        limit: Maximum items per page.

    Example::

        @router.get("/items", response_model=PaginatedResponse[Item])
        async def list_items(offset: int = 0, limit: int = 20):
            items = await fetch_items(offset, limit)
            total = await count_items()
            return PaginatedResponse(
                items=items, total=total, offset=offset, limit=limit
            )
    """

    items: list[T]
    total: int
    offset: int
    limit: int

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "items": [{"id": 1, "name": "Example"}],
                    "total": 42,
                    "offset": 0,
                    "limit": 20,
                }
            ]
        }
    )
