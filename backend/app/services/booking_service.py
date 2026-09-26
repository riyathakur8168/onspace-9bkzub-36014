import random
from datetime import datetime, timezone
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatusHistory
from app.models.request import ServiceRequest, WorkerOffer
from app.models.profile import WorkerProfile
from app.models.notification import NotificationType
from app.services.notification_service import send_notification

def generate_otp() -> str:
    return f"{random.randint(1000, 9999)}"

def create_booking_from_offer(
    db: Session,
    offer_id: int,
    worker_user_id: int
) -> Booking:

    # Transaction lock / check offer
    offer = db.query(WorkerOffer).filter(WorkerOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker offer not found")
        
    if offer.worker_id != worker_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Offer belongs to another worker")

    if offer.status != "offered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Offer is in '{offer.status}' state")

    request = db.query(ServiceRequest).filter(ServiceRequest.id == offer.request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    # Check if another booking already exists for this request
    existing_booking = db.query(Booking).filter(Booking.request_id == request.id).first()
    if existing_booking:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A booking has already been finalized for this request")

    # Generate OTP
    otp_code = generate_otp()
    request.otp_code = otp_code
    request.status = "accepted"

    # Accept this offer, expire all other offers for this request
    offer.status = "accepted"
    offer.responded_at = datetime.now(timezone.utc)

    other_offers = db.query(WorkerOffer).filter(
        WorkerOffer.request_id == request.id,
        WorkerOffer.id != offer.id
    ).all()
    for oo in other_offers:
        if oo.status == "offered":
            oo.status = "expired"

    # Create Booking
    booking = Booking(
        request_id=request.id,
        customer_id=request.customer_id,
        worker_id=worker_user_id,
        status="ACCEPTED",
        otp_code=otp_code,
        created_at=datetime.now(timezone.utc)
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Status History entry
    history = BookingStatusHistory(
        booking_id=booking.id,
        previous_status=None,
        new_status="ACCEPTED",
        changed_by_id=worker_user_id,
        note="Worker accepted offer. Booking created."
    )
    db.add(history)
    db.commit()

    # Send notifications
    send_notification(
        db=db,
        user_id=request.customer_id,
        type=NotificationType.OFFER_ACCEPTED,
        title="Booking Confirmed!",
        body=f"A worker has accepted your request for {request.service_label}. Your OTP is {otp_code}.",
        data={"booking_id": booking.id, "otp_code": otp_code}
    )

    return booking


def transition_booking_status(
    db: Session,
    booking: Booking,
    new_status: str,
    user_id: int,
    note: Optional[str] = None,
    otp_code: Optional[str] = None
) -> Booking:
    
    valid_transitions = {
        "ACCEPTED": ["EN_ROUTE", "ARRIVED", "CANCELLED"],
        "EN_ROUTE": ["ARRIVED", "CANCELLED"],
        "ARRIVED": ["IN_PROGRESS", "CANCELLED"],
        "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
        "COMPLETED": [],
        "CANCELLED": []
    }

    current = booking.status
    allowed = valid_transitions.get(current, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid transition from '{current}' to '{new_status}'"
        )

    now = datetime.now(timezone.utc)

    if new_status == "IN_PROGRESS":
        if not otp_code or otp_code.strip() != booking.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )
        booking.otp_verified_at = now
        booking.started_at = now

    elif new_status == "COMPLETED":
        booking.completed_at = now
        # Update worker profile earnings and completed jobs count
        worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == booking.worker_id).first()
        if worker_profile:
            request = db.query(ServiceRequest).filter(ServiceRequest.id == booking.request_id).first()
            earned = request.worker_share if request else 400.0
            worker_profile.completed_jobs_count += 1
            worker_profile.recent_earnings += earned
            db.commit()

    booking.status = new_status
    booking.updated_at = now
    
    # Update underlying request status
    request = db.query(ServiceRequest).filter(ServiceRequest.id == booking.request_id).first()
    if request:
        request.status = new_status.lower()

    history = BookingStatusHistory(
        booking_id=booking.id,
        previous_status=current,
        new_status=new_status,
        changed_by_id=user_id,
        note=note
    )
    db.add(history)
    db.commit()
    db.refresh(booking)

    # Send status update notification
    recipient_id = booking.customer_id if user_id == booking.worker_id else booking.worker_id
    send_notification(
        db=db,
        user_id=recipient_id,
        type=NotificationType.BOOKING_UPDATE,
        title=f"Booking Status: {new_status}",
        body=f"Your booking for request #{booking.request_id} is now {new_status}.",
        data={"booking_id": booking.id, "status": new_status}
    )

    return booking
