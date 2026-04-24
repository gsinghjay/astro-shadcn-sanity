from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DeployStatus(BaseModel):
    site: str
    status: str  # "active", "building", "failed", "unknown"
    url: Optional[str] = None
    created_on: Optional[str] = None
    environment: str = "production"

class RebuildResponse(BaseModel):
    site: str
    triggered: bool
    message: str

class AnalyticsResponse(BaseModel):
    metric: str
    period: str
    data: List[Dict[str, Any]]