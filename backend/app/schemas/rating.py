from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class RatingCreate(BaseModel):
    booking_id: int
    rating_score: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class RatingResponse(BaseModel):
    id: int
    booking_id: int
    customer_id: int
    worker_id: int
    rating_score: float
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
