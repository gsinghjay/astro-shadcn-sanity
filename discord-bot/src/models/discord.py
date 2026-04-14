"""
Pydantic v2 models for Discord interaction request and response payloads.
https://discord.com/developers/docs/interactions/receiving-and-responding
"""

from enum import IntEnum
from typing import Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class InteractionType(IntEnum):
    """Discord interaction types."""
    PING = 1
    APPLICATION_COMMAND = 2
    MESSAGE_COMPONENT = 3


class InteractionResponseType(IntEnum):
    """Discord interaction response types."""
    PONG = 1
    CHANNEL_MESSAGE_WITH_SOURCE = 4
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5
    DEFERRED_UPDATE_MESSAGE = 6
    UPDATE_MESSAGE = 7


class ComponentType(IntEnum):
    """Discord message component types."""
    ACTION_ROW = 1
    BUTTON = 2
    STRING_SELECT = 3


# ---------------------------------------------------------------------------
# Shared sub-models
# ---------------------------------------------------------------------------

class User(BaseModel):
    """Represents a Discord user."""
    id: str
    username: str
    discriminator: str
    global_name: str | None = None
    avatar: str | None = None


class Member(BaseModel):
    """Represents a Discord guild member."""
    user: User | None = None
    roles: list[str] = Field(default_factory=list)
    nick: str | None = None


class ApplicationCommandOption(BaseModel):
    """Represents an option passed to a slash command."""
    name: str
    type: int
    value: str | int | float | bool | None = None
    options: list["ApplicationCommandOption"] = Field(default_factory=list)


class ApplicationCommandData(BaseModel):
    """Data payload for an APPLICATION_COMMAND interaction."""
    id: str
    name: str
    type: int
    options: list[ApplicationCommandOption] = Field(default_factory=list)


class MessageComponentData(BaseModel):
    """Data payload for a MESSAGE_COMPONENT interaction."""
    custom_id: str
    component_type: ComponentType
    values: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class PingInteraction(BaseModel):
    """Interaction model for a PING request from Discord."""
    id: str
    application_id: str
    type: InteractionType
    token: str
    version: int = 1


class ApplicationCommandInteraction(BaseModel):
    """Interaction model for a slash command invocation."""
    id: str
    application_id: str
    type: InteractionType
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: ApplicationCommandData


class MessageComponentInteraction(BaseModel):   
    """Interaction model for a button or dropdown interaction."""
    id: str
    application_id: str
    type: InteractionType
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: MessageComponentData
    message: dict[str, Any] = Field(default_factory=dict)


class Interaction(BaseModel):
    """Generic interaction model used for initial parsing at the route level."""
    id: str
    application_id: str
    type: InteractionType
    token: str
    version: int = 1
    guild_id: str | None = None
    channel_id: str | None = None
    member: Member | None = None
    user: User | None = None
    data: dict[str, Any] = Field(default_factory=dict)
    message: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class EmbedFooter(BaseModel):
    """Footer section of a Discord embed."""
    text: str
    icon_url: str | None = None


class EmbedImage(BaseModel):
    """Image or thumbnail in a Discord embed."""
    url: str


class EmbedField(BaseModel):
    """A single field in a Discord embed."""
    name: str
    value: str
    inline: bool = False


class Embed(BaseModel):
    """A Discord embed object for rich message formatting."""
    title: str | None = None
    description: str | None = None
    url: str | None = None
    color: int | None = None
    footer: EmbedFooter | None = None
    image: EmbedImage | None = None
    thumbnail: EmbedImage | None = None
    fields: list[EmbedField] = Field(default_factory=list)


class MessageResponseData(BaseModel):
    """Data payload for a message response to a Discord interaction."""
    content: str | None = None
    embeds: list[Embed] = Field(default_factory=list)
    flags: int = 0

    @classmethod
    def ephemeral(cls, content: str) -> "MessageResponseData":
        """Create an ephemeral message response visible only to the invoking user.

        Args:
            content: The message content to display.

        Returns:
            A MessageResponseData instance with the ephemeral flag set.
        """
        return cls(content=content, flags=64)


class ImmediateResponse(BaseModel):
    """Send a message immediately in response to an interaction."""
    type: InteractionResponseType = InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    data: MessageResponseData


class DeferredResponse(BaseModel):
    """Acknowledge the interaction now; send the actual message later via followup."""
    type: InteractionResponseType = InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    data: dict[str, Any] = Field(default_factory=dict)


class PongResponse(BaseModel):
    """ACK a PING interaction."""
    type: InteractionResponseType = InteractionResponseType.PONG