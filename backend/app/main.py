from fastapi import FastAPI

app = FastAPI(
    title="OnePlace API",
    version="1.0.0",
    description="Backend API for OnePlace cooperative services platform",
)


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