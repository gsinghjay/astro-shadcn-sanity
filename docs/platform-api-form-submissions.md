# platform-api — Sanity Form Submissions (GROQ)

Handoff for adding a `GET /content/submissions` endpoint to `platform-api/`. Reads `submission` documents from the Sanity Content Lake via GROQ. Mirrors the existing pattern in `src/routers/content.py` + `src/queries/*.py` + `src/services/sanity_client.py`.

## Schema reference

The Sanity `submission` document (`studio/src/schemaTypes/documents/submission.ts`) is `readOnly: true` in the Studio. Form POST handlers create them via mutations; this endpoint only reads them.

Fields:

| Field          | Type                  | Notes                                                       |
| -------------- | --------------------- | ----------------------------------------------------------- |
| `_id`          | string                | Sanity doc ID                                               |
| `_createdAt`   | datetime              | Set by Sanity                                               |
| `site`         | string                | `capstone` \| `rwc-us` \| `rwc-intl` (multi-site filter)    |
| `name`         | string (required)     |                                                             |
| `email`        | string (required)     |                                                             |
| `organization` | string \| null        |                                                             |
| `message`      | text (required)       |                                                             |
| `form`         | reference → `form`    | Which form generated the submission                         |
| `submittedAt`  | datetime (required)   | Authoritative timestamp; sort/filter on this, not `_createdAt` |

## Auth + dataset

- Submissions live in the same datasets as content: `production` (capstone) and `rwc` (rwc-us + rwc-intl).
- `SANITY_API_READ_TOKEN` is already wired through `SanityClient` (see `services/sanity_client.py`) — no new secret needed.
- Submissions are NOT public-readable. The existing token currently grants read on the dataset; if you ever tighten Sanity ACLs, submissions need a token with `viewer` role on `production` + `rwc`.
- Reuse `utils/dataset.resolve_dataset(site)` — it returns `(dataset, site_filter)`. `site_filter` is `None` for capstone (single-site dataset, no `site` field needed in filter) and the site id for rwc datasets.

## Files to add

```
platform-api/
  src/
    queries/submissions.py          # NEW — GROQ
    models/content.py               # EDIT — add SubmissionResponse
    routers/content.py              # EDIT — add 2 endpoints
  tests/test_submissions.py         # NEW
```

## 1. `src/queries/submissions.py`

```python
# List submissions, newest first, with optional date range + form filter.
# (!defined($site) || site == $site) — capstone passes site=None, short-circuits.
# (!defined($formId) || form._ref == $formId) — optional filter by referenced form.
# (!defined($since) || submittedAt >= $since) — ISO-8601 string from query param.
# Slice [$start...$end] paginates server-side. End is exclusive.
GET_SUBMISSIONS = """
*[_type == "submission"
  && (!defined($site) || site == $site)
  && (!defined($formId) || form._ref == $formId)
  && (!defined($since) || submittedAt >= $since)
] | order(submittedAt desc) [$start...$end] {
  _id,
  submittedAt,
  name,
  email,
  organization,
  message,
  "formId": form._ref,
  "formTitle": form->title,
  site
}
"""

# Total count for pagination metadata. Same filters, no slice, no projection.
COUNT_SUBMISSIONS = """
count(*[_type == "submission"
  && (!defined($site) || site == $site)
  && (!defined($formId) || form._ref == $formId)
  && (!defined($since) || submittedAt >= $since)
])
"""

# Single submission by _id, scoped by site to prevent cross-tenant leakage.
GET_SUBMISSION_BY_ID = """
*[_type == "submission"
  && _id == $id
  && (!defined($site) || site == $site)
][0] {
  _id,
  submittedAt,
  name,
  email,
  organization,
  message,
  "formId": form._ref,
  "formTitle": form->title,
  site
}
"""
```

Notes:
- `form->title` is a dereference (the `->` operator). If you don't need the form title, drop it — saves a join.
- `form._ref` is the raw reference id; useful for client-side filtering without the join.
- Project `submittedAt` first; clients sort/group on it.

## 2. `src/models/content.py` (additions)

Add to the existing file. Keep the alias pattern (`_id` → `id`, etc.) so the wire shape matches Sanity's projection.

