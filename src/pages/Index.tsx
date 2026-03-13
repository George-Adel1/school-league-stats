import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Shield, Calendar, Swords, Layers, BarChart3, Star, Zap } from "lucide-react";
import SeasonGroupStage from "@/components/SeasonGroupStage";
import { useLanguage } from "@/hooks/useLanguage";

interface CountCard { label: string; count: number; icon: React.ElementType; }

const Dashboard = () => {
  const [counts, setCounts] = useState<CountCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCounts = async () => {
      const tables = [
        { table: "seasons", label: "Seasons", icon: Calendar },
        { table: "groups", label: "Groups", icon: Layers },
        { table: "teams", label: "Teams", icon: Shield },
        { table: "players", label: "Players", icon: Users },
        { table: "gameweeks", label: "Game Weeks", icon: Calendar },
        { table: "matches", label: "Matches", icon: Swords },
        { table: "fantasy_teams", label: "Fantasy Teams", icon: Star },
        { table: "chips", label: "Chips", icon: Zap },
      ] as const;

      const results = await Promise.all(
        tables.map(t => supabase.from(t.table).select("id", { count: "exact", head: true }))
      );

      setCounts(tables.map((t, i) => ({
        label: t.label,
        count: results[i].count ?? 0,
        icon: t.icon,
      })));
      setLoading(false);
    };
    fetchCounts();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Trophy className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Fantasy League Dashboard</h1>
          <p className="text-sm text-muted-foreground">School League Stats & Fantasy Football Platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
          ))
        ) : (
          counts.map(c => (
            <Card key={c.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <c.icon className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold">{c.count}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Fantasy System</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>⚽ <strong>Points Engine</strong> — Calculates fantasy points per player per match based on game rules</p>
            <p>🏆 <strong>6 Chips</strong> — 2 Captains, Wild Card, No Goalie, Bench Boost, Midfield Maestro, Aguerooooooo</p>
            <p>💰 <strong>70M Budget</strong> — Squad: 1 GK + 3 DEF + 3 MID + 2 FWD (max 2 per class)</p>
            <p>📊 <strong>Leaderboard</strong> — Real-time ranking of all fantasy teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Point System</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>⚽ Goals: GK=12, DEF=7, MID=4, FWD=3</p>
            <p>🅰️ Assists: GK=7, DEF=4, MID/FWD=3</p>
            <p>🧤 Clean sheet: GK=4, DEF=3</p>
            <p>🟨 Yellow=-1, 🟥 Red=-3, Own Goal=-2</p>
            <p>🥅 Penalty save=+5, Penalty miss=-3</p>
            <p>⭐ Ref bonus: 3/2/1 pts for top 3 players</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
