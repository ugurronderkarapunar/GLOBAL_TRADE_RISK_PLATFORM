import { createContext, useContext, useMemo, useState } from "react";

export const SUPPORTED_LANGS = ["tr", "en", "de", "fr", "es", "ar"] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const LANG_LABELS: Record<AppLang, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ar: "العربية",
};

const translations = {
  tr: {
    dashboard: "Panel",
    corridor: "Koridor",
    settings: "Kota / API",
    logout: "Çıkış",
    breaking_title: "Güvenlik & ticaret haberleri",
    breaking_subtitle: "Filtreli global akış — ~15 dk yenilenir",
    open_news: "Haberi aç →",
    loading_news: "Haberler yükleniyor…",
  },
  en: {
    dashboard: "Dashboard",
    corridor: "Corridor",
    settings: "Quota / API",
    logout: "Logout",
    breaking_title: "Security & trade news",
    breaking_subtitle: "Filtered global feed — refreshes ~every 15 min",
    open_news: "Open article →",
    loading_news: "Loading news…",
  },
  de: {
    dashboard: "Dashboard",
    corridor: "Korridor",
    settings: "Kontingent / API",
    logout: "Abmelden",
    breaking_title: "Sicherheits- und Handelsnachrichten",
    breaking_subtitle: "Gefilterter globaler Feed — Aktualisierung ~alle 15 Min",
    open_news: "Artikel öffnen →",
    loading_news: "Nachrichten werden geladen…",
  },
  fr: {
    dashboard: "Tableau de bord",
    corridor: "Corridor",
    settings: "Quota / API",
    logout: "Déconnexion",
    breaking_title: "Actualités sécurité et commerce",
    breaking_subtitle: "Flux mondial filtré — maj ~toutes les 15 min",
    open_news: "Ouvrir l’article →",
    loading_news: "Chargement des actualités…",
  },
  es: {
    dashboard: "Panel",
    corridor: "Corredor",
    settings: "Cuota / API",
    logout: "Cerrar sesión",
    breaking_title: "Noticias de seguridad y comercio",
    breaking_subtitle: "Feed global filtrado — se actualiza ~cada 15 min",
    open_news: "Abrir noticia →",
    loading_news: "Cargando noticias…",
  },
  ar: {
    dashboard: "لوحة التحكم",
    corridor: "الممر",
    settings: "الحصة / API",
    logout: "تسجيل الخروج",
    breaking_title: "أخبار الأمن والتجارة",
    breaking_subtitle: "خلاصة عالمية مفلترة — تحديث كل 15 دقيقة تقريبًا",
    open_news: "افتح الخبر ←",
    loading_news: "جارٍ تحميل الأخبار…",
  },
} as const;

type I18nValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  labels: typeof LANG_LABELS;
  t: (key: keyof (typeof translations)["tr"]) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>(() => {
    const stored = localStorage.getItem("app_lang") as AppLang | null;
    return stored && SUPPORTED_LANGS.includes(stored) ? stored : "tr";
  });

  const setLang = (next: AppLang) => {
    setLangState(next);
    localStorage.setItem("app_lang", next);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      labels: LANG_LABELS,
      t: (key: keyof (typeof translations)["tr"]) => translations[lang][key],
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
