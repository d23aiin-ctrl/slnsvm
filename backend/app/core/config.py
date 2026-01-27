from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@localhost:5432/slnsvm_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "supersecretkey123changeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    # Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@slnsvm.edu"

    # SMS Configuration
    SMS_API_KEY: Optional[str] = None
    SMS_API_URL: Optional[str] = None
    SMS_SENDER_ID: str = "SLNSVM"

    # App
    APP_NAME: str = "Sri Laxmi Narayan Saraswati Vidya Mandir"
    DEBUG: bool = True

    # Seed Data Configuration
    SEED_DATA_ENABLED: bool = False  # Set to True to enable seed data on startup
    SEED_DATA_FORCE: bool = False    # Set to True to force re-seed (clears existing data)

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
