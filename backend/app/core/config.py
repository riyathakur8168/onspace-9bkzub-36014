from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "OnePlace API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str = "oneplace-dev-secret-key-change-in-production-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days token for development
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Optional / Future Services
    REDIS_URL: str = ""
    STORAGE_PROVIDER: str = "local"
    PAYMENT_PROVIDER: str = "cooperative_ledger"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()