from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models.profile import WorkerProfile
from app.models.verification import WorkSlip, SkillCertificate, WorkerVerification
from app.models.document import Document
from app.models.notification import NotificationType
from app.services.notification_service import send_notification

def create_or_update_document_record(
    db: Session,
    user_id: int,
    worker_id: Optional[int],
    document_type: str,
    original_filename: str,
    stored_filename: str,
    storage_key: str,
    file_path: str,
    mime_type: str = "application/pdf",
    file_size: int = 0
) -> Document:
    doc = db.query(Document).filter(
        Document.user_id == user_id,
        Document.document_type == document_type
    ).first()
    
    now = datetime.now(timezone.utc)
    if not doc:
        doc = Document(
            user_id=user_id,
            worker_id=worker_id,
            document_type=document_type,
            original_filename=original_filename,
            stored_filename=stored_filename,
            storage_key=storage_key,
            file_path=file_path,
            file_url="",
            mime_type=mime_type,
            file_size=file_size,
            uploaded_at=now,
            status="uploaded"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
    else:
        doc.original_filename = original_filename
        doc.stored_filename = stored_filename
        doc.storage_key = storage_key
        doc.file_path = file_path
        doc.mime_type = mime_type
        doc.file_size = file_size
        doc.uploaded_at = now
        doc.status = "uploaded"
        
    doc.file_url = f"/api/documents/{doc.id}/file"
    db.commit()
    db.refresh(doc)
    return doc


def update_worker_verification_state(db: Session, worker_profile: WorkerProfile) -> WorkerVerification:
    verification = db.query(WorkerVerification).filter(
        WorkerVerification.worker_profile_id == worker_profile.id
    ).first()
    
    if not verification:
        verification = WorkerVerification(
            worker_profile_id=worker_profile.id,
            overall_status="pending",
            work_slip_status=worker_profile.work_slip_status,
            certificate_status=worker_profile.skill_certificate_status
        )
        db.add(verification)
        db.commit()
        db.refresh(verification)
        
    verification.work_slip_status = worker_profile.work_slip_status
    verification.certificate_status = worker_profile.skill_certificate_status
    
    # Calculate overall status
    if worker_profile.work_slip_status == "approved" and worker_profile.skill_certificate_status in ["verified", "approved"]:
        verification.overall_status = "verified"
        verification.verified_at = datetime.now(timezone.utc)
        worker_profile.verification_state = "verified"
        worker_profile.admin_approval_status = "approved"
    elif worker_profile.work_slip_status in ["approved", "uploaded"]:
        verification.overall_status = "dashboard_eligible"
        worker_profile.verification_state = "dashboard_eligible"
    elif worker_profile.work_slip_status == "reupload_required" or worker_profile.skill_certificate_status == "reupload_required":
        verification.overall_status = "reupload_required"
        worker_profile.verification_state = "reupload_required"
    else:
        verification.overall_status = "pending"
        worker_profile.verification_state = "pending"
        
    db.commit()
    db.refresh(verification)
    db.refresh(worker_profile)
    return verification


def upload_work_slip(
    db: Session,
    worker_profile: WorkerProfile,
    document_name: str,
    document_reference: str,
    file_path: Optional[str] = None
) -> WorkSlip:
    work_slip = db.query(WorkSlip).filter(WorkSlip.worker_profile_id == worker_profile.id).first()
    if not work_slip:
        work_slip = WorkSlip(
            worker_profile_id=worker_profile.id,
            document_name=document_name,
            document_reference=document_reference,
            file_path=file_path,
            status="uploaded",
            uploaded_at=datetime.now(timezone.utc)
        )
        db.add(work_slip)
    else:
        work_slip.document_name = document_name
        work_slip.document_reference = document_reference
        work_slip.file_path = file_path
        work_slip.status = "uploaded"
        work_slip.uploaded_at = datetime.now(timezone.utc)
        work_slip.rejection_reason = None

    worker_profile.work_slip_status = "uploaded"
    db.commit()
    db.refresh(work_slip)
    db.refresh(worker_profile)
    
    update_worker_verification_state(db, worker_profile)
    return work_slip


def upload_skill_certificate(
    db: Session,
    worker_profile: WorkerProfile,
    certificate_name: str,
    document_reference: str,
    file_path: Optional[str] = None
) -> SkillCertificate:
    cert = db.query(SkillCertificate).filter(SkillCertificate.worker_profile_id == worker_profile.id).first()
    if not cert:
        cert = SkillCertificate(
            worker_profile_id=worker_profile.id,
            certificate_name=certificate_name,
            document_reference=document_reference,
            file_path=file_path,
            status="uploaded",
            uploaded_at=datetime.now(timezone.utc)
        )
        db.add(cert)
    else:
        cert.certificate_name = certificate_name
        cert.document_reference = document_reference
        cert.file_path = file_path
        cert.status = "uploaded"
        cert.uploaded_at = datetime.now(timezone.utc)
        cert.rejection_reason = None

    worker_profile.skill_certificate_status = "uploaded"
    db.commit()
    db.refresh(cert)
    db.refresh(worker_profile)
    
    update_worker_verification_state(db, worker_profile)
    return cert


def commit_skill_certificate(db: Session, worker_profile: WorkerProfile) -> WorkerProfile:
    now = datetime.now(timezone.utc)
    worker_profile.has_skill_certificate_commitment = True
    worker_profile.certificate_commitment_date = now
    worker_profile.certificate_deadline_date = now + timedelta(days=10)
    if worker_profile.skill_certificate_status == "not_submitted":
        worker_profile.skill_certificate_status = "pending"
        
    db.commit()
    db.refresh(worker_profile)
    update_worker_verification_state(db, worker_profile)
    return worker_profile
