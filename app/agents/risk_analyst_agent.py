# app/agents/risk_analyst_agent.py
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerpApiTool, NewsApiTool
from app.services.risk_calculator import calculate_weighted_risk
from app.db.session import SessionLocal
from app.models.risk_score import RiskScore
import json

class GlobalTradeAgents:
    def __init__(self):
        self.news_tool = NewsApiTool()
        self.search_tool = SerpApiTool()

    def risk_analyst(self) -> Agent:
        return Agent(
            role='Kıdemli Küresel Risk Analisti',
            goal='Belirtilen ülkeler için ekonomik, siyasi ve güvenlik risklerini 0-100 arası puanlayıp detaylı bir rapor üret.',
            backstory="""Sen 20 yıllık deneyime sahip bir jeopolitik risk analistisin. 
            Ex-CIA ve Dünya Bankası danışmanısın. Verileri tarafsız yorumlarsın.""",
            tools=[self.news_tool, self.search_tool],
            verbose=True,
            allow_delegation=False,
            max_iter=3,
            llm="gpt-4-turbo"
        )

    def regulation_agent(self) -> Agent:
        return Agent(
            role='Uluslararası Ticaret Hukuku Uzmanı',
            goal='Risk puanına göre o ülkeyle ticarette alınması gereken mevzuat önlemlerini listele.',
            backstory="""Eski bir gümrük müfettişi ve dış ticaret avukatısın. 
            ICC kuralları ve yerel mevzuata hakimsin.""",
            tools=[self.search_tool],
            verbose=True
        )

    def logistics_architect(self) -> Agent:
        return Agent(
            role='Lojistik ve Tedarik Zinciri Mimarı',
            goal='Risk haritasına göre en güvenli ve maliyet etkin nakliye rotasını çiz.',
            backstory="""Küresel lojistikte 15 yıllık deneyim. Deniz, hava ve kara
            rotalarını optimize etmede uzmansın.""",
            tools=[self.search_tool],
            verbose=True
        )

async def run_risk_scan_for_country(country_code: str):
    agents = GlobalTradeAgents()
    
    risk_task = Task(
        description=f"Son 24 saatteki olayları ve makro verileri dikkate alarak {country_code} için ayrıntılı risk raporu hazırla.",
        expected_output="JSON formatında overallRisk, politicalRisk, economicRisk, securityRisk ve aiSummary alanları",
        agent=agents.risk_analyst(),
        output_file=f"/tmp/{country_code}_risk.json"
    )

    # Tek başına ajan çalıştır (senkronizasyon için Crew kullanmaya gerek yok)
    crew = Crew(
        agents=[agents.risk_analyst()],
        tasks=[risk_task],
        process=Process.sequential,
        verbose=True
    )
    
    result = crew.kickoff()
    
    # Veritabanına kaydet
    db = SessionLocal()
    try:
        new_score = RiskScore(
            countryCode=country_code,
            overallRisk=result.get('overallRisk'),
            politicalRisk=result.get('politicalRisk'),
            economicRisk=result.get('economicRisk'),
            securityRisk=result.get('securityRisk'),
            aiSummary=result.get('aiSummary'),
            sourceUrls=result.get('sources', [])
        )
        db.add(new_score)
        db.commit()
    finally:
        db.close()
    
    return result
