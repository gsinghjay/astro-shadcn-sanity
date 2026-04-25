from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

COLOR_PRESETS = {
    "green": 0x2ECC71, 
    "red": 0xE74C3C, 
    "gold": 0xF1C40F,
    "blue": 0x3498DB, 
    "purple": 0x9B59B6,
}

class EmbedField(BaseModel):
    name: str
    value: str
    inline: bool = True

class DiscordNotification(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    channel: str = Field(description="Channel name (mapped to webhook URL in KV)")
    title: str
    message: str
    color: str = "blue"
    fields: Optional[List[EmbedField]] = None
    async_mode: bool = Field(default=False, alias="async")

class NotificationResult(BaseModel):
    channel: str
    sent: bool
    message: str = "Notification sent"