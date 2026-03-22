# tests/test_content.py
import pytest
from fastapi.testclient import TestClient
from app import app
from dependencies import get_sanity

client = TestClient(app)

# 1. Create a Fake Sanity Client
class MockSanityClient:
    def __init__(self):
        self.project_id = "test"
        self.token = "test-token"

    async def query(self, groq: str, dataset: str, params: dict | None = None):
        # Return fake data based on the GROQ query
        if "sponsor" in groq:
            return [{"_id": "sponsor-1", "name": "Acme Corp", "tier": "gold", "website": "https://acme.com", "projectCount": 2}]
        elif "event" in groq:
            return [{"_id": "evt-1", "title": "Tech Talk", "date": "2026-04-01T18:00:00Z", "eventType": "lecture", "location": "Room 101"}]
        return []

# 2. Override the real dependency with the fake one
app.dependency_overrides[get_sanity] = lambda: MockSanityClient()


# 3. Write the tests!
def test_get_sponsors():
    response = client.get("/api/v1/content/sponsors")
    assert response.status_code == 200
    
    # Check Caching Header (AC9)
    assert response.headers["Cache-Control"] == "public, max-age=60"
    
    # Check data shape (AC7)
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Acme Corp"
    assert data[0]["projectCount"] == 2  # tests alias worked

def test_get_events():
    response = client.get("/api/v1/content/events?upcoming=true&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["title"] == "Tech Talk"

def test_invalid_site_routing():
    # AC8: Dataset routing - invalid site should return 400
    response = client.get("/api/v1/content/sponsors?site=invalid-site")
    assert response.status_code == 400
    assert "Unknown site" in response.json()["detail"]

def test_mutations_blocked_without_api_key():
    # AC6: Mutations require API key
    response = client.post("/api/v1/content/mutations", json={"mutations": []})
    assert response.status_code == 403  # Should be forbidden