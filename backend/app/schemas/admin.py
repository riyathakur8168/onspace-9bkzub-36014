from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    metadata_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminDashboardSummary(BaseModel):
    total_users: int
    total_customers: int
    total_workers: int
    pending_verifications: int
    total_requests: int
    active_bookings: int
    completed_bookings: int
    total_revenue: float
