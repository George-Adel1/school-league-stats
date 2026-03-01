import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StatBar from "@/components/StatBar";
import { ArrowLeft } from "lucide-react";

interface MatchData {
  id: string;
  date: string;
  team1_id: string;
  team2_id: string;
  team1?: { name: string };
  team2?: { name: string };
}

interface TeamStats {
  team_id: string;
  goals_scored: number;
  goals_against: number;
}

interface PlayerStats {
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  total_saves: number;
  minutes_played: number;
  players?: { name: string; last_name: string; position: string; team_id: string };
}

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const [mRes, tsRes, psRes] = await Promise.all([
        supabase.from("matches").select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)").eq("id", id).single(),
        supabase.from("team_match_stats").select("*").eq("match_id", id),
        supabase.from("player_match_stats").select("*, players(name, last_name, position, team_id)").eq("match_id", id),
      ]);
      setMatch(mRes.data as any);
      setTeamStats((tsRes.data || []) as any);
      setPlayerStats((psRes.data || []) as any);
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="animate-fade-in p-8 text-center text-muted-foreground">Loading...</div>;
  if (!match) return <div className="p-8 text-center text-muted-foreground">Match not found</div>;

  const t1Stats = teamStats.find(s => s.team_id === match.team1_id);
  const t2Stats = teamStats.find(s => s.team_id === match.team2_id);
  const t1Score = t1Stats?.goals_scored ?? 0;
  const t2Score = t2Stats?.goals_scored ?? 0;

  const t1Players = playerStats.filter(p => p.players?.team_id === match.team1_id);
  const t2Players = playerStats.filter(p => p.players?.team_id === match.team2_id);

  const t1TotalGoals = t1Players.reduce((a, p) => a + p.goals, 0);
  const t2TotalGoals = t2Players.reduce((a, p) => a + p.goals, 0);
  const t1TotalAssists = t1Players.reduce((a, p) => a + p.assists, 0);
  const t2TotalAssists = t2Players.reduce((a, p) => a + p.assists, 0);
  const t1YC = t1Players.reduce((a, p) => a + p.yellow_cards, 0);
  const t2YC = t2Players.reduce((a, p) => a + p.yellow_cards, 0);
  const t1RC = t1Players.reduce((a, p) => a + p.red_cards, 0);
  const t2RC = t2Players.reduce((a, p) => a + p.red_cards, 0);
  const t1Saves = t1Players.reduce((a, p) => a + p.total_saves, 0);
  const t2Saves = t2Players.reduce((a, p) => a + p.total_saves, 0);

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Matches
      </Link>

      {/* Scoreboard */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Team 1 */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">{match.team1?.name?.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="font-display text-base md:text-lg font-semibold uppercase">{match.team1?.name}</span>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              <span className={t1Score > t2Score ? "text-primary" : ""}>{t1Score}</span>
              <span className="text-muted-foreground mx-2">:</span>
              <span className={t2Score > t1Score ? "text-primary" : ""}>{t2Score}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(match.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">{match.team2?.name?.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="font-display text-base md:text-lg font-semibold uppercase">{match.team2?.name}</span>
          </div>
        </div>

        {/* Goal Scorers */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            {t1Players.filter(p => p.goals > 0).map(p => (
              <p key={p.player_id} className="text-muted-foreground">
                ⚽ {p.players?.name} {p.players?.last_name} {p.goals > 1 ? `(${p.goals})` : ""}
              </p>
            ))}
          </div>
          <div className="space-y-1 text-right">
            {t2Players.filter(p => p.goals > 0).map(p => (
              <p key={p.player_id} className="text-muted-foreground">
                {p.players?.name} {p.players?.last_name} {p.goals > 1 ? `(${p.goals})` : ""} ⚽
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats Comparison */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold uppercase text-muted-foreground">Match Statistics</h3>
          <StatBar label="Goals" leftValue={t1TotalGoals} rightValue={t2TotalGoals} />
          <StatBar label="Assists" leftValue={t1TotalAssists} rightValue={t2TotalAssists} />
          <StatBar label="Saves" leftValue={t1Saves} rightValue={t2Saves} />
          <StatBar label="Yellow Cards" leftValue={t1YC} rightValue={t2YC} leftColor="hsl(var(--stat-cards))" rightColor="hsl(var(--stat-cards))" />
          <StatBar label="Red Cards" leftValue={t1RC} rightValue={t2RC} leftColor="hsl(var(--stat-goals))" rightColor="hsl(var(--stat-goals))" />
        </div>

        {/* Player Lineups */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm font-semibold uppercase text-muted-foreground mb-4">Player Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary">{match.team1?.name}</p>
              {t1Players.length === 0 ? (
                <p className="text-xs text-muted-foreground">No player stats</p>
              ) : (
                t1Players.map(p => (
                  <div key={p.player_id} className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="font-medium">{p.players?.name} {p.players?.last_name}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {p.goals > 0 && <span>⚽{p.goals}</span>}
                      {p.assists > 0 && <span>🅰️{p.assists}</span>}
                      {p.yellow_cards > 0 && <span>🟨</span>}
                      {p.red_cards > 0 && <span>🟥</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary">{match.team2?.name}</p>
              {t2Players.length === 0 ? (
                <p className="text-xs text-muted-foreground">No player stats</p>
              ) : (
                t2Players.map(p => (
                  <div key={p.player_id} className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="font-medium">{p.players?.name} {p.players?.last_name}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {p.goals > 0 && <span>⚽{p.goals}</span>}
                      {p.assists > 0 && <span>🅰️{p.assists}</span>}
                      {p.yellow_cards > 0 && <span>🟨</span>}
                      {p.red_cards > 0 && <span>🟥</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
