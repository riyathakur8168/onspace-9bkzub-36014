from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class WorkSlipUpload(BaseModel):
    document_name: str
    document_reference: str  # secure storage identifier / key / URL
    file_path: Optional[str] = None

class WorkSlipResponse(BaseModel):
    id: int
    worker_profile_id: int
    document_name: str
    document_reference: str
    uploaded_at: datetime
    status: str
    rejection_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SkillCertificateUpload(BaseModel):
    certificate_name: str
    document_reference: str
    file_path: Optional[str] = None

class SkillCertificateCommitment(BaseModel):
    commit: bool = True

class SkillCertificateResponse(BaseModel):
    id: int
    worker_profile_id: int
    certificate_name: str
    document_reference: str
    uploaded_at: datetime
    status: str
    rejection_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WorkerVerificationResponse(BaseModel):
    id: int
    worker_profile_id: int
    overall_status: str
    work_slip_status: str
    certificate_status: str
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class VerificationReviewAction(BaseModel):
    action: str  # approve or reject
    rejection_reason: Optional[str] = None
