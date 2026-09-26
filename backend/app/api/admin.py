from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.profile import WorkerProfile, CustomerProfile
from app.models.verification import WorkSlip, SkillCertificate, WorkerVerification
from app.models.request import ServiceRequest
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.audit import AuditLog
from app.schemas.profile import WorkerProfileResponse
from app.schemas.verification import VerificationReviewAction, WorkSlipResponse, SkillCertificateResponse
from app.schemas.admin import AdminDashboardSummary, AuditLogResponse
from app.services.audit_service import log_action
from app.services.verification_service import update_worker_verification_state

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Oversight"],
)

@router.get("/dashboard", response_model=AdminDashboardSummary)
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_customers = db.query(CustomerProfile).count()
    total_workers = db.query(WorkerProfile).count()
    pending_verifications = db.query(WorkerProfile).filter(WorkerProfile.verification_state != "verified").count()
    total_requests = db.query(ServiceRequest).count()
    active_bookings = db.query(Booking).filter(Booking.status.in_(["ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"])).count()
    completed_bookings = db.query(Booking).filter(Booking.status == "COMPLETED").count()
    
    payments = db.query(Payment).all()
    total_revenue = sum(float(p.amount) for p in payments)

    return AdminDashboardSummary(
        total_users=total_users,
        total_customers=total_customers,
        total_workers=total_workers,
        pending_verifications=pending_verifications,
        total_requests=total_requests,
        active_bookings=active_bookings,
        completed_bookings=completed_bookings,
        total_revenue=total_revenue
    )


@router.get("/workers", response_model=List[WorkerProfileResponse])
def get_all_workers(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    workers = db.query(WorkerProfile).order_by(WorkerProfile.created_at.desc()).all()
    return workers


@router.get("/workers/{worker_id}", response_model=WorkerProfileResponse)
def get_worker_detail(
    worker_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
    return wp


@router.post("/workers/{worker_id}/work-slip/review", response_model=WorkSlipResponse)
def review_work_slip(
    worker_id: int,
    action_data: VerificationReviewAction,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")

    work_slip = db.query(WorkSlip).filter(WorkSlip.worker_profile_id == wp.id).first()
    if not work_slip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Work Slip uploaded for worker")

    now = datetime.now(timezone.utc)
    work_slip.reviewed_at = now
    work_slip.reviewed_by_id = current_user.id

    if action_data.action.lower() == "approve":
        work_slip.status = "approved"
        wp.work_slip_status = "approved"
        work_slip.rejection_reason = None
    else:
        work_slip.status = "reupload_required"
        wp.work_slip_status = "reupload_required"
        work_slip.rejection_reason = action_data.rejection_reason

    db.commit()
    db.refresh(work_slip)

    update_worker_verification_state(db, wp)

    log_action(
        db=db,
        actor_id=current_user.id,
        action=f"work_slip_{action_data.action.lower()}",
        entity_type="work_slip",
        entity_id=str(work_slip.id),
        metadata={"worker_id": worker_id, "reason": action_data.rejection_reason}
    )

    return work_slip


@router.post("/workers/{worker_id}/certificate/review", response_model=SkillCertificateResponse)
def review_skill_certificate(
    worker_id: int,
    action_data: VerificationReviewAction,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")

    cert = db.query(SkillCertificate).filter(SkillCertificate.worker_profile_id == wp.id).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Skill Certificate uploaded for worker")

    now = datetime.now(timezone.utc)
    cert.reviewed_at = now
    cert.reviewed_by_id = current_user.id

    if action_data.action.lower() == "approve":
        cert.status = "verified"
        wp.skill_certificate_status = "verified"
        cert.rejection_reason = None
    else:
        cert.status = "reupload_required"
        wp.skill_certificate_status = "reupload_required"
        cert.rejection_reason = action_data.rejection_reason

    db.commit()
    db.refresh(cert)

    update_worker_verification_state(db, wp)

    log_action(
        db=db,
        actor_id=current_user.id,
        action=f"certificate_{action_data.action.lower()}",
        entity_type="skill_certificate",
        entity_id=str(cert.id),
        metadata={"worker_id": worker_id, "reason": action_data.rejection_reason}
    )

    return cert


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return logs
