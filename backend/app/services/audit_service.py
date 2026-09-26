import json
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_action(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    actor_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    metadata_json = json.dumps(metadata) if metadata else None
    audit_entry = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata_json,
        ip_address=ip_address
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
