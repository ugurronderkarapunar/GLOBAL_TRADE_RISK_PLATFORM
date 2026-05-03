from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any


@dataclass(slots=True)
class MaintenanceTask:
    name: str
    severity: str
    details: str
    action: str


class SiteMaintenanceAgent:
    """Operasyonel bakım otomasyonu için hafif ajan.

    Bu sınıf scheduler (cron/celery/worker) tarafından periyodik çağrılar için tasarlanmıştır.
    """

    def __init__(self, service_name: str = "country-risk-intelligence") -> None:
        self.service_name = service_name

    def evaluate(self, metrics: dict[str, Any]) -> list[MaintenanceTask]:
        tasks: list[MaintenanceTask] = []

        error_rate = float(metrics.get("error_rate", 0.0))
        p95_ms = float(metrics.get("latency_p95_ms", 0.0))
        disk_pct = float(metrics.get("disk_used_pct", 0.0))
        ssl_days = int(metrics.get("ssl_days_remaining", 999))

        if error_rate > 0.03:
            tasks.append(
                MaintenanceTask(
                    name="api_error_spike",
                    severity="high",
                    details=f"5xx oranı yüksek: %{error_rate * 100:.2f}",
                    action="Son deploy rollback + son 15 dk backend log incelemesi",
                )
            )
        if p95_ms > 1200:
            tasks.append(
                MaintenanceTask(
                    name="latency_regression",
                    severity="medium",
                    details=f"P95 gecikme yüksek: {p95_ms:.0f} ms",
                    action="DB slow query analizi + cache hit oranı kontrolü",
                )
            )
        if disk_pct > 85:
            tasks.append(
                MaintenanceTask(
                    name="disk_pressure",
                    severity="high",
                    details=f"Disk kullanımı kritik: %{disk_pct:.1f}",
                    action="Eski log temizleme + retention policy revizyonu",
                )
            )
        if ssl_days < 15:
            tasks.append(
                MaintenanceTask(
                    name="ssl_renewal",
                    severity="critical",
                    details=f"SSL sertifikası {ssl_days} gün sonra bitecek",
                    action="Sertifika yenileme pipeline'ını hemen çalıştır",
                )
            )

        if not tasks:
            tasks.append(
                MaintenanceTask(
                    name="system_healthy",
                    severity="info",
                    details="Sistem metrikleri normal aralıkta.",
                    action="Planlı bakım dışında aksiyon gerekmiyor",
                )
            )
        return tasks

    def summary(self, metrics: dict[str, Any]) -> dict[str, Any]:
        tasks = self.evaluate(metrics)
        return {
            "service": self.service_name,
            "checked_at": datetime.now(UTC).isoformat(),
            "tasks": [t.__dict__ for t in tasks],
        }
