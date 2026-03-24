# src/models/content.py
from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, ConfigDict, Discriminator, Tag


class SanityBaseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class SponsorResponse(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "sponsor-123",
                "name": "Acme Corp",
                "tier": "gold",
                "website": "https://acme.com",
                "projectCount": 2
            }]
        }
    )

    id: str = Field(alias="_id", description="Sanity document _id")
    name: str
    tier: str | None = Field(default=None, description="Sponsorship tier: platinum, gold, silver, bronze")
    website: str | None = None
    project_count: int = Field(default=0, alias="projectCount")


class EventResponse(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "event-456",
                "title": "Spring Showcase 2024",
                "date": "2024-05-15T18:00:00Z",
                "eventType": "exhibition",
                "location": "Main Auditorium",
                "description": "Annual student project exhibition."
            }]
        }
    )

    id: str = Field(alias="_id")
    title: str
    date: str
    event_type: str | None = Field(default=None, alias="eventType")
    location: str | None = None
    description: str | None = None


class ProjectResponse(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "project-789",
                "title": "Eco-Tracker App",
                "slug": "eco-tracker",
                "status": "completed",
                "sponsor": "Green Earth Foundation",
                "technologyTags": ["React Native", "Firebase"]
            }]
        }
    )

    id: str = Field(alias="_id")
    title: str
    slug: str
    status: str | None = None
    sponsor: str | None = Field(default=None, description="Resolved sponsor name")
    tech_tags: list[str] = Field(default_factory=list, alias="technologyTags")


class PageResponse(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "page-001",
                "title": "About Us",
                "slug": "about",
                "blocks": [{"_type": "hero", "heading": "Welcome"}]
            }]
        }
    )
    id: str = Field(alias="_id")
    title: str
    slug: str
    blocks: list[dict] = Field(default_factory=list)


class SearchResult(SanityBaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "_id": "doc-999",
                "_type": "project",
                "title": "Smart City Grid",
                "_score": 0.95
            }]
        }
    )
    id: str = Field(alias="_id")
    type: str = Field(alias="_type")
    title: str
    score: float | None = Field(default=None, alias="_score")


class SearchRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "query": "sustainability",
                "site": "capstone",
                "types": ["project", "event"]
            }]
        }
    )
    query: str
    site: str = "capstone"
    types: list[str] = Field(default=["event", "sponsor", "project"])


# --- Typed Sanity mutation models ---

class CreateMutation(BaseModel):
    """Create a new document."""
    create: dict = Field(description="Document body with _type and fields")


class CreateOrReplaceMutation(BaseModel):
    """Create or fully replace a document by _id."""
    createOrReplace: dict = Field(description="Document body with _id, _type, and fields")


class PatchMutation(BaseModel):
    """Patch specific fields on an existing document."""
    patch: dict = Field(description="Patch object with id, set/unset/inc/dec operations")


class DeleteMutation(BaseModel):
    """Delete a document by _id."""
    delete: dict = Field(description="Object with id field")


def _get_mutation_discriminator(v: dict | BaseModel) -> str:
    """Discriminate mutation type by which key is present."""
    raw = v if isinstance(v, dict) else v.model_dump()
    for key in ("create", "createOrReplace", "patch", "delete"):
        if key in raw:
            return key
    return "create"


SanityMutation = Annotated[
    Union[
        Annotated[CreateMutation, Tag("create")],
        Annotated[CreateOrReplaceMutation, Tag("createOrReplace")],
        Annotated[PatchMutation, Tag("patch")],
        Annotated[DeleteMutation, Tag("delete")],
    ],
    Discriminator(_get_mutation_discriminator),
]


class MutationRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "dataset": "production",
                "mutations": [{"create": {"_type": "event", "title": "New Event"}}]
            }]
        }
    )
    mutations: list[SanityMutation]
    dataset: str = "production"
