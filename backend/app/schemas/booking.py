from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.request import ServiceRequestResponse

class OTPVerifyRequest(BaseModel):
    otp_code: str

class BookingStatusHistoryResponse(BaseModel):
    id: int
    booking_id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by_id: Optional[int] = None
    note: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    id: int
    request_id: int
    customer_id: int
    worker_id: int
    status: str
    otp_code: Optional[str] = None
    otp_verified_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    request: Optional[ServiceRequestResponse] = None
    history: List[BookingStatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)