```python
class SubmissionResponse(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "submission-abc123",
                "submittedAt": "2026-04-30T14:22:00Z",
                "name": "Jane Doe",
                "email": "jane@example.com",
                "organization": "Acme Corp",
                "message": "Interested in sponsorship.",
                "formId": "form-contact-2026",
                "formTitle": "Contact Us",
                "site": "capstone"
            }]
        }
    )

    id: str = Field(alias="_id")
    submitted_at: str = Field(alias="submittedAt")
    name: str
    email: str
    organization: str | None = None
    message: str
    form_id: str | None = Field(default=None, alias="formId")
    form_title: str | None = Field(default=None, alias="formTitle")
    site: str | None = None


class SubmissionListResponse(BaseModel):
    """Paginated wrapper. Total comes from a separate count() GROQ call."""
    items: list[SubmissionResponse]
    total: int
    start: int
    end: int
```

## 3. `src/routers/content.py` (additions)

Add to the existing router. **Do NOT call `set_cache_header()`** on these — submissions are PII; we don't want a CDN caching them.

```python
from queries.submissions import (
    GET_SUBMISSIONS,
    COUNT_SUBMISSIONS,
    GET_SUBMISSION_BY_ID,
)
from models.content import SubmissionResponse, SubmissionListResponse


@router.get("/submissions", response_model=SubmissionListResponse)
async def list_submissions(
    response: Response,
    site: str = Query("capstone", description="Target site/workspace"),
    form_id: str | None = Query(None, alias="formId", description="Filter by form _id"),
    since: str | None = Query(None, description="ISO-8601 datetime; only submissions at/after this time"),
    start: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=200, description="Page size"),
    sanity: SanityClient = Depends(get_sanity),
    _admin: bool = Depends(verify_admin_api_key),
):
    """List form submissions. Admin-only: submissions are PII."""
    dataset, site_filter = resolve_dataset(site)
    end = start + limit

    params = _build_params(
        site=site_filter,
        formId=form_id,
        since=since,
        start=start,
        end=end,
    )

    items = await sanity.query(GET_SUBMISSIONS, dataset, params)
    total = await sanity.query(COUNT_SUBMISSIONS, dataset, params)

    response.headers["Cache-Control"] = "no-store"
    return {"items": items, "total": total, "start": start, "end": end}


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    response: Response,
    site: str = Query("capstone"),
    sanity: SanityClient = Depends(get_sanity),
    _admin: bool = Depends(verify_admin_api_key),
):
    """Fetch a single submission by _id, scoped by site."""
    dataset, site_filter = resolve_dataset(site)
    result = await sanity.query(
        GET_SUBMISSION_BY_ID,
        dataset,
        _build_params(id=submission_id, site=site_filter),
    )
    if not result:
        raise HTTPException(status_code=404, detail="Submission not found")
    response.headers["Cache-Control"] = "no-store"
    return result
```

Why `verify_admin_api_key`:
- Submissions contain PII (name, email, message). The same dependency is used on `POST /content/mutations` — reuse it, don't invent a new one.
- The `_admin: bool = Depends(...)` pattern with a leading underscore matches the existing convention in this file.

## 4. `tests/test_submissions.py`

Mock `sanity.query` like the other content tests; assert the GROQ string and params get passed through, and that `Cache-Control: no-store` is set.

