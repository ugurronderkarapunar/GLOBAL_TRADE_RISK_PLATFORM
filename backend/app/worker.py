# backend/app/worker.py
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "global_trade",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.risk_tasks"]
)

celery_app.conf.beat_schedule = {
    "auto-scan-every-6-hours": {
        "task": "app.tasks.risk_tasks.schedule_global_scan",
        "schedule": 6 * 3600.0,  # 6 saat
    },
}
celery_app.conf.timezone = "UTC"
