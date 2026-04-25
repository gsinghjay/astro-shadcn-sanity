"""FastAPI application — testable without the Cloudflare Workers runtime.

This module defines the core FastAPI app: middleware, exception handlers, and
router registrations. It has **zero** Workers-specific imports, which means:

- ``pytest`` can import it directly (no Pyodide runtime needed).
- ``main.py`` imports the ``app`` object from here and wires it into the
  Workers ASGI bridge.

Why two files (main.py vs app.py)?
    ``main.py`` imports ``workers`` and ``asgi`` — modules that only exist
    inside Cloudflare's Pyodide runtime (a WebAssembly Python interpreter).
    If you try to import ``main.py`` from regular Python (e.g., during
    testing), you get ``ModuleNotFoundError``. By keeping the FastAPI app
    in a separate file with no Workers imports, tests can load and exercise
    all your routes without deploying to Cloudflare.

Adding a new router:
    1. Create a file in ``routers/`` (e.g., ``routers/content.py``).
    2. Define an ``APIRouter`` in that file.
    3. Import and register it here with ``app.include_router(your_router)``.
    4. Reload the dev server — your new routes appear at ``/docs``.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers.health import router as health_router
from routers.content import router as content_router
from routers.forms import router as form_router
from routers.platform import router as platform_router

app = FastAPI(
    title="Platform API",
    version="0.1.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",      # ReDoc at /redoc
)
"""The FastAPI application instance.

This is imported by ``main.py`` (for the Workers runtime) and by
``tests/conftest.py`` (for pytest). Both use the same app object.
"""

# CORS — lock down origins before deploying to production!
# Do NOT combine allow_origins=["*"] with allow_credentials=True —
# Starlette reflects the request origin, granting any site credentialed access.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",      # Astro dev
        "http://localhost:3333",       # Studio dev
        "https://capstone.example.com", # Production
    ],
    # allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(content_router, prefix="/api/v1")
app.include_router(form_router, prefix="/api/v1")
app.include_router(platform_router, prefix="/api/v1")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a safe JSON error response.

    Without this handler, unhandled exceptions would produce an HTML error
    page or a plain-text traceback. For an API, we always want JSON.

    The response intentionally does NOT include the exception message or
    traceback — those could leak internal details (file paths, SQL queries,
    stack frames) to the caller. Errors are logged server-side by the
    Workers runtime automatically.

    Args:
        request: The incoming FastAPI request that triggered the error.
        exc: The unhandled exception.

    Returns:
        A ``JSONResponse`` with status 500 and a generic error message.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500},
    )
