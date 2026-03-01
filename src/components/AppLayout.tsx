import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutGrid, BarChart3, Shield, Swords, Calendar,
  Users, Layers, Settings, LogOut, Trophy
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { path: "/", icon: LayoutGrid, label: "Dashboard" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/teams", icon: Shield, label: "Teams" },
  { path: "/matches", icon: Swords, label: "Matches" },
  { path: "/players", icon: Users, label: "Players" },
  { path: "/seasons", icon: Calendar, label: "Seasons" },
  { path: "/groups", icon: Layers, label: "Groups" },
  { path: "/gameweeks", icon: Calendar, label: "Game Weeks" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Icon-only sidebar */}
      <aside className="w-14 bg-sidebar flex flex-col items-center py-4 border-r border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-6">
          <Trophy className="w-4 h-4 text-primary-foreground" />
        </div>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Settings className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Settings</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Sign Out</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top announcement banner */}
        <div className="bg-primary px-4 py-2.5 flex items-center justify-between shrink-0">
          <p className="text-primary-foreground text-xs font-display uppercase tracking-wider">
            Think you know the best players in Don Bosco? Soon... you'll have to prove it.
          </p>
          <span className="text-primary-foreground font-display text-sm uppercase tracking-wider hidden sm:block">
            Fantasy Coming Soon!
          </span>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-5 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
