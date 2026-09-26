from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.skill import Service, Skill
from app.schemas.skill import ServiceResponse, ServiceCreate, SkillResponse, SkillCreate
from app.api.deps import require_admin

router = APIRouter(
    prefix="/api/services",
    tags=["Services & Skills"],
)

@router.get("", response_model=List[ServiceResponse])
def get_services(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service).filter(Service.is_active == True)
    if category:
        query = query.filter(Service.category == category)
    services = query.all()
    
    # If service database is empty, seed default catalogue automatically
    if not services:
        default_services = [
            Service(code="plumber", name="Plumbing Services", category="Repair", description="Tap repair, pipe leaks, bathroom fitting", default_price=499.0, worker_share_percentage=80.0),
            Service(code="electrician", name="Electrical Services", category="Repair", description="Wiring, switchboard repair, appliance installation", default_price=399.0, worker_share_percentage=80.0),
            Service(code="carpenter", name="Carpentry Work", category="Woodwork", description="Furniture repair, door fitting, locks", default_price=599.0, worker_share_percentage=80.0),
            Service(code="painter", name="Painting & Touchup", category="Renovation", description="Wall painting, waterproofing, touchups", default_price=1299.0, worker_share_percentage=80.0),
            Service(code="cleaner", name="Home Deep Cleaning", category="Cleaning", description="Bathroom cleaning, sofa cleaning, full house cleaning", default_price=899.0, worker_share_percentage=80.0),
            Service(code="ac_tech", name="AC Repair & Service", category="Appliance", description="AC servicing, gas refill, installation", default_price=799.0, worker_share_percentage=80.0),
        ]
        db.add_all(default_services)
        db.commit()
        services = db.query(Service).filter(Service.is_active == True).all()

    return services


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return srv


@router.get("/skills/list", response_model=List[SkillResponse])
def get_skills(
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).filter(Skill.is_active == True).all()
    if not skills:
        default_skills = [
            Skill(code="tap_repair", name="Tap & Pipe Repair", category="Plumbing", base_price=299.0),
            Skill(code="wiring", name="Electrical Wiring", category="Electrical", base_price=399.0),
            Skill(code="furniture", name="Furniture Assembly", category="Carpentry", base_price=499.0),
        ]
        db.add_all(default_skills)
        db.commit()
        skills = db.query(Skill).filter(Skill.is_active == True).all()
    return skills
