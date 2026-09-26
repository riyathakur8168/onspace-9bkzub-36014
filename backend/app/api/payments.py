from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment, LedgerEntry
from app.schemas.payment import PaymentResponse, LedgerEntryResponse
from app.services.payment_service import create_payment_for_booking

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments & Ledger"],
)

class PaymentCreateRequest(BaseModel):
    booking_id: int
    amount: float
    gateway_provider: Optional[str] = "cashfree"

@router.post("", response_model=PaymentResponse)
def process_payment(
    data: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role == "customer" and booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    payment = create_payment_for_booking(
        db=db,
        booking_id=booking.id,
        amount=data.amount,
        gateway_provider=data.gateway_provider
    )
    return payment


@router.get("/ledger", response_model=List[LedgerEntryResponse])
def get_ledger_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        entries = db.query(LedgerEntry).order_by(LedgerEntry.created_at.desc()).all()
    else:
        entries = db.query(LedgerEntry).filter(
            LedgerEntry.user_id == current_user.id
        ).order_by(LedgerEntry.created_at.desc()).all()
    return entries
