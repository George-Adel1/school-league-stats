import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Shield, Calendar, Swords, Layers, BarChart3 } from "lucide-react";

interface CountCard { label: string; count: number; icon: React.ElementType; }

const Dashboard = () => {
  const [counts, setCounts] = useState<CountCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const tables = [
        { table: "seasons", label: "Seasons", icon: Calendar },
        { table: "groups", label: "Groups", icon: Layers },
        { table: "teams", label: "Teams", icon: Shield },
        { table: "players", label: "Players", icon: Users },
        { table: "gameweeks", label: "Game Weeks", icon: Calendar },
        { table: "matches", label: "Matches", icon: Swords },
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
          <p className="text-sm text-muted-foreground">Optimized database — no redundant or derived columns stored</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Optimization Notes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✅ <strong>Match scores</strong> stored only in <code className="bg-muted px-1 rounded">team_match_stats</code> (removed from matches)</p>
            <p>✅ <strong>Goal difference</strong> calculated dynamically as <code className="bg-muted px-1 rounded">goals_scored - goals_conceded</code></p>
            <p>✅ <strong>Match result</strong> derived from <code className="bg-muted px-1 rounded">goals_scored vs goals_against</code></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Schema Info</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>📊 <strong>10 tables</strong> with full referential integrity</p>
            <p>🔑 All foreign keys with <code className="bg-muted px-1 rounded">ON DELETE CASCADE</code></p>
            <p>🔒 Row-level security enabled on all tables</p>
            <p>🚫 Zero redundant or derived columns in storage</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
