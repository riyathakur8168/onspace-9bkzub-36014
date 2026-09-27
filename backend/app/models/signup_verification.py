from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SignupVerificationSession(Base):
    __tablename__ = "signup_verification_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    # Aadhaar verification tracking
    aadhaar_number_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    aadhaar_client_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    aadhaar_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    aadhaar_verification_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    aadhaar_otp_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    aadhaar_otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    aadhaar_otp_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_aadhaar_otp_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    dev_aadhaar_otp: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Email verification tracking
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_otp_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email_otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_otp_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_email_otp_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    dev_email_otp: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Normal Phone OTP verification tracking
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    phone_otp_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone_otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    phone_otp_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_phone_otp_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    dev_phone_otp: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

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
