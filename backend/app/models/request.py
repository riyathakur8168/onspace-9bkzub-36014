from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True
    )
    service_label: Mapped[str] = mapped_column(String(100), nullable=False)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="Bengaluru", nullable=False)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    locality: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_slot: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="MATCHING", nullable=False, index=True
    )  # REQUESTED, MATCHING, OFFERED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED, DISPUTED
    
    service_value: Mapped[float] = mapped_column(Float, default=500.0, nullable=False)
    worker_share: Mapped[float] = mapped_column(Float, default=425.0, nullable=False)
    otp_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

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
    customer: Mapped["User"] = relationship("User", foreign_keys=[customer_id])
    offers: Mapped[List["WorkerOffer"]] = relationship("WorkerOffer", back_populates="request", cascade="all, delete-orphan")
    booking: Mapped[Optional["Booking"]] = relationship("Booking", back_populates="request", uselist=False)


class WorkerOffer(Base):
    __tablename__ = "worker_offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    worker_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="OFFERED", nullable=False, index=True
    )  # OFFERED, ACCEPTED, DECLINED, EXPIRED, CANCELLED
    offered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    matching_score: Mapped[float] = mapped_column(Float, default=90.0, nullable=False)
    selection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    request: Mapped["ServiceRequest"] = relationship("ServiceRequest", back_populates="offers")
    worker: Mapped["User"] = relationship("User", foreign_keys=[worker_id])
