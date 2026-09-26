from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
import jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hash_context = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(
    subject: Union[str, Any],
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except Exception:
        return None
