from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.deps import get_current_user, require_worker, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.profile import WorkerProfile, WorkerServiceArea
from app.models.verification import WorkSlip, SkillCertificate, WorkerVerification
from app.models.document import Document
from app.schemas.profile import WorkerProfileCreate, WorkerProfileUpdate, WorkerProfileResponse, WorkerServiceAreaSchema
from app.schemas.verification import WorkSlipUpload, WorkSlipResponse, SkillCertificateUpload, SkillCertificateResponse, SkillCertificateCommitment
from app.services.verification_service import (
    upload_work_slip, upload_skill_certificate, commit_skill_certificate,
    update_worker_verification_state, create_or_update_document_record
)
from app.services.storage_service import save_uploaded_file

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

    # Attach document metadata if available
    work_slip_doc = db.query(Document).filter(
        Document.user_id == user.id,
        Document.document_type == "work_slip"
    ).order_by(Document.uploaded_at.desc()).first()

    skill_cert_doc = db.query(Document).filter(
        Document.user_id == user.id,
        Document.document_type == "skill_certificate"
    ).order_by(Document.uploaded_at.desc()).first()

    if not skill_cert_doc:
        cert = db.query(SkillCertificate).filter(SkillCertificate.worker_profile_id == profile.id).first()
        if cert and cert.document_reference and "/api/documents/" in cert.document_reference:
            try:
                doc_id = int(cert.document_reference.split("/api/documents/")[1].split("/")[0])
                skill_cert_doc = db.query(Document).filter(Document.id == doc_id).first()
            except Exception:
                pass

    if not work_slip_doc:
        slip = db.query(WorkSlip).filter(WorkSlip.worker_profile_id == profile.id).first()
        if slip and slip.document_reference and "/api/documents/" in slip.document_reference:
            try:
                doc_id = int(slip.document_reference.split("/api/documents/")[1].split("/")[0])
                work_slip_doc = db.query(Document).filter(Document.id == doc_id).first()
            except Exception:
                pass

    setattr(profile, "work_slip_document", work_slip_doc)
    setattr(profile, "skill_certificate_document", skill_cert_doc)
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
    return get_or_create_worker_profile(db, current_user)


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
async def upload_my_work_slip(
    document_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    data: Optional[WorkSlipUpload] = None,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    doc_name = document_name or (data.document_name if data else None) or (file.filename if file else "signed_work_slip.pdf")
    stored_path = None
    doc_ref = "uploaded_work_slip"

    if file:
        saved_info = save_uploaded_file(file, user_id=current_user.id, document_type="work_slip")
        stored_path = saved_info["file_path"]
        doc_record = create_or_update_document_record(
            db=db,
            user_id=current_user.id,
            worker_id=profile.id,
            document_type="work_slip",
            original_filename=saved_info["original_filename"],
            stored_filename=saved_info["stored_filename"],
            storage_key=saved_info["storage_key"],
            file_path=saved_info["file_path"],
            mime_type=saved_info["mime_type"],
            file_size=saved_info["file_size"]
        )
        doc_ref = doc_record.file_url
    elif data and data.file_path:
        stored_path = data.file_path
        doc_ref = data.document_reference

    work_slip = upload_work_slip(
        db=db,
        worker_profile=profile,
        document_name=doc_name,
        document_reference=doc_ref,
        file_path=stored_path
    )
    return work_slip


@router.post("/me/skill-certificate", response_model=SkillCertificateResponse)
async def upload_my_skill_certificate(
    certificate_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    data: Optional[SkillCertificateUpload] = None,
    current_user: User = Depends(require_worker),
    db: Session = Depends(get_db)
):
    profile = get_or_create_worker_profile(db, current_user)

    cert_name = certificate_name or (data.certificate_name if data else None) or (file.filename if file else "skill_certificate.pdf")
    stored_path = None
    doc_ref = "uploaded_skill_certificate"

    if file:
        saved_info = save_uploaded_file(file, user_id=current_user.id, document_type="skill_certificate")
        stored_path = saved_info["file_path"]
        doc_record = create_or_update_document_record(
            db=db,
            user_id=current_user.id,
            worker_id=profile.id,
            document_type="skill_certificate",
            original_filename=saved_info["original_filename"],
            stored_filename=saved_info["stored_filename"],
            storage_key=saved_info["storage_key"],
            file_path=saved_info["file_path"],
            mime_type=saved_info["mime_type"],
            file_size=saved_info["file_size"]
        )
        doc_ref = doc_record.file_url
    elif data and data.file_path:
        stored_path = data.file_path
        doc_ref = data.document_reference

    cert = upload_skill_certificate(
        db=db,
        worker_profile=profile,
        certificate_name=cert_name,
        document_reference=doc_ref,
        file_path=stored_path
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
    return get_or_create_worker_profile(db, current_user)