```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_list_submissions_passes_filters(client, sanity_mock, admin_headers):
    sanity_mock.query = AsyncMock(side_effect=[
        [{"_id": "s1", "submittedAt": "2026-04-30T00:00:00Z",
          "name": "A", "email": "a@x.com", "message": "hi",
          "formId": "f1", "formTitle": "Contact", "site": "capstone"}],
        1,  # total
    ])

    r = await client.get(
        "/content/submissions",
        params={"site": "capstone", "formId": "f1", "start": 0, "limit": 50},
        headers=admin_headers,
    )

    assert r.status_code == 200
    assert r.headers["cache-control"] == "no-store"
    body = r.json()
    assert body["total"] == 1
    assert body["start"] == 0
    assert body["end"] == 50
    assert body["items"][0]["_id"] == "s1"

    # Two GROQ calls (list + count) with the same params shape.
    assert sanity_mock.query.await_count == 2
    list_call = sanity_mock.query.await_args_list[0]
    assert list_call.args[0].lstrip().startswith("*[_type == \"submission\"")
    assert list_call.args[2]["formId"] == "f1"
    assert list_call.args[2]["start"] == 0
    assert list_call.args[2]["end"] == 50


@pytest.mark.asyncio
async def test_list_submissions_requires_admin(client):
    r = await client.get("/content/submissions")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_submission_404(client, sanity_mock, admin_headers):
    sanity_mock.query = AsyncMock(return_value=None)
    r = await client.get("/content/submissions/missing", headers=admin_headers)
    assert r.status_code == 404
```

Reuse the `client` / `sanity_mock` / `admin_headers` fixtures from `tests/conftest.py` — they already exist for the mutation endpoint.

## Local verification

```bash
# From repo root
cd platform-api
uv run pytest tests/test_submissions.py -v

# Hit the endpoint locally (set ADMIN_API_KEY first)
npx wrangler dev
curl -H "x-api-key: $ADMIN_API_KEY" \
  "http://localhost:8787/content/submissions?site=capstone&limit=10"
```

## Gotchas

- **GROQ param `null` vs `undefined`**: `_build_params(**kwargs)` passes `None` through. In GROQ, JSON `null` becomes `null`, and `defined($site)` returns `false` for `null`. That's why every optional filter uses `(!defined($x) || ...)` — don't switch to `($x == null || ...)`, the semantics differ for missing fields.
- **`site` for capstone**: `resolve_dataset("capstone")` returns `site_filter=None`. The GROQ filter short-circuits via `!defined($site)` and matches all submissions in the `production` dataset. Don't pass `site="capstone"` as the GROQ param value.
- **rwc datasets**: `resolve_dataset("rwc-us")` returns `("rwc", "rwc-us")`. The GROQ `site == $site` filter then scopes to that site within the shared `rwc` dataset.
- **`form` reference may be missing**: older test/seed submissions might not have the `form` ref set. The projection `"formId": form._ref` returns `null` in that case — the model field is already `Optional`, no extra handling needed.
- **Pagination is offset-based**, not cursor-based. Fine for admin tooling; if you ever need stable cursors over a moving window (new submissions arriving while paging), switch to `submittedAt < $cursor` and order desc.
- **No CDN caching**: never call `set_cache_header()` on these endpoints. The `no-store` header is intentional.
- **Don't cache results in `API_KV` either** — same PII reason.

## Out of scope for this endpoint

- **Writing submissions** (POST). Form submission ingestion lives in the Astro app's form action (`astro-app/src/pages/api/...` or an Astro Action) using `SANITY_API_WRITE_TOKEN`. The platform-api `/content/mutations` proxy can do it generically but isn't the recommended path for public form POSTs (it requires the admin key).
- **Deleting / redacting submissions** (GDPR). Add a separate admin-gated `DELETE /content/submissions/{id}` later if needed; route through the existing `/content/mutations` proxy or add a dedicated handler.
- **Real-time stream**. Sanity has live queries, but `platform-api` is request/response. If real-time is needed, use the Astro app's existing `sanity-live.ts` pattern instead.

---

# platform-api — Portal Auth (D1)

Sanity holds the form submissions; **D1 holds the people**. The `ywcc-capstone-portal` D1 database holds Better Auth's `user` / `session` / `account` / `verification` tables plus a few app-specific tables. This section covers reading "who is authenticated and authorized to access the portal" from `platform-api`.

> **Read-only access.** The Astro app at `ywcc-capstone` owns writes (Better Auth manages session creation, OAuth callbacks, role assignment). `platform-api` should treat D1 as a read-only reporting surface unless explicitly asked to mutate.

## Wire `platform-api` to the existing D1 database

The capstone Astro Worker already binds this database as `PORTAL_DB`. To bind the same database into `platform-api`, **reuse the same `database_id`** — D1 databases support multiple Worker bindings.

