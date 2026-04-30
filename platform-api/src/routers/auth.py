from fastapi import APIRouter

router = APIRouter(prefix = "/auth", tags=["Authentication"])

@router.post("/token", tags=["Authentication"])
async def authenticate_for_access_token(username: str, password: str):
    raise NotImplementedError # not implemented, change this