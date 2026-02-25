"""
FastAPI application — testable without the Cloudflare Workers runtime.

This module defines the FastAPI app, middleware, exception handlers, and
router includes. It has ZERO Workers-specific imports so pytest can load
it directly.

The Workers entrypoint (main.py) imports `app` from here and wires it
into the ASGI bridge.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers.health import router as health_router


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="FastAPI CF Worker",
    version="0.1.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",      # ReDoc at /redoc
)

# CORS — adjust origins for your frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # Lock this down in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)


# Global exception handler — catch unhandled errors and return JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500},
    )
