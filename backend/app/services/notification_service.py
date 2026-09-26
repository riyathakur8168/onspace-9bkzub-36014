import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType

def send_notification(
    db: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None
) -> Notification:
    data_json = json.dumps(data) if data else None
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data_json=data_json,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
