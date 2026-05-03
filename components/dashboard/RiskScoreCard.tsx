// components/dashboard/RiskScoreCard.tsx
"use client";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ShieldAlert, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

interface RiskProps {
  countryName: string;
  countryCode: string;
  overallRisk: number;
  politicalRisk: number;
  economicRisk: number;
  securityRisk: number;
  trend: "up" | "down" | "stable";
  summary: string;
}

export function RiskScoreCard({ data }: { data: RiskProps }) {
  const t = useTranslations("RiskCard");

  const getRiskColor = (score: number) => {
    if (score < 30) return "emerald";
    if (score < 60) return "amber";
    return "red";
  };

  const color = getRiskColor(data.overallRisk);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-2xl backdrop-blur-sm transition-all hover:scale-[1.02]",
        "dark:bg-gray-900/70 dark:border-gray-700",
        "dir-rtl" // RTL için özel sınıf
      )}
    >
      {/* Başlık ve Trend */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">
            {data.countryName}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({data.countryCode})
            </span>
          </h3>
        </div>
        {data.trend === "up" ? (
          <TrendingUp className="h-5 w-5 text-red-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-emerald-500" />
        )}
      </div>

      {/* Ana Risk Skoru */}
      <div className="flex items-baseline gap-2 mb-6">
        <span
          className={`text-6xl font-black tracking-tighter text-${color}-500`}
        >
          {data.overallRisk}
        </span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>

      {/* Alt Skorlar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("political")}
          </span>
          <span className={`text-2xl font-bold text-${getRiskColor(data.politicalRisk)}-500`}>
            {data.politicalRisk}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("economic")}
          </span>
          <span className={`text-2xl font-bold text-${getRiskColor(data.economicRisk)}-500`}>
            {data.economicRisk}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("security")}
          </span>
          <span className={`text-2xl font-bold text-${getRiskColor(data.securityRisk)}-500`}>
            {data.securityRisk}
          </span>
        </div>
      </div>

      {/* AI Özeti */}
      <div className="flex gap-2 items-start p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <ShieldAlert className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-sm leading-relaxed text-blue-300">{data.summary}</p>
      </div>
    </div>
  );
}
