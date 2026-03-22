# tests/test_content.py
import pytest
from fastapi.testclient import TestClient
from app import app
from dependencies import get_sanity, get_settings
from models.settings import WorkerSettings
from unittest.mock import MagicMock

client = TestClient(app)

# 1. Create a Fake Sanity Client
class MockSanityClient:
    def __init__(self):
        self.project_id = "test-project"
        self.token = "test-token"

    async def query(self, groq: str, dataset: str, params: dict | None = None):
        if "sponsor" in groq.lower() and "projectcount" in groq.lower():
            return [{"_id": "sponsor-1", "name": "Acme Corp", "tier": "gold", "website": "https://acme.com", "projectCount": 2}]
        elif "event" in groq.lower():
            return [{"_id": "evt-1", "title": "Tech Talk", "date": "2026-04-01T18:00:00Z", "eventType": "lecture", "location": "Room 101", "description": "A great talk"}]
        elif "project" in groq.lower():
            return [{"_id": "proj-1", "title": "AI Assistant", "slug": "ai-assistant", "status": "active", "sponsor": "Acme Corp", "technologyTags": ["Python", "React"]}]
        elif "page" in groq.lower():
            return [{"_id": "page-1", "title": "Home", "slug": "home", "blocks": []}]
        elif "score" in groq.lower(): 
            return [{"_id": "search-1", "_type": "event", "title": "Tech Talk", "_score": 1.5}]
        return []

# 2. Create a Fake Settings Provider
def mock_get_settings():
    mock = MagicMock(spec=WorkerSettings)
    mock.required_secrets = {"admin_api_key": "test-admin-key"}
    mock.optional_secrets = {"sanity_api_write_token": "test-write-token"}
    mock.env_vars = {"SANITY_PROJECT_ID": "test"}
    return mock

# 3. Apply the overrides
app.dependency_overrides[get_sanity] = lambda: MockSanityClient()
app.dependency_overrides[get_settings] = mock_get_settings


# ---------------------------------------------------------
# Tests Below
# ---------------------------------------------------------

def test_get_sponsors():
    response = client.get("/api/v1/content/sponsors")
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "public, max-age=60"
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Acme Corp"
    assert data[0]["projectCount"] == 2

def test_get_events():
    response = client.get("/api/v1/content/events?upcoming=true&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Tech Talk"

def test_get_projects():
    response = client.get("/api/v1/content/projects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["technologyTags"] == ["Python", "React"]

def test_get_pages():
    response = client.get("/api/v1/content/pages")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "home"

def test_search():
    response = client.post("/api/v1/content/search", json={"query": "Tech"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["_type"] == "event"

def test_invalid_site_routing():
    response = client.get("/api/v1/content/sponsors?site=invalid-site")
    assert response.status_code == 400
    assert "Unknown site" in response.json()["detail"]

def test_mutations_blocked_without_api_key():
    response = client.post(
        "/api/v1/content/mutations", 
        json={"mutations": [], "dataset": "production"}
    )
    assert response.status_code == 403
    assert "Invalid or missing Admin API Key" in response.json()["detail"]