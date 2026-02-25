"""
Shared Pydantic models used across all workers.

These provide consistent response shapes for the OpenAPI docs (Swagger UI)
and automatic request/response validation.
"""

from typing import Generic, Literal, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ErrorResponse(BaseModel):
    """Standard error shape returned by exception handlers."""

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
    """Result of a single service health probe."""

    status: Literal["ok", "error", "not_configured", "degraded"]
    latency_ms: float | None = None  # round-trip time for the probe
    message: str | None = None       # error details or extra info

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"status": "ok", "latency_ms": 2.3, "message": None},
                {"status": "error", "latency_ms": None, "message": "TimeoutError: KV read timed out"},
            ]
        }
    )


class HealthResponse(BaseModel):
    """Response from GET /health."""

    status: Literal["ok", "degraded"]
    checks: dict[str, ServiceCheck]
    timestamp: str  # ISO 8601 UTC timestamp

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "status": "ok",
                    "checks": {
                        "kv": {"status": "ok", "latency_ms": 1.2, "message": None},
                        "d1": {"status": "ok", "latency_ms": 3.4, "message": None},
                        "ai": {"status": "ok", "latency_ms": 0.1, "message": "binding available"},
                        "env_vars": {"status": "ok", "latency_ms": None, "message": "ENVIRONMENT=development"},
                        "secrets": {"status": "ok", "latency_ms": None, "message": "API_KEY configured"},
                    },
                    "timestamp": "2026-02-25T12:00:00+00:00",
                }
            ]
        }
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.

    Usage:
        @router.get("/items", response_model=PaginatedResponse[Item])
        async def list_items(offset: int = 0, limit: int = 20):
            items = await fetch_items(offset, limit)
            total = await count_items()
            return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)
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
