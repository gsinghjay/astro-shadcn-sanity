from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models.settings import WorkerSettings
from dependencies import get_settings, get_db

import re

router = APIRouter(prefix = "/auth", tags=["Authentication"])

CACHE_EXPIRY_SECONDS = 5 * 60 # 5 minute expiry time

@router.post("/token", tags=["Authentication"])
async def authenticate_for_access_token(
    auth_data: OAuth2PasswordRequestForm = Depends(), 
    settings: WorkerSettings = Depends(get_settings), 
    db = Depends(get_db)
):
    if not settings.db or not settings.kv:
        raise HTTPException(500, "D1 or KV not configured")
    
    cached_email = await settings.kv.get(f"session:{auth_data.password}")

    if cached_email and cached_email == auth_data.username:
        return {"access_token": auth_data.password, "token_type": "bearer"}

    query = """
        SELECT user.email 
        FROM user 
        JOIN session ON user.id = session.user_id
        WHERE user.email = ? 
          AND session.token = ? 
          AND user.role IN ('sponsor', 'admin') 
          AND session.expires_at > (unixepoch() * 1000);
    """

    result = await db.prepare(query).bind(auth_data.username, auth_data.password).first()
    
    if not result:
        raise HTTPException(status_code=401, detail="Invalid session token or email")
        
    await settings.kv.put(f"session:{auth_data.password}", result["email"], expirationTtl=CACHE_EXPIRY_SECONDS)

    return {"access_token": auth_data.password, "token_type": "bearer"} # swagger schema requirement