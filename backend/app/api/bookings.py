from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.schemas.booking import BookingResponse, OTPVerifyRequest
from app.services.booking_service import transition_booking_status

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
)

@router.get("", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "customer":
        bookings = db.query(Booking).filter(Booking.customer_id == current_user.id).order_by(Booking.created_at.desc()).all()
    elif current_user.role == "worker":
        bookings = db.query(Booking).filter(Booking.worker_id == current_user.id).order_by(Booking.created_at.desc()).all()
    else:
        bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_by_id(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role == "customer" and booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "worker" and booking.worker_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return booking


@router.post("/{booking_id}/arrive", response_model=BookingResponse)
def mark_arrived(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return transition_booking_status(
        db=db,
        booking=booking,
        new_status="ARRIVED",
        user_id=current_user.id,
        note="Worker arrived at service location"
    )


@router.post("/{booking_id}/start", response_model=BookingResponse)
def start_booking_with_otp(
    booking_id: int,
    data: OTPVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return transition_booking_status(
        db=db,
        booking=booking,
        new_status="IN_PROGRESS",
        user_id=current_user.id,
        note="Worker started job with verified customer OTP",
        otp_code=data.otp_code
    )


@router.post("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return transition_booking_status(
        db=db,
        booking=booking,
        new_status="COMPLETED",
        user_id=current_user.id,
        note="Job completed successfully"
    )


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return transition_booking_status(
        db=db,
        booking=booking,
        new_status="CANCELLED",
        user_id=current_user.id,
        note=f"Booking cancelled by {current_user.role}"
    )
