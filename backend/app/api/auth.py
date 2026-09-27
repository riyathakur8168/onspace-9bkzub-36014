from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.db.database import get_db
from app.models.user import User
from app.models.profile import CustomerProfile, WorkerProfile
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.services.verification_service import update_worker_verification_state

SECRET_KEY = settings.SECRET_KEY

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

@router.post("/register")
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    if data.role not in ["customer", "worker"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be customer or worker",
        )

    email = data.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long",
        )

    hashed_pw = hash_password(data.password)

    user = User(
        name=data.name.strip(),
        email=email,
        phone=data.phone,
        password_hash=hashed_pw,
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-initialize appropriate profile
    if data.role == "customer":
        cust_profile = CustomerProfile(
            user_id=user.id,
            phone=user.phone,
            profile_completion_state="incomplete"
        )
        db.add(cust_profile)
        db.commit()
    elif data.role == "worker":
        work_profile = WorkerProfile(
            user_id=user.id,
            name=user.name,
            phone=user.phone or "0000000000",
            primary_skill="General Worker",
            availability_status=True,
            verification_state="pending",
            work_slip_status="not_uploaded",
            skill_certificate_status="not_submitted"
        )
        db.add(work_profile)
        db.commit()
        db.refresh(work_profile)
        update_worker_verification_state(db, work_profile)

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        },
    }


@router.post("/login")
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    email = data.email.strip().lower()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        },
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Logout successful"
    }