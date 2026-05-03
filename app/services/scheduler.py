# app/services/scheduler.py
import asyncio
from app.db.session import SessionLocal
from app.models.country import Country
from app.agents.risk_analyst_agent import run_risk_scan_for_country
from datetime import datetime

async def schedule_auto_scan():
    """Tüm ülkeleri sırayla tarar, hataları loglar."""
    db = SessionLocal()
    countries = db.query(Country.code).all()
    db.close()
    
    logs = []
    for country in countries:
        try:
            await run_risk_scan_for_country(country[0])
            logs.append(f"[{datetime.utcnow()}] {country[0]} taraması başarılı.")
        except Exception as e:
            logs.append(f"[{datetime.utcnow()}] HATA {country[0]}: {str(e)}")
    
    # Bir AutomatedTask olarak kaydedilebilir
    return logs
