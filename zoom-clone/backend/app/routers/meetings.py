from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services import meeting_service as svc

router = APIRouter(prefix="/api", tags=["meetings"])


def _get_meeting(db: Session, raw_code: str) -> models.Meeting:
    m = db.query(models.Meeting).filter_by(meeting_code=svc.normalize_code(raw_code)).first()
    if not m:
        raise HTTPException(404, "Invalid meeting ID. Check the ID and try again.")
    return m


def _require_host(db: Session, m: models.Meeting, requester_id: int) -> None:
    p = db.get(models.Participant, requester_id)
    if not p or p.meeting_id != m.id or p.role != "host" or p.left_at is not None:
        raise HTTPException(403, "Only the host can do this.")


@router.get("/me", response_model=schemas.UserOut)
def me(db: Session = Depends(get_db)):
    return db.get(models.User, svc.DEFAULT_USER_ID)


@router.get("/meetings/upcoming", response_model=List[schemas.MeetingOut])
def upcoming(db: Session = Depends(get_db)):
    return [svc.meeting_out(m) for m in svc.upcoming(db)]


@router.get("/meetings/recent", response_model=List[schemas.MeetingOut])
def recent(db: Session = Depends(get_db)):
    return [svc.meeting_out(m) for m in svc.recent(db)]


@router.post("/meetings/instant", response_model=schemas.MeetingOut, status_code=201)
def instant(body: schemas.InstantIn, db: Session = Depends(get_db)):
    return svc.meeting_out(svc.create_instant(db, body.title))


@router.post("/meetings/schedule", response_model=schemas.MeetingOut, status_code=201)
def schedule(body: schemas.ScheduleIn, db: Session = Depends(get_db)):
    return svc.meeting_out(svc.create_scheduled(db, body.title, body.description,
                                                body.start, body.duration_minutes))


@router.get("/meetings/lookup", response_model=schemas.MeetingOut)
def lookup(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Join box: accepts a raw ID ('845 1234 5678') or a full invite link."""
    return svc.meeting_out(_get_meeting(db, q))


@router.get("/meetings/{code}", response_model=schemas.MeetingOut)
def get_meeting(code: str, db: Session = Depends(get_db)):
    return svc.meeting_out(_get_meeting(db, code))


@router.post("/meetings/{code}/join", response_model=schemas.JoinOut)
def join(code: str, body: schemas.JoinIn, db: Session = Depends(get_db)):
    m = _get_meeting(db, code)
    if m.status == "ended":
        raise HTTPException(410, "This meeting has ended.")
    is_host = body.as_host and m.host_id == svc.DEFAULT_USER_ID
    p = models.Participant(meeting_id=m.id, display_name=body.display_name.strip(),
                           user_id=svc.DEFAULT_USER_ID if is_host else None,
                           role="host" if is_host else "participant")
    m.status = "live"
    db.add(p); db.commit(); db.refresh(p)
    return {"participant": p, "meeting": svc.meeting_out(m)}


@router.get("/meetings/{code}/participants", response_model=List[schemas.ParticipantOut])
def participants(code: str, db: Session = Depends(get_db)):
    m = _get_meeting(db, code)
    return (db.query(models.Participant)
            .filter_by(meeting_id=m.id, left_at=None).order_by(models.Participant.joined_at).all())


@router.post("/meetings/{code}/leave", status_code=204)
def leave(code: str, participant_id: int = Query(...), db: Session = Depends(get_db)):
    m = _get_meeting(db, code)
    p = db.get(models.Participant, participant_id)
    if p and p.meeting_id == m.id and p.left_at is None:
        p.left_at = svc.utcnow(); db.commit()


# ---- Host controls (bonus) ----
@router.post("/meetings/{code}/mute-all", status_code=204)
def mute_all(code: str, requester_id: int = Query(...), db: Session = Depends(get_db)):
    m = _get_meeting(db, code); _require_host(db, m, requester_id)
    (db.query(models.Participant)
       .filter(models.Participant.meeting_id == m.id, models.Participant.role != "host",
               models.Participant.left_at.is_(None))
       .update({"is_muted": True}))
    db.commit()


@router.delete("/meetings/{code}/participants/{participant_id}", status_code=204)
def remove_participant(code: str, participant_id: int, requester_id: int = Query(...),
                       db: Session = Depends(get_db)):
    m = _get_meeting(db, code); _require_host(db, m, requester_id)
    target = db.get(models.Participant, participant_id)
    if not target or target.meeting_id != m.id: raise HTTPException(404, "Participant not found.")
    if target.role == "host": raise HTTPException(400, "Host cannot be removed.")
    target.left_at = svc.utcnow(); db.commit()


@router.post("/meetings/{code}/end", status_code=204)
def end_meeting(code: str, requester_id: int = Query(...), db: Session = Depends(get_db)):
    m = _get_meeting(db, code); _require_host(db, m, requester_id)
    now = svc.utcnow(); m.status = "ended"
    (db.query(models.Participant)
       .filter(models.Participant.meeting_id == m.id, models.Participant.left_at.is_(None))
       .update({"left_at": now}))
    db.commit()
