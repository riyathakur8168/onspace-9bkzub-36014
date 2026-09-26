from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ServiceRequestCreate(BaseModel):
    service_id: Optional[int] = None
    service_label: str
    issue_description: str
    address: str
    city: str
    pincode: Optional[str] = None
    locality: Optional[str] = None
    preferred_slot: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: int
    customer_id: int
    service_id: Optional[int] = None
    service_label: str
    issue_description: str
    address: str
    city: str
    pincode: Optional[str] = None
    locality: Optional[str] = None
    preferred_slot: Optional[str] = None
    status: str
    service_value: float
    worker_share: float
    otp_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkerOfferResponse(BaseModel):
    id: int
    request_id: int
    worker_id: int
    status: str
    offered_at: datetime
    responded_at: Optional[datetime] = None
    matching_score: float
    selection_reason: Optional[str] = None
    request: Optional[ServiceRequestResponse] = None

    model_config = ConfigDict(from_attributes=True)
