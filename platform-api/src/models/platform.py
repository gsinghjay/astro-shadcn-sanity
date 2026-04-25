from typing import Any

from pydantic import BaseModel, Field


class DeployStatus(BaseModel):
    site: str = Field(examples=["capstone"])
    status: str = Field(
        examples=["active"],
        description='One of: "active", "building", "failed", "unknown".',
    )
    url: str | None = Field(default=None, examples=["https://capstone.pages.dev"])
    created_on: str | None = Field(default=None, examples=["2026-04-24T22:00:00Z"])
    environment: str = Field(default="production", examples=["production"])


class RebuildResponse(BaseModel):
    site: str = Field(examples=["capstone"])
    triggered: bool = Field(examples=[True])
    message: str = Field(examples=["Rebuild deploy hook triggered."])


class AnalyticsResponse(BaseModel):
    metric: str = Field(examples=["requests"])
    period: str = Field(examples=["24h"])
    data: list[dict[str, Any]] = Field(
        examples=[[{"datetime": "2026-04-24T00:00:00Z", "value": 1234}]]
    )