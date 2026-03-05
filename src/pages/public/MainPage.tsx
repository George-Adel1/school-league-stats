import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, ChevronLeft, Newspaper } from "lucide-react";

const MainPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [mRes, sRes, aRes] = await Promise.all([
        supabase.from("matches")
          .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, seasons(number))")
          .order("date", { ascending: false })
          .limit(6),
        supabase.from("team_season_stats")
          .select("*, teams(name, group_id, groups(number)), seasons(number)")
          .order("total_points", { ascending: false })
          .limit(6),
        supabase.from("announcements")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setMatches(mRes.data || []);
      setStandings(sRes.data || []);
      setAnnouncements(aRes.data || []);
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
    <div className="space-y-8 animate-fade-in">
      {/* News / Announcements Hero */}
      {loading ? (
        <div className="relative rounded-2xl overflow-hidden border border-border h-64 md:h-80 bg-muted animate-pulse" />
      ) : announcements.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden border border-border group">
          {/* Background Image */}
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
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            {/* Content */}
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
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-foreground max-w-2xl">
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

            {/* Navigation Arrows */}
            {announcements.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {announcements.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? "bg-success w-6"
                      : "bg-foreground/30 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Fallback when no announcements */
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-muted border border-border p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Your Don Bosco Football<br />Digital Stream
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Track real match performance, climb the standings, and see your name on the leaderboard inside the official Don Bosco League System.
          </p>
          <div className="mt-6">
            <span className="px-4 py-2 bg-success text-success-foreground font-bold text-sm rounded-full uppercase tracking-wider">
              More than 15+ Teams
            </span>
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide">Upcoming Matches</h2>
          <Link to="/matches" className="text-success text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.slice(0, 6).map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-success/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">GW{m.gameweeks?.number}</span>
                  <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full font-medium">
                    S{m.gameweeks?.seasons?.number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium truncate">{m.team1?.name}</p>
                  </div>
                  <div className="px-3">
                    <p className="text-xs text-muted-foreground">{m.date}</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium truncate">{m.team2?.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Standings Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-success" /> Standings
          </h2>
          <Link to="/standings" className="text-success text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Team</th>
                <th className="text-center px-3 py-3 font-medium">W</th>
                <th className="text-center px-3 py-3 font-medium">D</th>
                <th className="text-center px-3 py-3 font-medium">L</th>
                <th className="text-center px-3 py-3 font-medium">GD</th>
                <th className="text-center px-3 py-3 font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                  <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.teams?.name}</td>
                  <td className="text-center px-3 py-3">{s.wins}</td>
                  <td className="text-center px-3 py-3">{s.draws}</td>
                  <td className="text-center px-3 py-3">{s.losses}</td>
                  <td className="text-center px-3 py-3 font-medium">{s.goals_scored - s.goals_conceded}</td>
                  <td className="text-center px-3 py-3 font-bold text-success">{s.total_points}</td>
                </tr>
              ))}
              {standings.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No standings data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
