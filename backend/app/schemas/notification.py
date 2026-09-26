from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.notification import NotificationType

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    body: str
    data_json: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
