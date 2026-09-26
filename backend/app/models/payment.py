import enum
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class PaymentStatus(str, enum.Enum):
    CREATED = "created"
    PENDING = "pending"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"
    DISPUTED = "disputed"

class LedgerEntryType(str, enum.Enum):
    BOOKING_PAYMENT = "booking_payment"
    WORKER_PAYOUT = "worker_payout"
    PLATFORM_FEE = "platform_fee"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"

class LedgerDirection(str, enum.Enum):
    DEBIT = "debit"
    CREDIT = "credit"

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.CREATED, nullable=False)
    gateway_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    gateway_transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    booking = relationship("Booking", back_populates="payments")
    customer = relationship("User", foreign_keys=[customer_id])
    ledger_entries = relationship("LedgerEntry", back_populates="payment", cascade="all, delete-orphan")


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    payment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("payments.id", ondelete="SET NULL"), nullable=True, index=True)
    booking_id: Mapped[Optional[int]] = mapped_column(ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    entry_type: Mapped[LedgerEntryType] = mapped_column(Enum(LedgerEntryType), nullable=False)
    direction: Mapped[LedgerDirection] = mapped_column(Enum(LedgerDirection), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reference_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    payment = relationship("Payment", back_populates="ledger_entries")
    booking = relationship("Booking")
    user = relationship("User")
