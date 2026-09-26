from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import require_customer
from app.db.database import get_db
from app.models.user import User
from app.models.booking import Booking, Rating
from app.models.profile import WorkerProfile
from app.schemas.rating import RatingCreate, RatingResponse

router = APIRouter(
    prefix="/api/ratings",
    tags=["Ratings"],
)

@router.post("", response_model=RatingResponse)
def create_rating(
    data: RatingCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only booking customer can leave a rating")

    if booking.status != "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating is only allowed for completed bookings")

    existing_rating = db.query(Rating).filter(Rating.booking_id == booking.id).first()
    if existing_rating:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A rating has already been submitted for this booking")

    rating = Rating(
        booking_id=booking.id,
        customer_id=current_user.id,
        worker_id=booking.worker_id,
        rating_score=data.rating_score,
        comment=data.comment,
        created_at=datetime.now(timezone.utc)
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    # Recalculate average worker rating
    worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == booking.worker_id).first()
    if worker_profile:
        all_ratings = db.query(Rating).filter(Rating.worker_id == booking.worker_id).all()
        if all_ratings:
            avg_score = sum(r.rating_score for r in all_ratings) / len(all_ratings)
            worker_profile.rating = round(avg_score, 1)
            db.commit()

    return rating
