import { Link, NavLink } from "react-router-dom";
import { LogOut, Map, Settings, LayoutDashboard, Globe2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SUPPORTED_LANGS, useI18n, type AppLang } from "../context/I18nContext";

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-surface-600 text-white" : "text-slate-400 hover:text-white"}`;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { lang, setLang, labels, t } = useI18n();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-surface-600/60 bg-surface-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-100">
            <Globe2 className="h-6 w-6 text-accent-cyan" />
            <span className="font-semibold">Risk Intelligence</span>
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navCls}>
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                {t("dashboard")}
              </span>
            </NavLink>
            <NavLink to="/corridor" className={navCls}>
              <span className="inline-flex items-center gap-1.5">
                <Map className="h-4 w-4" />
                {t("corridor")}
              </span>
            </NavLink>
            <NavLink to="/settings" className={navCls}>
              <span className="inline-flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                {t("settings")}
              </span>
            </NavLink>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 md:inline">
              {user?.org_name} · <span className="text-accent-amber">{user?.subscription_tier}</span>
            </span>
                        <select
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLang)}
              className="rounded-lg border border-surface-600 bg-surface-800 px-2 py-1 text-xs text-slate-200"
              aria-label="Language"
            >
              {SUPPORTED_LANGS.map((code) => (
                <option key={code} value={code}>
                  {labels[code]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-400 hover:bg-surface-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
