"""
Pydantic v2 models for Discord interaction request and response payloads.
https://discord.com/developers/docs/interactions/receiving-and-responding
"""

from enum import IntEnum
from typing import Any
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class InteractionType(IntEnum):
    PING = 1
    APPLICATION_COMMAND = 2
    MESSAGE_COMPONENT = 3


class InteractionResponseType(IntEnum):
    PONG = 1                      # ACK a Ping
    CHANNEL_MESSAGE_WITH_SOURCE = 4  # immediate message response
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5  # deferred message response
    DEFERRED_UPDATE_MESSAGE = 6   # deferred update for components
    UPDATE_MESSAGE = 7            # immediate update for components


class ComponentType(IntEnum):
    ACTION_ROW = 1
    BUTTON = 2
    STRING_SELECT = 3


# ---------------------------------------------------------------------------
# Shared sub-models
# ---------------------------------------------------------------------------

class User(BaseModel):
    id: str
    username: str
    discriminator: str
    global_name: str | None = None
    avatar: str | None = None


class Member(BaseModel):
    user: User | None = None
    roles: list[str] = []
    nick: str | None = None


class ApplicationCommandOption(BaseModel):
    name: str
    type: int
    value: str | int | float | bool | None = None
    options: list["ApplicationCommandOption"] = []


class ApplicationCommandData(BaseModel):
    id: str
    name: str
    type: int
    options: list[ApplicationCommandOption] = []


class MessageComponentData(BaseModel):
    custom_id: str
    component_type: ComponentType
    values: list[str] = []


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class PingInteraction(BaseModel):
    id: str
    application_id: str
    type: InteractionType  # always InteractionType.PING
    token: str
    version: int = 1


class ApplicationCommandInteraction(BaseModel):
    id: str
    application_id: str
    type: InteractionType  # always InteractionType.APPLICATION_COMMAND
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: ApplicationCommandData


class MessageComponentInteraction(BaseModel):
    id: str
    application_id: str
    type: InteractionType  # always InteractionType.MESSAGE_COMPONENT
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: MessageComponentData
    message: dict[str, Any] = {}


# Generic interaction used at the FastAPI route level for initial parsing
class Interaction(BaseModel):
    id: str
    application_id: str
    type: InteractionType
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: dict[str, Any] = {}
    message: dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class EmbedFooter(BaseModel):
    text: str
    icon_url: str | None = None


class EmbedImage(BaseModel):
    url: str


class EmbedField(BaseModel):
    name: str
    value: str
    inline: bool = False


class Embed(BaseModel):
    title: str | None = None
    description: str | None = None
    url: str | None = None
    color: int | None = None
    footer: EmbedFooter | None = None
    image: EmbedImage | None = None
    thumbnail: EmbedImage | None = None
    fields: list[EmbedField] = []


class MessageResponseData(BaseModel):
    content: str | None = None
    embeds: list[Embed] = []
    ephemeral: bool = False  # if True, only the invoking user sees the message

    def model_post_init(self, __context: Any) -> None:
        if self.ephemeral:
            # Discord uses flags=64 for ephemeral messages
            object.__setattr__(self, "_flags", 64)


class ImmediateResponse(BaseModel):
    """Send a message immediately in response to an interaction."""
    type: InteractionResponseType = InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    data: MessageResponseData


class DeferredResponse(BaseModel):
    """Acknowledge the interaction now; send the actual message later via followup."""
    type: InteractionResponseType = InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    data: dict[str, Any] = {}


class PongResponse(BaseModel):
    """ACK a PING interaction."""
    type: InteractionResponseType = InteractionResponseType.PONG