# backend/app/api/v1/endpoints/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from app.db.session import SessionLocal
from app.models.risk_score import RiskScore
from sqlalchemy import text

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active_connections.remove(ws)

    async def broadcast(self, message: str):
        for conn in self.active_connections:
            await conn.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/live-risks")
async def live_risks(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Her 10 saniyede bir DB'den son riskleri çekip yayınla
            db = SessionLocal()
            query = text("""
                SELECT DISTINCT ON (country_code) country_code, overall_risk 
                FROM risk_scores 
                ORDER BY country_code, calculated_at DESC
            """)
            data = [{"countryCode": r[0], "risk": r[1]} for r in db.execute(query)]
            db.close()
            await manager.broadcast(json.dumps(data))
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
