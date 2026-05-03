# backend/app/tasks/risk_tasks.py
from app.worker import celery_app
from app.agents.risk_analyst_agent import run_risk_scan_for_country
from app.db.session import SessionLocal
from app.models.country import Country

@celery_app.task(bind=True, max_retries=3)
def scan_country_risk(self, country_code: str):
    try:
        # CrewAI ajanı çalıştır
        result = run_risk_scan_for_country(country_code)
        return {"status": "completed", "country": country_code, "risk": result['overallRisk']}
    except Exception as e:
        self.retry(countdown=60 * 5, exc=e)

@celery_app.task
def schedule_global_scan():
    db = SessionLocal()
    countries = [c[0] for c in db.query(Country.code).all()]
    db.close()
    
    for code in countries:
        scan_country_risk.delay(code)
    return f"Taranacak {len(countries)} ülke kuyruğa alındı."
