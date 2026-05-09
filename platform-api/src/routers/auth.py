from fastapi import APIRouter, Depends, HTTPException, Form
from models.settings import WorkerSettings
from dependencies import get_settings, get_db

router = APIRouter(prefix = "/auth", tags=["Authentication"])

CACHE_EXPIRY_SECONDS = 5 * 60 # 5 minute expiry time

@router.post("/token", tags=["Authentication"])
async def authenticate_for_access_token(
    username: str = Form(...),
    password: str = Form(...),
    settings: WorkerSettings = Depends(get_settings), 
    db = Depends(get_db)
):
    if not settings.db or not settings.kv:
        raise HTTPException(500, "D1 or KV not configured")
    
    cached_email = await settings.kv.get(f"session:{password}")

    if cached_email and cached_email == username:
        return {"access_token": password, "token_type": "bearer"}

    query = """
        SELECT user.email 
        FROM user 
        JOIN session ON user.id = session.user_id
        WHERE user.email = ? 
          AND session.token = ? 
          AND user.role IN ('sponsor') 
          AND session.expires_at > (unixepoch() * 1000);
    """

    try:
        result = await db.prepare(query).bind(username, password).first()
    except:
        raise HTTPException(500, "Databse query failure")
    
    if not result:
        raise HTTPException(status_code=401, detail="Invalid session token or email")
        
    await settings.kv.put(f"session:{password}", result.email, expirationTtl=CACHE_EXPIRY_SECONDS)

    return {"access_token": password, "token_type": "bearer"} # swagger schema requirement