Edit `platform-api/wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "ywcc-capstone-portal",
    "database_id": "76887418-c356-46d8-983b-fa6e395d8b16"
  }
]
```

Then regenerate types and verify:

```bash
cd platform-api
npx wrangler types        # picks up the binding
npx wrangler d1 execute ywcc-capstone-portal --remote --command "SELECT count(*) FROM user"
```

If the `wrangler types` command isn't wired here, use `npx wrangler d1 list` to confirm the binding shows up at deploy time.

The `get_db()` dependency in `src/dependencies.py` already returns `env.DB` — no Python wiring change needed.

## D1 schema (auth-relevant tables)

Source of truth: `astro-app/src/lib/drizzle-schema.ts` + `astro-app/migrations/*.sql`. **Don't redeclare the schema in `platform-api`** — read it raw via SQL.

### `user`

| Column                          | Type      | Notes                                                       |
| ------------------------------- | --------- | ----------------------------------------------------------- |
| `id`                            | TEXT PK   | Better Auth-generated id                                    |
| `name`                          | TEXT      |                                                             |
| `email`                         | TEXT UQ   |                                                             |
| `email_verified`                | INTEGER   | 0/1 boolean                                                 |
| `image`                         | TEXT      | Provider avatar URL                                         |
| `role`                          | TEXT      | `'student'` \| `'sponsor'` (default `'student'`)            |
| `agreement_accepted_at`         | INTEGER   | unix-ms; NULL = never accepted                              |
| `agreement_version`             | TEXT      | CMS-managed agreement version pinned at acceptance time     |
| `agreement_accepted_ip`         | TEXT      | Audit                                                       |
| `agreement_accepted_user_agent` | TEXT      | Audit                                                       |
| `created_at`                    | INTEGER   | unix-ms                                                     |
| `updated_at`                    | INTEGER   | unix-ms                                                     |

### `session`

| Column        | Type      | Notes                                                       |
| ------------- | --------- | ----------------------------------------------------------- |
| `id`          | TEXT PK   |                                                             |
| `user_id`     | TEXT FK   | → `user.id` ON DELETE CASCADE                               |
| `expires_at`  | INTEGER   | unix-ms; treat `expires_at > now()` as active               |
| `token`       | TEXT UQ   | The session cookie value — **PII / secret**, do NOT return  |
| `ip_address`  | TEXT      |                                                             |
| `user_agent`  | TEXT      |                                                             |
| `created_at`  | INTEGER   |                                                             |
| `updated_at`  | INTEGER   |                                                             |

### `account` (OAuth provider linkage)

| Column        | Type      | Notes                                              |
| ------------- | --------- | -------------------------------------------------- |
| `id`          | TEXT PK   |                                                    |
| `user_id`     | TEXT FK   | → `user.id` ON DELETE CASCADE                      |
| `provider_id` | TEXT      | `'google'` \| `'github'` \| `'magic-link'`         |
| `account_id`  | TEXT      | Provider-side user id                              |
| `access_token`, `refresh_token`, `id_token`, `password` | TEXT | **Secrets — never expose** |

### `verification`

Email verification + magic-link tokens. Not relevant for "who is authenticated" — skip unless asked.

### Other tables in this DB (not auth, but live alongside)

- `subscribers` (migration 0004)
- `sent_reminders` (migration 0005)
- `project_github_repos` (migration 0006) — sponsor-linked GitHub repos for student projects

## Hard rules — don't return these fields over the API

`session.token`, `account.access_token`, `account.refresh_token`, `account.id_token`, `account.password`. These are credentials and there is no reason for `platform-api` to ship them anywhere. Always project explicit columns; **never `SELECT *`** on `session` or `account`.

## Files to add for portal endpoints

```
platform-api/
  src/
    queries/portal.py              # NEW — SQL strings
    models/portal.py               # NEW — Pydantic responses
    routers/portal.py              # NEW — endpoints
  tests/test_portal.py             # NEW
```

Wire the new router into `src/app.py` (alongside the existing `content` and `health` routers).

## 1. `src/queries/portal.py`

D1 returns rows as JS-style objects via the binding. Use `?` positional placeholders.

