"""Pydantic request/response models (the API contract)."""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, field_serializer, field_validator


def _utc_iso(dt: Optional[datetime]) -> Optional[str]:
    # DB stores naive UTC; append Z so the browser parses it correctly.
    return dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z") if dt else None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_color: str
    model_config = {"from_attributes": True}


class MeetingOut(BaseModel):
    id: int
    meeting_code: str
    formatted_code: str          # "845 1234 5678"
    title: str
    description: str
    type: str
    status: str
    scheduled_start: Optional[datetime]
    duration_minutes: int
    host_name: str
    join_url: str

    @field_serializer("scheduled_start")
    def _ser(self, v): return _utc_iso(v)


class ScheduleIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    start: datetime               # ISO string from the frontend (UTC)
    duration_minutes: int = Field(ge=5, le=1440, default=40)

    @field_validator("title")
    @classmethod
    def _strip(cls, v):
        v = v.strip()
        if not v: raise ValueError("Title cannot be empty")
        return v


class InstantIn(BaseModel):
    title: Optional[str] = None


class JoinIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    as_host: bool = False         # only honoured if default user is the meeting host


class ParticipantOut(BaseModel):
    id: int
    display_name: str
    role: str
    is_muted: bool
    joined_at: datetime
    model_config = {"from_attributes": True}

    @field_serializer("joined_at")
    def _ser(self, v): return _utc_iso(v)


class JoinOut(BaseModel):
    participant: ParticipantOut
    meeting: MeetingOut
