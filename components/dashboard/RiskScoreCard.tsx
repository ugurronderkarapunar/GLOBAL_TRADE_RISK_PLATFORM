// frontend/components/dashboard/RiskScoreCard.tsx (Güncellenmiş)
"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, ShieldAlert, Globe, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RiskData {
  countryCode: string;
  countryName: string;
  overallRisk: number;
  politicalRisk: number;
  economicRisk: number;
  securityRisk: number;
  trend: "up" | "down" | "stable";
  summary: string;
  lastUpdated: string;
}

interface Props {
  data?: RiskData;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const getRiskColor = (score: number) => {
  if (score < 30) return "emerald";
  if (score < 60) return "amber";
  return "red";
};

export function RiskScoreCard({ data, isLoading, isError, onRetry }: Props) {
  const t = useTranslations("RiskCard");

  // Yükleniyor Durumu
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-2xl dark:bg-gray-900/70 dark:border-gray-700">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-24 w-32 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-16 w-full mt-6" />
      </div>
    );
  }

  // Hata Durumu
  if (isError) {
    return (
      <Alert variant="destructive" className="dark:border-red-800 dark:bg-red-950/50">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription className="flex justify-between items-center">
          {t("errorLoading")}
          <button onClick={onRetry} className="flex items-center gap-2 underline">
            <RefreshCw className="h-4 w-4" /> {t("retry")}
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground dark:bg-gray-900/70">
        {t("noData")}
      </div>
    );
  }

  const color = getRiskColor(data.overallRisk);
  return (
    <div className={cn(
      "rounded-xl border bg-card p-6 shadow-2xl backdrop-blur-sm transition-all hover:scale-[1.02]",
      "dark:bg-gray-900/70 dark:border-gray-700",
      "dir-rtl" // RTL otomatik next-intl ile eklenir
    )}>
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

      <div className="flex items-baseline gap-2 mb-6">
        <span className={`text-6xl font-black tracking-tighter text-${color}-500`}>
          {data.overallRisk}
        </span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>

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

      <div className="flex gap-2 items-start p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <ShieldAlert className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-sm leading-relaxed text-blue-300">{data.summary}</p>
      </div>
      <p className="text-xs text-right mt-2 text-muted-foreground">
        {t("lastUpdated")}: {new Date(data.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}
