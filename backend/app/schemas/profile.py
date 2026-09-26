from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class CustomerProfileBase(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfileUpdate(CustomerProfileBase):
    pass

class CustomerProfileResponse(CustomerProfileBase):
    id: int
    user_id: int
    profile_completion_state: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkerServiceAreaSchema(BaseModel):
    id: Optional[int] = None
    locality: str
    city: str
    pincode: Optional[str] = None
    radius_km: float = 10.0

    model_config = ConfigDict(from_attributes=True)


class WorkerProfileBase(BaseModel):
    name: str
    phone: str
    avatar: Optional[str] = None
    primary_skill: str
    experience: Optional[str] = None
    bio: Optional[str] = None
    service_area: Optional[str] = None
    father_or_guardian_name: Optional[str] = None
    dob: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    village_or_town: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    society_name: Optional[str] = None
    cooperative_id: Optional[int] = None

class WorkerProfileCreate(WorkerProfileBase):
    has_skill_certificate_commitment: bool = False

class WorkerProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    primary_skill: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    service_area: Optional[str] = None
    father_or_guardian_name: Optional[str] = None
    dob: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    village_or_town: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    society_name: Optional[str] = None
    availability_status: Optional[bool] = None

class WorkerProfileResponse(WorkerProfileBase):
    id: int
    user_id: int
    availability_status: bool
    verification_state: str
    work_slip_status: str
    skill_certificate_status: str
    has_skill_certificate_commitment: bool
    certificate_commitment_date: Optional[datetime] = None
    certificate_deadline_date: Optional[datetime] = None
    recent_earnings: float
    completed_jobs_count: int
    rating: float
    admin_approval_status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    service_areas: List[WorkerServiceAreaSchema] = []

    model_config = ConfigDict(from_attributes=True)
