from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import require_worker
from app.db.database import get_db
from app.models.user import User
from app.models.request import WorkerOffer
from app.schemas.request import WorkerOfferResponse
from app.schemas.booking import BookingResponse
from app.services.booking_service import create_booking_from_offer

router = APIRouter(
    prefix="/api/worker/offers",
    tags=["Worker Offers"],
)

@router.get("", response_model=List[WorkerOfferResponse])
def get_my_offers(
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    offers = db.query(WorkerOffer).filter(
        WorkerOffer.worker_id == current_user.id
    ).order_by(WorkerOffer.offered_at.desc()).all()
    return offers


@router.post("/{offer_id}/accept", response_model=BookingResponse)
def accept_offer(
    offer_id: int,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    booking = create_booking_from_offer(
        db=db,
        offer_id=offer_id,
        worker_user_id=current_user.id
    )
    return booking


@router.post("/{offer_id}/reject", response_model=WorkerOfferResponse)
def reject_offer(
    offer_id: int,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    offer = db.query(WorkerOffer).filter(
        WorkerOffer.id == offer_id,
        WorkerOffer.worker_id == current_user.id
    ).first()

    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.status != "offered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Offer is already in '{offer.status}' state")

    offer.status = "rejected"
    offer.responded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(offer)
    return offer
