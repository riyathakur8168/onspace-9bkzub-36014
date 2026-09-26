from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import get_current_user, require_customer
from app.db.database import get_db
from app.models.user import User
from app.models.request import ServiceRequest
from app.models.skill import Service
from app.schemas.request import ServiceRequestCreate, ServiceRequestResponse
from app.services.matching_engine import find_and_offer_eligible_workers

router = APIRouter(
    prefix="/api/requests",
    tags=["Service Requests"],
)

@router.post("", response_model=ServiceRequestResponse)
def create_service_request(
    data: ServiceRequestCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    service_val = 500.0
    worker_sh = 400.0

    if data.service_id:
        srv = db.query(Service).filter(Service.id == data.service_id).first()
        if srv:
            service_val = srv.default_price
            worker_sh = (srv.default_price * srv.worker_share_percentage) / 100.0

    req = ServiceRequest(
        customer_id=current_user.id,
        service_id=data.service_id,
        service_label=data.service_label,
        issue_description=data.issue_description,
        address=data.address,
        city=data.city,
        pincode=data.pincode,
        locality=data.locality,
        preferred_slot=data.preferred_slot,
        status="created",
        service_value=service_val,
        worker_share=worker_sh,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # Trigger backend matching engine (Fair Opportunity Allocation)
    find_and_offer_eligible_workers(db=db, request=req, limit=3)
    db.refresh(req)

    return req


@router.get("", response_model=List[ServiceRequestResponse])
def get_my_requests(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    requests = db.query(ServiceRequest).filter(
        ServiceRequest.customer_id == current_user.id
    ).order_by(ServiceRequest.created_at.desc()).all()
    return requests


@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_request_by_id(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    # Access control: customer owner, worker, or admin
    if current_user.role == "customer" and req.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return req


@router.post("/{request_id}/cancel", response_model=ServiceRequestResponse)
def cancel_request(
    request_id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    req = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id,
        ServiceRequest.customer_id == current_user.id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    if req.status in ["completed", "cancelled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel request in '{req.status}' state")

    req.status = "cancelled"
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)
    return req
