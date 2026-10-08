"""Database schema: users 1—N meetings (as host), meetings 1—N participants."""
from datetime import datetime
from sqlalchemy import (Column, Integer, String, Text, DateTime, ForeignKey,
                        Boolean, CheckConstraint, Index)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    avatar_color = Column(String(9), default="#0B5CFF")
    created_at = Column(DateTime, default=datetime.utcnow)

    hosted_meetings = relationship("Meeting", back_populates="host")


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint("type IN ('instant','scheduled')", name="ck_meeting_type"),
        CheckConstraint("status IN ('scheduled','live','ended')", name="ck_meeting_status"),
        Index("ix_meetings_type_start", "type", "scheduled_start"),
    )
    id = Column(Integer, primary_key=True)
    meeting_code = Column(String(11), unique=True, index=True, nullable=False)  # 11 digits
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(10), nullable=False)
    scheduled_start = Column(DateTime, nullable=True)   # stored as naive UTC
    duration_minutes = Column(Integer, default=40)
    status = Column(String(10), nullable=False, default="scheduled")
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="hosted_meetings")
    participants = relationship("Participant", back_populates="meeting",
                                cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (CheckConstraint("role IN ('host','participant')", name="ck_participant_role"),)
    id = Column(Integer, primary_key=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL = guest
    display_name = Column(String(100), nullable=False)
    role = Column(String(12), nullable=False, default="participant")
    is_muted = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)  # NULL = still in the meeting

    meeting = relationship("Meeting", back_populates="participants")
