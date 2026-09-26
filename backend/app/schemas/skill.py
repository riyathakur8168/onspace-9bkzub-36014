from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ServiceBase(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None
    default_price: float = 0.0
    worker_share_percentage: float = 80.0
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    default_price: Optional[float] = None
    worker_share_percentage: Optional[float] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SkillBase(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None
    base_price: float = 0.0
    is_active: bool = True

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
