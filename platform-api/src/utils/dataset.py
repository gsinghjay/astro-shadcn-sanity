# src/utils/dataset.py
from fastapi import HTTPException

SITE_TO_DATASET = {"capstone": "production", "rwc-us": "rwc", "rwc-intl": "rwc"}

def resolve_dataset(site: str) -> tuple[str, str | None]:
    dataset = SITE_TO_DATASET.get(site)
    if not dataset:
        raise HTTPException(status_code=400, detail=f"Unknown site: {site}")
    
    # If it's the RWC dataset, we need to pass the site id to the GROQ query
    site_filter = site if dataset == "rwc" else None
    return dataset, site_filter