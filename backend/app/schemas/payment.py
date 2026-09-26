from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentStatus, LedgerEntryType, LedgerDirection

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    customer_id: int
    amount: float
    currency: str
    status: PaymentStatus
    gateway_provider: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LedgerEntryResponse(BaseModel):
    id: int
    payment_id: Optional[int] = None
    booking_id: Optional[int] = None
    user_id: Optional[int] = None
    amount: float
    entry_type: LedgerEntryType
    direction: LedgerDirection
    description: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
