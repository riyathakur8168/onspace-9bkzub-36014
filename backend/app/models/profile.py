from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Cooperative(Base):
    __tablename__ = "cooperatives"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Karnataka")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    worker_profiles: Mapped[List["WorkerProfile"]] = relationship(
        "WorkerProfile", back_populates="cooperative"
    )


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Bengaluru")
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    profile_completion_state: Mapped[str] = mapped_column(String(30), default="COMPLETED", nullable=False)
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

    user: Mapped["User"] = relationship("User", back_populates="customer_profile")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    cooperative_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("cooperatives.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    primary_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    experience: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    service_area: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Verification & Personal Details
    father_or_guardian_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    dob: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    aadhaar_last4: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    village_or_town: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Karnataka")
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    society_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # Operational & Eligibility Flags
    availability_status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    verification_state: Mapped[str] = mapped_column(
        String(30), default="PROFILE_CREATED", nullable=False
    )  # PROFILE_CREATED, VERIFICATION_PENDING, UNDER_REVIEW, VERIFIED, REJECTED, RE_UPLOAD_REQUIRED
    
    work_slip_status: Mapped[str] = mapped_column(
        String(30), default="not_uploaded", nullable=False
    )  # not_uploaded, uploaded, under_review, approved, re_upload_required
    
    skill_certificate_status: Mapped[str] = mapped_column(
        String(30), default="not_submitted", nullable=False
    )  # not_submitted, pending, uploaded, under_review, verified, rejected
    
    has_skill_certificate_commitment: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    certificate_commitment_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    certificate_deadline_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Performance & Opportunity Allocation Metrics
    recent_earnings: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_jobs_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    admin_approval_status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
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

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="worker_profile")
    cooperative: Mapped[Optional["Cooperative"]] = relationship("Cooperative", back_populates="worker_profiles")
    worker_skills: Mapped[List["WorkerSkill"]] = relationship("WorkerSkill", back_populates="worker_profile", cascade="all, delete-orphan")
    service_areas: Mapped[List["WorkerServiceArea"]] = relationship("WorkerServiceArea", back_populates="worker_profile", cascade="all, delete-orphan")
    work_slips: Mapped[List["WorkSlip"]] = relationship("WorkSlip", back_populates="worker_profile", cascade="all, delete-orphan")
    skill_certificates: Mapped[List["SkillCertificate"]] = relationship("SkillCertificate", back_populates="worker_profile", cascade="all, delete-orphan")


class WorkerServiceArea(Base):
    __tablename__ = "worker_service_areas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    locality: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="Bengaluru")
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    radius_km: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    worker_profile: Mapped["WorkerProfile"] = relationship("WorkerProfile", back_populates="service_areas")
