import os
from pydantic_settings import BaseSettings

DEVELOPMENT_SECRET_KEY = "local-development-secret-not-for-production"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusMind AI"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = os.getenv("SECRET_KEY", DEVELOPMENT_SECRET_KEY)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ALLOW_FACULTY_REGISTRATION: bool = True
    
    # Database: Supports PostgreSQL, falls back to SQLite for instant local dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campusmind.db")
    
    # Upload storage directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    
    # Optional LLM API Key (if provided by user; otherwise full local NLP is used)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

if settings.ENVIRONMENT.lower() == "production":
    if settings.SECRET_KEY == DEVELOPMENT_SECRET_KEY or len(settings.SECRET_KEY) < 32:
        raise RuntimeError("Production requires a strong SECRET_KEY of at least 32 characters.")
    if settings.DATABASE_URL.startswith("sqlite"):
        raise RuntimeError("Production requires a persistent PostgreSQL DATABASE_URL.")

# Ensure uploads dir exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "notices"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "assistant"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "projects"), exist_ok=True)
