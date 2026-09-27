from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    document_type: str
    original_filename: str
    mime_type: str
    file_size: int
    status: str = "uploaded"


class DocumentCreate(DocumentBase):
    user_id: int
    worker_id: Optional[int] = None
    stored_filename: str
    storage_key: str
    file_path: str
    file_url: str


class DocumentSchema(DocumentBase):
    id: int
    user_id: int
    worker_id: Optional[int] = None
    stored_filename: str
    file_url: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
