import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import MatchCard from "@/components/MatchCard";
import StandingsTable from "@/components/StandingsTable";
import { Swords, Trophy } from "lucide-react";

interface MatchWithTeams {
  id: string;
  date: string;
  team1: { name: string } | null;
  team2: { name: string } | null;
  team_match_stats?: { team_id: string; goals_scored: number; goals_against: number }[];
}

interface StandingRow {
  rank: number;
  teamName: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalDiff: number;
}

const Dashboard = () => {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [mRes, sRes] = await Promise.all([
        supabase
          .from("matches")
          .select("id, date, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)")
          .order("date", { ascending: false })
          .limit(6),
        supabase
          .from("team_season_stats")
          .select("*, teams(name)")
          .order("total_points", { ascending: false }),
      ]);

      setMatches((mRes.data as any) || []);

      const sData = (sRes.data || []) as any[];
      setStandings(
        sData.map((s, i) => ({
          rank: i + 1,
          teamName: s.teams?.name ?? "Unknown",
          wins: s.wins,
          draws: s.draws,
          losses: s.losses,
          points: s.total_points,
          goalDiff: s.goals_scored - s.goals_conceded,
        }))
      );
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Banner */}
      <div className="surface-dark rounded-xl p-6 md:p-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
          Your Don Bosco Football Digital Stream
        </h1>
        <p className="text-sm mt-2 opacity-70 max-w-lg">
          Track real match performance, climb the standings, and see your name on the leaderboard inside the official Don Bosco League System.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Upcoming Matches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold uppercase flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary" />
              Upcoming Matches
            </h2>
            <Link to="/matches" className="text-xs text-primary hover:underline font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-[120px] animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No matches yet. Add matches from the admin panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {matches.map((m) => (
                <Link key={m.id} to={`/matches/${m.id}`}>
                  <MatchCard
                    team1Name={m.team1?.name ?? "TBD"}
                    team2Name={m.team2?.name ?? "TBD"}
                    date={m.date}
                    time="5:30 PM"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Standings */}
        <div>
          <StandingsTable data={standings} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
