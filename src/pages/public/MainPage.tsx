import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, ChevronLeft, Newspaper, Star, Zap, Shield, Calendar } from "lucide-react";

interface WeekHighlight {
  bestPlayer: { name: string; lastName: string; goals: number; assists: number; teamName: string } | null;
  bestTeam: { name: string; goalsScored: number; goalsAgainst: number } | null;
  topScorer: { name: string; lastName: string; goals: number; teamName: string } | null;
  gameweekNumber: number | null;
}

const MainPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<WeekHighlight>({
    bestPlayer: null, bestTeam: null, topScorer: null, gameweekNumber: null,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Get latest gameweek
      const { data: latestGw } = await supabase
        .from("gameweeks")
        .select("id, number, season_id")
        .order("start_date", { ascending: false })
        .limit(1)
        .single();

      const gwId = latestGw?.id;

      const [mRes, aRes, playerStatsRes, teamStatsRes] = await Promise.all([
        supabase.from("matches")
          .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, seasons(number))")
          .order("date", { ascending: false })
          .limit(6),
        supabase.from("announcements")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(10),
        gwId
          ? supabase.from("player_match_stats")
              .select("goals, assists, players(name, last_name, teams(name)), matches!inner(gameweek_id)")
              .eq("matches.gameweek_id", gwId)
          : Promise.resolve({ data: [] }),
        gwId
          ? supabase.from("team_match_stats")
              .select("goals_scored, goals_against, teams(name), matches!inner(gameweek_id)")
              .eq("matches.gameweek_id", gwId)
          : Promise.resolve({ data: [] }),
      ]);

      setMatches(mRes.data || []);
      setAnnouncements(aRes.data || []);

      // Calculate highlights
      const pStats = (playerStatsRes.data || []) as any[];
      const tStats = (teamStatsRes.data || []) as any[];

      let bestPlayer = null;
      let topScorer = null;
      if (pStats.length > 0) {
        const sorted = [...pStats].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
        const bp = sorted[0];
        if (bp && bp.players) {
          bestPlayer = {
            name: bp.players.name,
            lastName: bp.players.last_name,
            goals: bp.goals,
            assists: bp.assists,
            teamName: bp.players.teams?.name || "",
          };
        }
        const goalSorted = [...pStats].sort((a, b) => b.goals - a.goals);
        const ts = goalSorted[0];
        if (ts && ts.players && ts.goals > 0) {
          topScorer = {
            name: ts.players.name,
            lastName: ts.players.last_name,
            goals: ts.goals,
            teamName: ts.players.teams?.name || "",
          };
        }
      }

      // Aggregate team stats
      let bestTeam = null;
      if (tStats.length > 0) {
        const teamMap: Record<string, { name: string; goalsScored: number; goalsAgainst: number }> = {};
        tStats.forEach((t: any) => {
          const name = t.teams?.name || "Unknown";
          if (!teamMap[name]) teamMap[name] = { name, goalsScored: 0, goalsAgainst: 0 };
          teamMap[name].goalsScored += t.goals_scored;
          teamMap[name].goalsAgainst += t.goals_against;
        });
        const sorted = Object.values(teamMap).sort((a, b) => b.goalsScored - a.goalsScored);
        bestTeam = sorted[0] || null;
      }

      setHighlights({
        bestPlayer,
        bestTeam,
        topScorer,
        gameweekNumber: latestGw?.number || null,
      });

      setLoading(false);
    };
    fetchData();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + announcements.length) % announcements.length);
  }, [announcements.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % announcements.length);
  }, [announcements.length]);

  const currentAnnouncement = announcements[currentSlide];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* News / Announcements Hero */}
      {loading ? (
        <div className="relative rounded-2xl overflow-hidden border border-border h-64 md:h-80 bg-muted animate-pulse" />
      ) : announcements.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden border border-border group">
          <div className="relative h-64 md:h-80">
            {currentAnnouncement.image_url ? (
              <img
                src={currentAnnouncement.image_url}
                alt={currentAnnouncement.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-success text-success-foreground">
                  <Newspaper className="w-3 h-3" />
                  News
                </span>
                {announcements.length > 1 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentSlide + 1} / {announcements.length}
                  </span>
                )}
              </div>
              <h2 className="font-display text-3xl md:text-5xl tracking-wide leading-none text-foreground max-w-2xl">
                {currentAnnouncement.title}
              </h2>
              {currentAnnouncement.body && (
                <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl line-clamp-2">
                  {currentAnnouncement.body}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(currentAnnouncement.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </p>
            </div>

            {announcements.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}
          </div>

          {announcements.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide ? "bg-success w-6" : "bg-foreground/30 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-muted border border-border p-8 md:p-12">
          <h1 className="font-display text-4xl md:text-6xl tracking-wide leading-none">
            Your Don Bosco Football<br />Digital Stream
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Track real match performance, climb the standings, and see your name on the leaderboard.
          </p>
          <div className="mt-6">
            <span className="px-4 py-2 bg-success text-success-foreground font-bold text-sm rounded-full uppercase tracking-wider">
              More than 15+ Teams
            </span>
          </div>
        </div>
      )}

      {/* Weekly Highlights */}
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-wide mb-5 flex items-center gap-2">
          <Zap className="w-5 h-5 text-success" />
          {highlights.gameweekNumber ? `Gameweek ${highlights.gameweekNumber} Highlights` : "Weekly Highlights"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Player */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 group hover:border-success/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-bl-full" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Best Player</p>
                <p className="text-xs text-muted-foreground">of the week</p>
              </div>
            </div>
            {highlights.bestPlayer ? (
              <>
                <p className="font-display text-2xl md:text-3xl tracking-wide leading-none">
                  {highlights.bestPlayer.name} {highlights.bestPlayer.lastName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{highlights.bestPlayer.teamName}</p>
                <div className="flex gap-4 mt-4">
                  <div className="text-center">
                    <p className="font-display text-2xl text-success">{highlights.bestPlayer.goals}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-2xl text-info">{highlights.bestPlayer.assists}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assists</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm mt-2">No data yet</p>
            )}
          </div>

          {/* Best Goal */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 group hover:border-warning/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-bl-full" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Top Scorer</p>
                <p className="text-xs text-muted-foreground">of the week</p>
              </div>
            </div>
            {highlights.topScorer ? (
              <>
                <p className="font-display text-2xl md:text-3xl tracking-wide leading-none">
                  {highlights.topScorer.name} {highlights.topScorer.lastName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{highlights.topScorer.teamName}</p>
                <div className="mt-4">
                  <p className="font-display text-3xl text-warning">{highlights.topScorer.goals}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Goals Scored</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm mt-2">No data yet</p>
            )}
          </div>

          {/* Best Team */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 group hover:border-info/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-info/5 rounded-bl-full" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Best Team</p>
                <p className="text-xs text-muted-foreground">of the week</p>
              </div>
            </div>
            {highlights.bestTeam ? (
              <>
                <p className="font-display text-2xl md:text-3xl tracking-wide leading-none">
                  {highlights.bestTeam.name}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="text-center">
                    <p className="font-display text-2xl text-success">{highlights.bestTeam.goalsScored}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scored</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-2xl text-destructive">{highlights.bestTeam.goalsAgainst}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conceded</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm mt-2">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl md:text-3xl tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-success" /> Upcoming Matches
          </h2>
          <Link to="/matches" className="text-success text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : matches.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No upcoming matches</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.slice(0, 6).map(m => (
              <div
                key={m.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-success/30 transition-all group"
              >
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                      GW {m.gameweeks?.number}
                    </span>
                    <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-md font-bold">
                      S{m.gameweeks?.seasons?.number}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary border border-border flex items-center justify-center mb-2 group-hover:border-success/30 transition-colors">
                      <span className="font-display text-xl text-foreground">
                        {m.team1?.name?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{m.team1?.name}</p>
                  </div>

                  <div className="flex flex-col items-center gap-1 px-2">
                    <span className="font-display text-2xl text-muted-foreground tracking-wider">VS</span>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary border border-border flex items-center justify-center mb-2 group-hover:border-success/30 transition-colors">
                      <span className="font-display text-xl text-foreground">
                        {m.team2?.name?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{m.team2?.name}</p>
                  </div>
                </div>

                {/* Decorative accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-success/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
