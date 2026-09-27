from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine
from app.db.base import Base
import app.models  # Ensure all models are registered

from app.api.auth import router as auth_router
from app.api.customers import router as customers_router
from app.api.workers import router as workers_router
from app.api.documents import router as documents_router
from app.api.services import router as services_router
from app.api.requests import router as requests_router
from app.api.offers import router as offers_router
from app.api.bookings import router as bookings_router
from app.api.notifications import router as notifications_router
from app.api.ratings import router as ratings_router
from app.api.payments import router as payments_router
from app.api.admin import router as admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OnePlace API",
    version="1.0.0",
    description="Backend API for OnePlace cooperative services platform",
)

# Configure CORS for local development and physical phone devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(workers_router)
app.include_router(documents_router)
app.include_router(services_router)
app.include_router(requests_router)
app.include_router(offers_router)
app.include_router(bookings_router)
app.include_router(notifications_router)
app.include_router(ratings_router)
app.include_router(payments_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "OnePlace API",
        "version": "1.0.0",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OnePlace Backend",
    }