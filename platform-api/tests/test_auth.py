# platform-api/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app import app
from dependencies import get_settings, get_db, get_sanity
from models.settings import WorkerSettings


class MockKV:
    def __init__(self):
        self.store = {}

    async def get(self, key, **kwargs):
        return self.store.get(key)

    async def put(self, key, value, **kwargs):
        self.store[key] = value


class MockDB:
    def __init__(self, return_value=None):
        self.return_value = return_value
        self.call_count = 0

    def prepare(self, query):
        return self

    def bind(self, *args):
        return self

    async def first(self):
        self.call_count += 1
        return self.return_value

class DBQueryResponse:
    def __init__(self, email, role):
        self.email = email
        self.role = role

@pytest.fixture
def mock_kv():
    return MockKV()


@pytest.fixture
def mock_db():
    # Default to a successful D1 return for a sponsor
    return MockDB(DBQueryResponse("sponsor@test.com", "sponsor"))


@pytest.fixture
def client(mock_kv, mock_db):
    def _mock_settings():
        mock = MagicMock(spec=WorkerSettings)
        mock.kv = mock_kv
        mock.db = mock_db
        return mock

    class MockSanity:
        async def query(self, *args, **kwargs):
            return []

    # Override dependencies
    app.dependency_overrides[get_settings] = _mock_settings
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_sanity] = lambda: MockSanity()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# --- Tests ---

def test_valid_sponsor_session(client, mock_kv, mock_db):
    """Valid sponsor session token + matching email writes to KV."""
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "sponsor@test.com", "password": "valid_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "valid_token"
    assert data["token_type"] == "bearer"
    
    # Assert KV cache entry was written
    assert "session:valid_token" in mock_kv.store
    assert mock_db.call_count == 1


def test_subsequent_call_hits_cache(client, mock_db):
    """Subsequent call hits KV cache and D1 is NOT queried again."""
    # First call (seeds cache)
    client.post(
        "/api/v1/auth/token",
        data={"username": "sponsor@test.com", "password": "valid_token"}
    )
    assert mock_db.call_count == 1
    
    # Second call
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "sponsor@test.com", "password": "valid_token"}
    )
    
    assert response.status_code == 200
    # Call count stays at 1 (short-circuited via KV)
    assert mock_db.call_count == 1


def test_expired_session_row(client, mock_db):
    """Expired session row -> 401 Invalid session token."""
    mock_db.return_value = None  # Simulate expired constraint failing
    
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "sponsor@test.com", "password": "expired_token"}
    )
    
    assert response.status_code == 401
    assert "Invalid session token or email" in response.json()["detail"]


def test_email_mismatch(client, mock_db):
    """Email mismatch (token belongs to different user) -> 401."""
    mock_db.return_value = None  # Simulate WHERE user.email = ? failing
    
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "hacker@test.com", "password": "valid_token"}
    )
    
    assert response.status_code == 401


def test_role_student(client, mock_db):
    """Role = student -> 401 (fails the IN ('sponsor') clause)."""
    mock_db.return_value = None
    
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "student@test.com", "password": "valid_token"}
    )
    
    assert response.status_code == 401


def test_missing_auth_header_require_sponsor(client):
    """Missing Authorization header on a Depends(require_sponsor) route -> 401."""
    # /forms/submissions is protected by require_admin/require_sponsor
    response = client.get("/api/v1/forms/submissions")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_cache_hit_short_circuits_require_sponsor(client, mock_db, mock_kv):
    """KV cache hit short-circuits BOTH lookups, assert D1 not called."""
    # Pre-seed the KV cache format used by dependencies.py
    mock_kv.store["session_token:cached_token"] = "sponsor@test.com"
    
    response = client.get(
        "/api/v1/forms/submissions",
        headers={"Authorization": "Bearer cached_token"}
    )
    
    assert response.status_code == 200
    # The cache handled the auth layer; D1 shouldn't have been queried
    assert mock_db.call_count == 0