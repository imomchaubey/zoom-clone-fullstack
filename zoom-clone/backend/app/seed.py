"""Seed demo data once (idempotent). Runs on startup so ephemeral hosts (Render free) still have data."""
from datetime import timedelta
from sqlalchemy.orm import Session
from . import models
from .services.meeting_service import utcnow, generate_code


def seed(db: Session) -> None:
    if db.query(models.User).count():
        return
    me = models.User(id=1, name="Om Prakash", email="om@example.com", avatar_color="#0B5CFF")
    others = [models.User(name=n, email=f"{n.split()[0].lower()}@example.com", avatar_color=c)
              for n, c in [("Aarav Sharma", "#E8710A"), ("Priya Singh", "#188038"),
                           ("Rahul Verma", "#A142F4"), ("Neha Gupta", "#D93025")]]
    db.add_all([me, *others]); db.flush()

    now = utcnow()
    def mk(title, desc, delta, dur, status, kind="scheduled", host=me):
        m = models.Meeting(meeting_code=generate_code(db), title=title, description=desc,
                           host_id=host.id, type=kind, status=status,
                           scheduled_start=now + delta, duration_minutes=dur)
        db.add(m); db.flush(); return m

    # Upcoming
    mk("Weekly Team Sync", "Sprint progress and blockers", timedelta(hours=3), 30, "scheduled")
    mk("Project Review", "Review milestone deliverables", timedelta(days=1, hours=2), 60, "scheduled")
    mk("1:1 with Mentor", "Career guidance session", timedelta(days=2), 45, "scheduled")
    mk("Design Walkthrough", "Walk through new dashboard designs", timedelta(days=4, hours=5), 40, "scheduled")
    # Recent (ended) — default user attended each
    for title, delta, host in [("Daily Standup", timedelta(days=-1), me),
                               ("Client Demo", timedelta(days=-2, hours=-3), me),
                               ("Interview Prep Group", timedelta(days=-4), others[0]),
                               ("Retrospective", timedelta(days=-7), others[1])]:
        m = mk(title, "", delta, 40, "ended", kind="scheduled", host=host)
        db.add(models.Participant(meeting_id=m.id, user_id=me.id, display_name=me.name,
                                  role="host" if host is me else "participant",
                                  joined_at=m.scheduled_start, left_at=m.scheduled_start + timedelta(minutes=35)))
        db.add(models.Participant(meeting_id=m.id, user_id=others[2].id, display_name=others[2].name,
                                  joined_at=m.scheduled_start, left_at=m.scheduled_start + timedelta(minutes=35)))
    db.commit()
