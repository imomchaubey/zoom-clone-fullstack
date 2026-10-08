"""Business logic, kept out of the router so it is reusable and testable."""
import os, re, secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
DEFAULT_USER_ID = 1  # assignment: "assume a default user is logged in"


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def generate_code(db: Session) -> str:
    """11 digits like Zoom (starts with 8/9). Retry on the (very unlikely) collision."""
    while True:
        code = secrets.choice("89") + "".join(secrets.choice("0123456789") for _ in range(10))
        if not db.query(models.Meeting).filter_by(meeting_code=code).first():
            return code


def normalize_code(raw: str) -> str:
    """Accepts '84512345678', '845 1234 5678', or a full invite link .../j/84512345678?pwd=..."""
    m = re.search(r"/j/([\d\s-]+)", raw)
    return re.sub(r"\D", "", m.group(1) if m else raw)


def format_code(code: str) -> str:
    return f"{code[:3]} {code[3:7]} {code[7:]}" if len(code) == 11 else code


def meeting_out(m: models.Meeting) -> dict:
    return {
        "id": m.id, "meeting_code": m.meeting_code, "formatted_code": format_code(m.meeting_code),
        "title": m.title, "description": m.description or "", "type": m.type, "status": m.status,
        "scheduled_start": m.scheduled_start, "duration_minutes": m.duration_minutes,
        "host_name": m.host.name, "join_url": f"{FRONTEND_URL}/j/{m.meeting_code}",
    }


def create_instant(db: Session, title: str | None) -> models.Meeting:
    user = db.get(models.User, DEFAULT_USER_ID)
    m = models.Meeting(meeting_code=generate_code(db), title=title or f"{user.name}'s Meeting",
                       host_id=user.id, type="instant", status="live",
                       scheduled_start=utcnow(), duration_minutes=40)
    db.add(m); db.commit(); db.refresh(m)
    return m


def create_scheduled(db: Session, title, description, start, duration) -> models.Meeting:
    m = models.Meeting(meeting_code=generate_code(db), title=title, description=description,
                       host_id=DEFAULT_USER_ID, type="scheduled", status="scheduled",
                       scheduled_start=to_naive_utc(start), duration_minutes=duration)
    db.add(m); db.commit(); db.refresh(m)
    return m


def upcoming(db: Session):
    return (db.query(models.Meeting)
            .filter(models.Meeting.type == "scheduled", models.Meeting.status == "scheduled",
                    models.Meeting.host_id == DEFAULT_USER_ID,
                    models.Meeting.scheduled_start >= utcnow())
            .order_by(models.Meeting.scheduled_start.asc()).all())


def recent(db: Session, limit: int = 10):
    """Meetings the default user hosted or attended and that have started/ended."""
    attended = (db.query(models.Participant.meeting_id)
                .filter(models.Participant.user_id == DEFAULT_USER_ID))
    return (db.query(models.Meeting)
            .filter(or_(models.Meeting.host_id == DEFAULT_USER_ID, models.Meeting.id.in_(attended)),
                    or_(models.Meeting.status.in_(["live", "ended"]),
                        models.Meeting.scheduled_start < utcnow()))
            .order_by(models.Meeting.scheduled_start.desc()).limit(limit).all())
