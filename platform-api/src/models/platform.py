from typing import Any, Literal

from pydantic import BaseModel, Field


class DeployStatus(BaseModel):
    site: str = Field(examples=["capstone"])
    status: Literal["active", "building", "failed", "unknown"] = Field(
        examples=["active"],
        description='One of: "active", "building", "failed", "unknown".',
    )
    url: str | None = Field(default=None, examples=["https://capstone.pages.dev"])
    created_on: str | None = Field(default=None, examples=["2026-04-24T22:00:00Z"])
    environment: Literal["production", "preview"] = Field(default="production", examples=["production"])


class RebuildResponse(BaseModel):
    site: str = Field(examples=["capstone"])
    triggered: bool = Field(examples=[True])
    message: str = Field(examples=["Rebuild deploy hook triggered."])


class AnalyticsResponse(BaseModel):
    metric: Literal["chatbot_queries", "form_submissions", "webhook_events"] = Field(examples=["requests"])
    period: Literal["24h", "7d", "30d"] = Field(examples=["24h"])
    data: list[dict[str, Any]] = Field(
        examples=[[{"datetime": "2026-04-24T00:00:00Z", "value": 1234}]]
    )