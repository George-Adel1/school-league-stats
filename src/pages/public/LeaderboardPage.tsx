import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, TrendingUp } from "lucide-react";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Get all fantasy teams with profiles
      const { data: teams } = await supabase
        .from("fantasy_teams")
        .select("id, name, user_id, profiles(display_name)");

      // Get all match points
      const { data: allPoints } = await supabase
        .from("fantasy_team_match_points")
        .select("fantasy_team_id, points");

      const pointsMap: Record<string, number> = {};
      (allPoints || []).forEach((p: any) => {
        pointsMap[p.fantasy_team_id] = (pointsMap[p.fantasy_team_id] || 0) + p.points;
      });

      // Get gameweek points for trend
      const { data: gwPoints } = await supabase
        .from("fantasy_team_match_points")
        .select("fantasy_team_id, points, matches(gameweek_id, gameweeks(number))");

      const gwMap: Record<string, Record<number, number>> = {};
      (gwPoints || []).forEach((p: any) => {
        const gwNum = p.matches?.gameweeks?.number;
        if (!gwNum) return;
        if (!gwMap[p.fantasy_team_id]) gwMap[p.fantasy_team_id] = {};
        gwMap[p.fantasy_team_id][gwNum] = (gwMap[p.fantasy_team_id][gwNum] || 0) + p.points;
      });

      const lb = (teams || []).map((t: any) => ({
        ...t,
        totalPoints: pointsMap[t.id] || 0,
        gwPoints: gwMap[t.id] || {},
      })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

      setLeaderboard(lb);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl tracking-wide flex items-center gap-2">
        <Trophy className="w-6 h-6 text-success" /> Fantasy Leaderboard
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No fantasy teams yet. Create yours to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 0, 2].map(pos => {
                const entry = leaderboard[pos];
                if (!entry) return null;
                const isFirst = pos === 0;
                return (
                  <div key={entry.id} className={`flex flex-col items-center p-6 rounded-2xl border ${isFirst ? "border-yellow-500/30 bg-yellow-500/5 -mt-4" : "border-border bg-card"} transition-all`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isFirst ? "bg-yellow-500/20 text-yellow-500" : pos === 1 ? "bg-gray-400/20 text-gray-400" : "bg-orange-500/20 text-orange-500"}`}>
                      <Medal className="w-6 h-6" />
                    </div>
                    <p className="font-display text-xl tracking-wide">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.profiles?.display_name}</p>
                    <p className={`font-display text-3xl mt-2 ${isFirst ? "text-yellow-500" : "text-foreground"}`}>{entry.totalPoints}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Points</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium">Team</th>
                  <th className="text-left px-4 py-3 font-medium">Manager</th>
                  <th className="text-center px-4 py-3 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`font-bold ${i < 3 ? "text-success" : "text-muted-foreground"}`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{entry.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.profiles?.display_name}</td>
                    <td className="text-center px-4 py-3 font-bold text-success">{entry.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
