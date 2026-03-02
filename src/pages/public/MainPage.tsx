import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";

const MainPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [mRes, sRes] = await Promise.all([
        supabase.from("matches")
          .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, seasons(number))")
          .order("date", { ascending: false })
          .limit(6),
        supabase.from("team_season_stats")
          .select("*, teams(name, group_id, groups(number)), seasons(number)")
          .order("total_points", { ascending: false })
          .limit(6),
      ]);
      setMatches(mRes.data || []);
      setStandings(sRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] p-8 md:p-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
          Your Don Bosco Football<br />Digital Stream
        </h1>
        <p className="mt-4 text-[#888] max-w-xl text-sm md:text-base leading-relaxed">
          Track real match performance, climb the standings, and see your name on the leaderboard inside the official Don Bosco League System.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <span className="px-4 py-2 bg-[#00c853] text-black font-bold text-sm rounded-full uppercase tracking-wider">
            More than 15+ Teams
          </span>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide">Upcoming Matches</h2>
          <Link to="/matches" className="text-[#00c853] text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-[#1a1a1a] rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.slice(0, 6).map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#00c853]/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#888]">GW{m.gameweeks?.number}</span>
                  <span className="text-xs bg-[#00c853]/15 text-[#00c853] px-2 py-0.5 rounded-full font-medium">
                    S{m.gameweeks?.seasons?.number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 text-[#888]" />
                    </div>
                    <p className="text-xs font-medium truncate">{m.team1?.name}</p>
                  </div>
                  <div className="px-3">
                    <p className="text-xs text-[#888]">{m.date}</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 text-[#888]" />
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
            <Trophy className="w-5 h-5 text-[#00c853]" /> Standings
          </h2>
          <Link to="/standings" className="text-[#00c853] text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-[#888]">
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
                <tr key={s.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#888]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.teams?.name}</td>
                  <td className="text-center px-3 py-3">{s.wins}</td>
                  <td className="text-center px-3 py-3">{s.draws}</td>
                  <td className="text-center px-3 py-3">{s.losses}</td>
                  <td className="text-center px-3 py-3 font-medium">{s.goals_scored - s.goals_conceded}</td>
                  <td className="text-center px-3 py-3 font-bold text-[#00c853]">{s.total_points}</td>
                </tr>
              ))}
              {standings.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center py-8 text-[#888]">No standings data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