```python
# Active = unexpired session, joined to user. One row per active session.
# Multiple sessions per user are normal (different devices). De-dupe in caller if needed.
ACTIVE_SESSIONS = """
SELECT
  u.id              AS user_id,
  u.email           AS email,
  u.name            AS name,
  u.role            AS role,
  u.image           AS image,
  u.email_verified  AS email_verified,
  u.agreement_accepted_at AS agreement_accepted_at,
  u.agreement_version     AS agreement_version,
  s.id              AS session_id,
  s.expires_at      AS session_expires_at,
  s.created_at      AS session_created_at,
  s.ip_address      AS ip_address,
  s.user_agent      AS user_agent
FROM session s
JOIN user u ON u.id = s.user_id
WHERE s.expires_at > ?
ORDER BY s.created_at DESC
LIMIT ? OFFSET ?
"""

COUNT_ACTIVE_SESSIONS = """
SELECT count(*) AS n FROM session WHERE expires_at > ?
"""

# Portal users with optional filters. Sponsors-only is the common admin view.
LIST_USERS = """
SELECT
  u.id, u.email, u.name, u.role, u.image, u.email_verified,
  u.agreement_accepted_at, u.agreement_version, u.created_at, u.updated_at,
  (SELECT count(*) FROM session s WHERE s.user_id = u.id AND s.expires_at > ?) AS active_session_count,
  (SELECT group_concat(provider_id) FROM account a WHERE a.user_id = u.id) AS providers
FROM user u
WHERE (? IS NULL OR u.role = ?)
  AND (? IS NULL OR u.email LIKE ?)
ORDER BY u.created_at DESC
LIMIT ? OFFSET ?
"""

COUNT_USERS = """
SELECT count(*) AS n
FROM user u
WHERE (? IS NULL OR u.role = ?)
  AND (? IS NULL OR u.email LIKE ?)
"""

GET_USER_BY_ID = """
SELECT
  u.id, u.email, u.name, u.role, u.image, u.email_verified,
  u.agreement_accepted_at, u.agreement_version,
  u.agreement_accepted_ip, u.agreement_accepted_user_agent,
  u.created_at, u.updated_at,
  (SELECT count(*) FROM session s WHERE s.user_id = u.id AND s.expires_at > ?) AS active_session_count,
  (SELECT group_concat(provider_id) FROM account a WHERE a.user_id = u.id) AS providers
FROM user u
WHERE u.id = ?
"""

GET_USER_BY_EMAIL = """
SELECT
  u.id, u.email, u.name, u.role, u.image, u.email_verified,
  u.agreement_accepted_at, u.agreement_version, u.created_at, u.updated_at,
  (SELECT count(*) FROM session s WHERE s.user_id = u.id AND s.expires_at > ?) AS active_session_count
FROM user u
WHERE lower(u.email) = lower(?)
"""
```

Why subqueries for `active_session_count` and `providers`:
- Keeps the row shape flat (no need to fold a JOIN result into a list in Python).
- D1 doesn't support `array_agg`; `group_concat` returns a comma-separated string — split it in the model layer.

## 2. `src/models/portal.py`

```python
from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PortalUser(BaseModel):
    """A user record from D1, augmented with provider list and active session count."""
    model_config = ConfigDict(populate_by_name=True)

    id: str
    email: str
    name: str
    role: str  # 'student' | 'sponsor'
    image: str | None = None
    email_verified: bool = False
    agreement_accepted_at: int | None = None
    agreement_version: str | None = None
    agreement_accepted_ip: str | None = None
    agreement_accepted_user_agent: str | None = None
    created_at: int
    updated_at: int
    active_session_count: int = 0
    providers: list[str] = Field(default_factory=list)

    @field_validator("providers", mode="before")
    @classmethod
    def split_providers(cls, v):
        if v is None or v == "":
            return []
        if isinstance(v, str):
            return [p.strip() for p in v.split(",") if p.strip()]
        return v

    @field_validator("email_verified", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        # SQLite stores booleans as 0/1 integers
        return bool(v) if v is not None else False


class ActiveSession(BaseModel):
    """An unexpired session, denormalized with user fields. No tokens or secrets."""
    user_id: str
    email: str
    name: str
    role: str
    image: str | None = None
    email_verified: bool = False
    agreement_accepted_at: int | None = None
    agreement_version: str | None = None
    session_id: str
    session_expires_at: int
    session_created_at: int
    ip_address: str | None = None
    user_agent: str | None = None

    @field_validator("email_verified", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        return bool(v) if v is not None else False


class PortalUserList(BaseModel):
    items: list[PortalUser]
    total: int
    start: int
    end: int


class ActiveSessionList(BaseModel):
    items: list[ActiveSession]
    total: int
    start: int
    end: int
```

