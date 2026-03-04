import { Link, useLocation } from "react-router-dom";
import { Trophy, BarChart3, Swords, Users, Home, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/main", label: "Home", icon: Home },
  { path: "/standings", label: "Standings", icon: BarChart3 },
  { path: "/matches", label: "Matches", icon: Swords },
  { path: "/players", label: "Players", icon: Users },
];

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { displayName } = useProfile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top announcement banner */}
      <div className="w-full bg-secondary border-b border-border px-4 py-2 flex items-center justify-between">
        <p className="text-xs md:text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Think you know the best players in Don Bosco? Soon... you'll have to prove it.
        </p>
        <span className="text-xs md:text-sm font-black text-success tracking-widest uppercase whitespace-nowrap ml-4">
          Fantasy Coming Soon!
        </span>
      </div>

      {/* Main navbar */}
      <nav className="w-full border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/main" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-success flex items-center justify-center">
              <Trophy className="w-4 h-4 text-success-foreground" />
            </div>
            <span className="font-black text-sm tracking-wider uppercase text-foreground">Goal Bosco</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {navItems.map(item => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-success/15 text-success"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User dropdown */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-2 outline-none">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline max-w-[120px] truncate">{displayName ?? "Account"}</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName ?? "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
