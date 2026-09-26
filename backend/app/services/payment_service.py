from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentStatus, LedgerEntry, LedgerEntryType, LedgerDirection
from app.models.booking import Booking
from app.models.request import ServiceRequest

def create_payment_for_booking(
    db: Session,
    booking_id: int,
    amount: float,
    currency: str = "INR",
    gateway_provider: Optional[str] = "cashfree_mock",
    gateway_transaction_id: Optional[str] = None
) -> Payment:

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found")

    payment = Payment(
        booking_id=booking.id,
        customer_id=booking.customer_id,
        amount=amount,
        currency=currency,
        status=PaymentStatus.CAPTURED, # Server authoritative payment state
        gateway_provider=gateway_provider,
        gateway_transaction_id=gateway_transaction_id or f"TXN_{booking.id}_{int(datetime.now().timestamp())}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Immutable Ledger Entry 1: Customer Debit
    ledger_debit = LedgerEntry(
        payment_id=payment.id,
        booking_id=booking.id,
        user_id=booking.customer_id,
        amount=amount,
        entry_type=LedgerEntryType.BOOKING_PAYMENT,
        direction=LedgerDirection.DEBIT,
        description=f"Payment for Booking #{booking.id}",
        reference_id=payment.gateway_transaction_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(ledger_debit)

    # Immutable Ledger Entry 2: Worker Credit (Share)
    request = db.query(ServiceRequest).filter(ServiceRequest.id == booking.request_id).first()
    worker_share = request.worker_share if request else amount * 0.8
    ledger_credit = LedgerEntry(
        payment_id=payment.id,
        booking_id=booking.id,
        user_id=booking.worker_id,
        amount=worker_share,
        entry_type=LedgerEntryType.WORKER_PAYOUT,
        direction=LedgerDirection.CREDIT,
        description=f"Worker share for Booking #{booking.id}",
        reference_id=payment.gateway_transaction_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(ledger_credit)

    # Immutable Ledger Entry 3: Platform Fee
    platform_fee = amount - worker_share
    ledger_platform = LedgerEntry(
        payment_id=payment.id,
        booking_id=booking.id,
        user_id=None,
        amount=platform_fee,
        entry_type=LedgerEntryType.PLATFORM_FEE,
        direction=LedgerDirection.CREDIT,
        description=f"Platform cooperative fee for Booking #{booking.id}",
        reference_id=payment.gateway_transaction_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(ledger_platform)

    db.commit()
    return payment
