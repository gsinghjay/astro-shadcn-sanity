# tests/test_content.py
import pytest
from fastapi import Request, HTTPException
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_sanity, get_settings, require_authenticated_user
from models.settings import WorkerSettings


class MockSanityClient:
    def __init__(self):
        self.project_id = "test-project"
        self.token = "test-token"

    async def query(self, groq: str, _dataset: str, _params: dict | None = None):
        lower = groq.lower()
        if "_type == \"sponsor\"" in lower:
            return[{"_id": "sponsor-1", "name": "Acme Corp", "tier": "gold", "website": "https://acme.com", "projectCount": 2}]
        elif "_type == \"event\"" in lower:
            return[{"_id": "evt-1", "title": "Tech Talk", "date": "2026-04-01T18:00:00Z", "eventType": "lecture", "location": "Room 101", "description": "A great talk"}]
        elif "_type == \"project\"" in lower:
            return[{"_id": "proj-1", "title": "AI Assistant", "slug": "ai-assistant", "status": "active", "sponsor": "Acme Corp", "technologyTags":["Python", "React"]}]
        elif "_type == \"page\"" in lower:
            return[{"_id": "page-1", "title": "Home", "slug": "home", "blocks": []}]
        elif "score" in lower:
            return[{"_id": "search-1", "_type": "event", "title": "Tech Talk", "_score": 1.5}]
        return[]

    async def mutate(self, mutations: list[dict], dataset: str, write_token: str) -> dict:
        return {"transactionId": "mock-txn", "results":[]}


@pytest.fixture
def client():
    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        mock.optional_secrets = {"sanity_api_write_token": "test-write-token"}
        mock.env_vars = {"sanity_project_id": "test"}
        return mock

    # Mock the new OAuth2 dependency
    async def mock_require_auth(request: Request):
        auth = request.headers.get("Authorization")
        if not auth or auth != "Bearer valid-test-token":
            raise HTTPException(status_code=401, detail="Not authenticated")
        return "admin@example.com"

    app.dependency_overrides[get_sanity] = lambda: MockSanityClient()
    app.dependency_overrides[get_settings] = _mock_settings
    app.dependency_overrides[require_authenticated_user] = mock_require_auth

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ---------------------------------------------------------
# Tests
# ---------------------------------------------------------

def test_get_sponsors(client):
    response = client.get("/api/v1/content/sponsors")
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "public, max-age=60"


def test_get_events(client):
    response = client.get("/api/v1/content/events?upcoming=true&limit=5")
    assert response.status_code == 200


def test_get_projects(client):
    response = client.get("/api/v1/content/projects")
    assert response.status_code == 200


def test_get_pages(client):
    response = client.get("/api/v1/content/pages")
    assert response.status_code == 200


def test_search(client):
    response = client.post("/api/v1/content/search", json={"query": "Tech"})
    assert response.status_code == 200


def test_invalid_site_routing(client):
    response = client.get("/api/v1/content/sponsors?site=invalid-site")
    assert response.status_code == 400


def test_mutations_blocked_without_api_key(client):
    # No Authorization header -> should fail
    response = client.post(
        "/api/v1/content/mutations",
        json={"mutations":[], "dataset": "production"},
    )
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_mutations_with_valid_admin_key(client):
    # Valid Bearer token -> should pass
    response = client.post(
        "/api/v1/content/mutations",
        json={"mutations":[{"create": {"_type": "event", "title": "Test"}}], "dataset": "production"},
        headers={"Authorization": "Bearer valid-test-token"},
    )
    assert response.status_code == 200