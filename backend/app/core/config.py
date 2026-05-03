# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GlobalTradeRiskSaaS"
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # API Anahtarları
    NEWSAPI_KEY: str
    SERPAPI_KEY: str
    OPENAI_API_KEY: str
    
    # Admin Kullanıcı
    ADMIN_EMAIL: str = "admin@tradepulse.com"
    ADMIN_PASSWORD: str = "admın1234"
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://your-frontend.render.com"]
    
    class Config:
        env_file = ".env"

settings = Settings()