## 3. `src/routers/portal.py`

```python
import time
from fastapi import APIRouter, Depends, Query, Response, HTTPException

from dependencies import get_db, verify_admin_api_key
from models.portal import (
    PortalUser, PortalUserList, ActiveSession, ActiveSessionList,
)
from queries.portal import (
    LIST_USERS, COUNT_USERS, GET_USER_BY_ID, GET_USER_BY_EMAIL,
    ACTIVE_SESSIONS, COUNT_ACTIVE_SESSIONS,
)

router = APIRouter(prefix="/portal", tags=["Portal"])


def _now_ms() -> int:
    return int(time.time() * 1000)


async def _d1_all(db, sql: str, *params):
    """Run a parameterized query and return the list of rows as plain dicts."""
    stmt = db.prepare(sql)
    if params:
        stmt = stmt.bind(*params)
    res = await stmt.all()
    # D1's `.all()` returns { results: [...], success, meta }. Pyodide proxies
    # JS objects — unwrap to plain dicts.
    rows = getattr(res, "results", None) or res["results"]
    return [dict(r) for r in rows]


async def _d1_first(db, sql: str, *params):
    rows = await _d1_all(db, sql, *params)
    return rows[0] if rows else None


@router.get("/users", response_model=PortalUserList)
async def list_users(
    response: Response,
    role: str | None = Query(None, description="Filter by role: student | sponsor"),
    email: str | None = Query(None, description="Email substring (case-insensitive LIKE)"),
    start: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db = Depends(get_db),
    _admin: bool = Depends(verify_admin_api_key),
):
    """List portal users. PII — admin only."""
    now = _now_ms()
    email_like = f"%{email}%" if email else None

    rows = await _d1_all(
        db, LIST_USERS,
        now,
        role, role,
        email_like, email_like,
        limit, start,
    )
    total_row = await _d1_first(
        db, COUNT_USERS,
        role, role,
        email_like, email_like,
    )
    total = (total_row or {}).get("n", 0)

    response.headers["Cache-Control"] = "no-store"
    return {"items": rows, "total": total, "start": start, "end": start + limit}


@router.get("/users/by-email/{email}", response_model=PortalUser)
async def get_user_by_email(
    email: str,
    response: Response,
    db = Depends(get_db),
    _admin: bool = Depends(verify_admin_api_key),
):
    row = await _d1_first(db, GET_USER_BY_EMAIL, _now_ms(), email)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    response.headers["Cache-Control"] = "no-store"
    return row


@router.get("/users/{user_id}", response_model=PortalUser)
async def get_user(
    user_id: str,
    response: Response,
    db = Depends(get_db),
    _admin: bool = Depends(verify_admin_api_key),
):
    row = await _d1_first(db, GET_USER_BY_ID, _now_ms(), user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    response.headers["Cache-Control"] = "no-store"
    return row


@router.get("/sessions/active", response_model=ActiveSessionList)
async def list_active_sessions(
    response: Response,
    start: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db = Depends(get_db),
    _admin: bool = Depends(verify_admin_api_key),
):
    """Currently-authenticated portal sessions (expires_at > now())."""
    now = _now_ms()

    rows = await _d1_all(db, ACTIVE_SESSIONS, now, limit, start)
    total_row = await _d1_first(db, COUNT_ACTIVE_SESSIONS, now)
    total = (total_row or {}).get("n", 0)

    response.headers["Cache-Control"] = "no-store"
    return {"items": rows, "total": total, "start": start, "end": start + limit}
```

Register the router in `src/app.py`:

