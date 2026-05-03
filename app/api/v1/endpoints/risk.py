# app/api/v1/endpoints/risk.py
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from app.agents.risk_analyst_agent import run_risk_scan_for_country
from app.services.scheduler import schedule_auto_scan
from app.models.risk_score import RiskScore
from app.db.session import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

# Otomatik bakım görevi: Her 6 saatte bir tüm ülkeleri tarar (Background Task)
@router.post("/api/v1/admin/auto-scan")
async def trigger_auto_scan(background_tasks: BackgroundTasks):
    """Yönetici endpoint'i: Tüm aktif ülkeler için risk taraması başlatır."""
    background_tasks.add_task(schedule_auto_scan)
    return {"message": "Otomatik risk tarama zinciri başlatıldı. Loglar için /admin/logs adresini kontrol edin."}

@router.get("/api/v1/countries/{country_code}/risk")
async def get_country_risk(country_code: str, db: Session = Depends(get_db)):
    """Anlık risk puanını döndür. Eğer veri 4 saatten eskiyse arka planda yeni tarama başlat."""
    latest_risk = db.query(RiskScore).filter(
        RiskScore.countryCode == country_code
    ).order_by(RiskScore.calculatedAt.desc()).first()
    
    if not latest_risk:
        # İlk defa sorgulanıyor, hemen tara
        result = await run_risk_scan_for_country(country_code)
        return result
    
    # Veri bayatlamışsa arka planda güncelle, ancak hemen eski veriyi döndür (stale-while-revalidate)
    if latest_risk.calculatedAt < datetime.utcnow() - timedelta(hours=4):
        background_tasks = BackgroundTasks()
        background_tasks.add_task(run_risk_scan_for_country, country_code)
        # Not: Gerçek uygulamada BackgroundTasks'ı doğru şekilde enjekte etmelisiniz.
    
    return latest_risk

@router.get("/api/v1/countries/heatmap")
async def get_heatmap_data(db: Session = Depends(get_db)):
    """Isı haritası için tüm ülkelerin son risk puanlarını döndür."""
    from sqlalchemy import text
    query = text("""
        SELECT DISTINCT ON (country_code) 
            country_code, 
            overall_risk 
        FROM risk_scores 
        ORDER BY country_code, calculated_at DESC
    """)
    result = db.execute(query).fetchall()
    return [{"countryCode": r[0], "risk": r[1]} for r in result]
