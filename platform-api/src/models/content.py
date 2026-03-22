# src/models/content.py
from pydantic import BaseModel, Field, ConfigDict

class SanityBaseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

class SponsorResponse(SanityBaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
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
        populate_by_name=True,
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
        populate_by_name=True,
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
        populate_by_name=True,
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
        populate_by_name=True,
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

class MutationRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "dataset": "production",
                "mutations": [{"create": {"_type": "event", "title": "New Event"}}]
            }]
        }
    )
    mutations: list[dict]
    dataset: str = "production"
