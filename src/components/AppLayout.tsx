import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  Trophy, Users, Shield, Calendar, Swords, BarChart3,
  LogOut, ChevronLeft, ChevronRight, Home, Layers, Newspaper, Zap, Star, Languages
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/admin/dashboard", labelKey: "dashboard", icon: Home },
  { path: "/admin/seasons", labelKey: "seasons", icon: Calendar },
  { path: "/admin/groups", labelKey: "groups", icon: Layers },
  { path: "/admin/teams", labelKey: "teams", icon: Shield },
  { path: "/admin/players", labelKey: "players", icon: Users },
  { path: "/admin/gameweeks", labelKey: "gameweeks", icon: Calendar },
  { path: "/admin/matches", labelKey: "matches", icon: Swords },
  { path: "/admin/stats", labelKey: "stats", icon: BarChart3 },
  { path: "/admin/announcements", labelKey: "news", icon: Newspaper },
  { path: "/admin/chips", labelKey: "chips", icon: Zap },
  { path: "/admin/fantasy", labelKey: "fantasy", icon: Star },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const { lang, toggle, t } = useLanguage();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${collapsed ? "w-16" : "w-56"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200`}>
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-sidebar-foreground text-sm truncate">{t("fantasyLeague")}</span>}
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button onClick={toggle} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full">
            <Languages className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{lang === "en" ? "العربية" : "English"}</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>{t("collapse")}</span></>}
          </button>
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("signOut")}</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
