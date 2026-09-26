from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import get_current_user, require_customer
from app.db.database import get_db
from app.models.user import User
from app.models.profile import CustomerProfile
from app.schemas.profile import CustomerProfileCreate, CustomerProfileUpdate, CustomerProfileResponse

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)

@router.get("/me", response_model=CustomerProfileResponse)
def get_my_customer_profile(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        # Auto-create initial profile if none exists
        profile = CustomerProfile(
            user_id=current_user.id,
            phone=current_user.phone,
            profile_completion_state="incomplete"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=CustomerProfileResponse)
def update_my_customer_profile(
    data: CustomerProfileUpdate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)
    
    if data.phone is not None:
        profile.phone = data.phone
        current_user.phone = data.phone
    if data.address is not None:
        profile.address = data.address
    if data.city is not None:
        profile.city = data.city
    if data.pincode is not None:
        profile.pincode = data.pincode
    if data.latitude is not None:
        profile.latitude = data.latitude
    if data.longitude is not None:
        profile.longitude = data.longitude

    if profile.phone and profile.address and profile.city:
        profile.profile_completion_state = "complete"
    else:
        profile.profile_completion_state = "incomplete"

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile
