from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import get_current_user, require_worker, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.profile import WorkerProfile, WorkerServiceArea
from app.models.verification import WorkSlip, SkillCertificate, WorkerVerification
from app.schemas.profile import WorkerProfileCreate, WorkerProfileUpdate, WorkerProfileResponse, WorkerServiceAreaSchema
from app.schemas.verification import WorkSlipUpload, WorkSlipResponse, SkillCertificateUpload, SkillCertificateResponse, SkillCertificateCommitment
from app.services.verification_service import upload_work_slip, upload_skill_certificate, commit_skill_certificate, update_worker_verification_state

router = APIRouter(
    prefix="/api/workers",
    tags=["Workers"],
)

def get_or_create_worker_profile(db: Session, user: User) -> WorkerProfile:
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == user.id).first()
    if not profile:
        profile = WorkerProfile(
            user_id=user.id,
            name=user.name,
            phone=user.phone or "0000000000",
            primary_skill="General Worker",
            availability_status=True,
            verification_state="pending",
            work_slip_status="not_uploaded",
            skill_certificate_status="not_submitted"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        update_worker_verification_state(db, profile)
    return profile


@router.get("/me", response_model=WorkerProfileResponse)
def get_my_worker_profile(
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    return get_or_create_worker_profile(db, current_user)


@router.put("/me", response_model=WorkerProfileResponse)
def update_my_worker_profile(
    data: WorkerProfileUpdate,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me/onboarding-status")
def get_onboarding_status(
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    dashboard_eligible = profile.work_slip_status in ["approved", "uploaded"]
    return {
        "dashboard_eligible": dashboard_eligible,
        "verification_state": profile.verification_state,
        "work_slip_status": profile.work_slip_status,
        "skill_certificate_status": profile.skill_certificate_status,
        "has_certificate_commitment": profile.has_skill_certificate_commitment,
        "certificate_deadline": profile.certificate_deadline_date,
        "message": "Dashboard unlocked via Work Slip upload." if dashboard_eligible else "Work Slip upload is required for dashboard creation."
    }


@router.post("/me/work-slip", response_model=WorkSlipResponse)
def upload_my_work_slip(
    data: WorkSlipUpload,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    work_slip = upload_work_slip(
        db=db,
        worker_profile=profile,
        document_name=data.document_name,
        document_reference=data.document_reference,
        file_path=data.file_path
    )
    return work_slip


@router.post("/me/skill-certificate", response_model=SkillCertificateResponse)
def upload_my_skill_certificate(
    data: SkillCertificateUpload,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    cert = upload_skill_certificate(
        db=db,
        worker_profile=profile,
        certificate_name=data.certificate_name,
        document_reference=data.document_reference,
        file_path=data.file_path
    )
    return cert


@router.post("/me/skill-certificate/commit", response_model=WorkerProfileResponse)
def commit_my_skill_certificate(
    data: SkillCertificateCommitment,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    profile = commit_skill_certificate(db, profile)
    return profile
