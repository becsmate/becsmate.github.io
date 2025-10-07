"""Application configuration."""
import os


def normalize_db_url(url: str) -> str:
    """Convert postgres:// to postgresql:// for SQLAlchemy compatibility."""
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    """Base configuration."""
    
    # Database
    SQLALCHEMY_DATABASE_URI = normalize_db_url(
        os.getenv("DATABASE_URL", "sqlite:///dev.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)  # 30 days
    
    # CORS
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,https://becsmate.me,https://www.becsmate.me"
    ).split(",")