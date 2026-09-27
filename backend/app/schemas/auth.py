from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="customer, worker, or admin")
    session_id: Optional[str] = None
    aadhaar_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AadhaarOtpRequest(BaseModel):
    aadhaar_number: str = Field(..., min_length=12, max_length=14)
    session_id: Optional[str] = None

class AadhaarOtpVerify(BaseModel):
    session_id: str
    client_id: str
    otp: str = Field(..., min_length=6, max_length=6)

class PhoneOtpRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    session_id: Optional[str] = None

class PhoneOtpVerify(BaseModel):
    session_id: str
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)


