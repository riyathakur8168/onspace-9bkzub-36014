import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Base directory for permanent document uploads
BASE_UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", getattr(settings, "UPLOAD_DIR", "uploads"))).resolve()
if not BASE_UPLOAD_DIR.is_absolute():
    BASE_UPLOAD_DIR = (Path(__file__).parent.parent.parent / "uploads").resolve()

# Ensure permanent upload directory exists
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


def validate_file(file: UploadFile) -> Tuple[str, str]:
    """Validates uploaded file MIME type and extension."""
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
    
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Allowed types: PDF, JPEG, PNG, WEBP."
        )

    return filename, ext


def save_uploaded_file(file: UploadFile, user_id: int, document_type: str) -> dict:
    """
    Saves an uploaded file to persistent backend storage.
    Returns metadata dict for database persistence.
    """
    original_filename, ext = validate_file(file)

    # Sub-directory per document type
    type_dir = BASE_UPLOAD_DIR / document_type
    type_dir.mkdir(parents=True, exist_ok=True)

    # Unique storage key / filename
    unique_id = uuid.uuid4().hex
    stored_filename = f"{document_type}_{user_id}_{unique_id}{ext}"
    dest_path = type_dir / stored_filename

    # Read and save file content
    try:
        file.file.seek(0)
        file_bytes = file.file.read()
        file_size = len(file_bytes)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds limit of {MAX_FILE_SIZE // (1024 * 1024)}MB."
            )

        with open(dest_path, "wb") as f:
            f.write(file_bytes)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document to persistent storage: {str(e)}"
        )

    return {
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "storage_key": f"{document_type}/{stored_filename}",
        "file_path": str(dest_path),
        "mime_type": file.content_type or "application/octet-stream",
        "file_size": file_size,
    }


def get_stored_file_path(storage_key_or_filename: str) -> Optional[Path]:
    """Resolves and validates stored file path, preventing directory traversal."""
    # Handle storage key (e.g. work_slip/filename.pdf) or plain filename
    clean_path = storage_key_or_filename.lstrip("/\\")
    resolved_path = (BASE_UPLOAD_DIR / clean_path).resolve()

    # Security check: Ensure target path remains within BASE_UPLOAD_DIR
    if not str(resolved_path).startswith(str(BASE_UPLOAD_DIR)):
        return None

    if resolved_path.exists() and resolved_path.is_file():
        return resolved_path
    
    return None