```python
from routers import portal as portal_router
app.include_router(portal_router.router)
```

## 4. `tests/test_portal.py`

D1 bindings get mocked the same way KV does in `tests/conftest.py`. The cleanest pattern is a fake `Statement` whose `.bind()` returns itself and `.all()` returns a configured result. Add to `conftest.py` if not already there:

```python
class FakeD1Statement:
    def __init__(self, results=None, first=None):
        self._results = results or []
        self._first = first
    def bind(self, *_a):
        return self
    async def all(self):
        return {"results": self._results, "success": True, "meta": {}}
    async def first(self):
        return self._first

class FakeD1:
    def __init__(self):
        self._next_results: list = []
    def queue(self, results):
        self._next_results.append(results)
    def prepare(self, _sql):
        results = self._next_results.pop(0) if self._next_results else []
        return FakeD1Statement(results=results)
```

Then a smoke test:

```python
@pytest.mark.asyncio
async def test_active_sessions_excludes_tokens(client, fake_d1, admin_headers):
    fake_d1.queue([
        {
            "user_id": "u1", "email": "a@x.com", "name": "A", "role": "sponsor",
            "image": None, "email_verified": 1,
            "agreement_accepted_at": 1714000000000, "agreement_version": "v2",
            "session_id": "s1", "session_expires_at": _future_ms(),
            "session_created_at": _now_ms(),
            "ip_address": "1.2.3.4", "user_agent": "test",
        }
    ])
    fake_d1.queue([{"n": 1}])

    r = await client.get("/portal/sessions/active", headers=admin_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 1
    assert body["items"][0]["email"] == "a@x.com"
    # Hard contract: tokens never leave the database.
    assert "token" not in body["items"][0]
    assert "access_token" not in body["items"][0]


@pytest.mark.asyncio
async def test_users_requires_admin(client):
    r = await client.get("/portal/users")
    assert r.status_code in (401, 403)
```

## D1 binding gotchas (Python Workers)

- **Async everywhere.** Per the existing `dependencies.py` doc-comment: every dependency that touches `request.scope["env"]` MUST be `async`. The same applies to D1 calls: `await stmt.all()`, `await stmt.first()`, `await stmt.run()`. A sync wrapper anywhere in the call chain causes silent 500s from `workerd`.
- **Pyodide proxy unwrap.** D1 returns JS objects; iterating with `dict(row)` is the safe way. Don't rely on `row["x"]` accessors directly without unwrapping first — Pyodide proxies look dict-like but break some `pydantic` validators.
- **`?` placeholders only.** D1's `prepare(sql).bind(...)` uses positional `?` parameters. No named params. The double-bind pattern (`role, role, email_like, email_like`) above is intentional — SQLite/D1 doesn't reuse a single `?` across multiple positions.
- **`now()` vs application-supplied `_now_ms()`.** D1 supports `unixepoch('subsecond') * 1000` like the schema defaults, but passing `now` from Python keeps the value stable across the join + count pair. Recompute `now` per request, not per query.
- **Multiple D1 binds across Workers are fine.** `database_id` is what pins the database; `database_name` is descriptive. `platform-api` and `ywcc-capstone` can hold separate write/read connections to the same DB without coordination.
- **No transactions across requests.** D1 supports batch (`db.batch([stmt1, stmt2])`) but no cross-request transactions. Keep mutations in the Astro Worker (where Better Auth lives) — `platform-api` reads only.

## Out of scope

- **Mutating users / revoking sessions.** That belongs to Better Auth via the Astro Worker. If admin tooling needs revocation, add a dedicated `POST /portal/sessions/{id}/revoke` later; do **not** issue `DELETE FROM session` from `platform-api` (Better Auth has its own session-cleanup hooks).
- **Full audit log.** `agreement_accepted_*` columns on `user` are point-in-time; if a richer audit trail is required, it needs a new `agreement_audit` table — separate story.
- **Cross-tenant gating.** Right now `role = 'sponsor'` is the access gate for the portal. RBAC beyond `student | sponsor` requires a schema change in `astro-app/src/lib/drizzle-schema.ts` first; don't fork the role enum in `platform-api`.
