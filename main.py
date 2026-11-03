from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth,
    projects,
    complaints,
    notices,
    assistant,
    discussions,
    research,
    dashboard
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create missing tables; demo data is development-only.
    Base.metadata.create_all(bind=engine)
    if settings.ENVIRONMENT.lower() != "production":
        from app.seed import seed_database

        seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CampusMind AI Backend: Making University Life Smarter with Artificial Intelligence",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(notices.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(discussions.router, prefix=settings.API_V1_STR)
app.include_router(research.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

# Mount uploads directory for file retrieval
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "CampusMind AI Core Engine"}

# Serve frontend build if present
dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(dist_path, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Don't hijack API or uploads
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        target = os.path.join(dist_path, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": "CampusMind AI API",
            "tagline": "Making University Life Smarter with Artificial Intelligence",
            "docs": "/docs",
            "status": "operational"
        }
