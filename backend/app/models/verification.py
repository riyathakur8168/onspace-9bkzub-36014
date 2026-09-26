from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkSlip(Base):
    __tablename__ = "work_slips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(30), default="under_review", nullable=False
    )  # not_uploaded, uploaded, under_review, approved, re_upload_required
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    worker_profile: Mapped["WorkerProfile"] = relationship("WorkerProfile", back_populates="work_slips")


class SkillCertificate(Base):
    __tablename__ = "skill_certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    certificate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(30), default="uploaded", nullable=False
    )  # not_submitted, pending, uploaded, under_review, verified, rejected
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    worker_profile: Mapped["WorkerProfile"] = relationship("WorkerProfile", back_populates="skill_certificates")


class WorkerVerification(Base):
    __tablename__ = "worker_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("worker_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    overall_status: Mapped[str] = mapped_column(String(30), default="UNDER_REVIEW", nullable=False)
    work_slip_status: Mapped[str] = mapped_column(String(30), default="not_uploaded", nullable=False)
    certificate_status: Mapped[str] = mapped_column(String(30), default="not_submitted", nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
