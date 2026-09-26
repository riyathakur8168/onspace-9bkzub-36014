from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.profile import WorkerProfile, WorkerServiceArea
from app.models.request import ServiceRequest, WorkerOffer
from app.models.notification import NotificationType
from app.services.notification_service import send_notification

def find_and_offer_eligible_workers(
    db: Session,
    request: ServiceRequest,
    limit: int = 3
) -> List[WorkerOffer]:

    # Step 1: Query all active workers with approved/uploaded Work Slip
    query = (
        db.query(WorkerProfile)
        .join(User, WorkerProfile.user_id == User.id)
        .filter(User.is_active == True)
        .filter(WorkerProfile.availability_status == True)
        .filter(WorkerProfile.work_slip_status.in_(["approved", "uploaded"]))
    )
    
    candidate_profiles: List[WorkerProfile] = query.all()
    
    eligible_candidates = []
    
    req_service_clean = request.service_label.strip().lower()
    req_city_clean = (request.city or "").strip().lower()
    req_locality_clean = (request.locality or "").strip().lower()
    
    for wp in candidate_profiles:
        # Check skill match
        worker_skill_clean = (wp.primary_skill or "").strip().lower()
        if req_service_clean not in worker_skill_clean and worker_skill_clean not in req_service_clean:
            continue
            
        # Check service area match (if configured)
        service_area_text = (wp.service_area or "").strip().lower()
        locality_match = True
        if req_locality_clean and service_area_text:
            if req_locality_clean not in service_area_text and req_city_clean not in service_area_text:
                # Also check detailed service areas table
                areas = db.query(WorkerServiceArea).filter(WorkerServiceArea.worker_profile_id == wp.id).all()
                if areas:
                    area_match = any(
                        req_locality_clean in a.locality.lower() or req_city_clean in a.city.lower()
                        for a in areas
                    )
                    if not area_match:
                        locality_match = False
                else:
                    locality_match = True # default open if area text is general
        
        if not locality_match:
            continue
            
        # Calculate fair opportunity score
        # Lower earnings -> higher score priority
        score = 1000.0 - (wp.recent_earnings * 0.1) - (wp.completed_jobs_count * 2.0)
        
        eligible_candidates.append({
            "profile": wp,
            "score": score
        })
        
    # Sort candidate pool by score descending (fair opportunity allocation)
    eligible_candidates.sort(key=lambda x: x["score"], reverse=True)
    
    selected_offers: List[WorkerOffer] = []
    
    for item in eligible_candidates[:limit]:
        wp = item["profile"]
        score = item["score"]
        
        # Check if offer already exists
        existing_offer = db.query(WorkerOffer).filter(
            WorkerOffer.request_id == request.id,
            WorkerOffer.worker_id == wp.user_id
        ).first()
        
        if not existing_offer:
            offer = WorkerOffer(
                request_id=request.id,
                worker_id=wp.user_id,
                status="offered",
                offered_at=datetime.now(timezone.utc),
                matching_score=score,
                selection_reason=f"Matched primary skill '{wp.primary_skill}'. Opportunity balancing priority score: {score:.1f}"
            )
            db.add(offer)
            db.commit()
            db.refresh(offer)
            selected_offers.append(offer)
            
            # Send notification to worker
            send_notification(
                db=db,
                user_id=wp.user_id,
                type=NotificationType.NEW_JOB,
                title="New Service Request Available",
                body=f"Job opportunity for {request.service_label} at {request.locality or request.city}.",
                data={"request_id": request.id, "offer_id": offer.id}
            )
            
    if selected_offers and request.status == "created":
        request.status = "matching"
        db.commit()
        db.refresh(request)
        
    return selected_offers
