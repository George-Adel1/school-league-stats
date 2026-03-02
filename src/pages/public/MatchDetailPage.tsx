import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

const StatBar = ({ label, val1, val2 }: { label: string; val1: number; val2: number }) => {
  const total = val1 + val2 || 1;
  const p1 = (val1 / total) * 100;
  const p2 = (val2 / total) * 100;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 text-right font-bold">{val1}</span>
      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-[#2a2a2a]">
        <div className="bg-[#00c853] rounded-l-full" style={{ width: `${p1}%` }} />
        <div className="bg-red-500 rounded-r-full" style={{ width: `${p2}%` }} />
      </div>
      <span className="w-8 font-bold">{val2}</span>
      <span className="w-28 text-[#888] text-xs">{label}</span>
    </div>
  );
};

const MatchDetailPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [mRes, tsRes, psRes] = await Promise.all([
        supabase.from("matches")
          .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, seasons(number))")
          .eq("id", id!)
          .single(),
        supabase.from("team_match_stats")
          .select("*, teams(name)")
          .eq("match_id", id!),
        supabase.from("player_match_stats")
          .select("*, players(name, last_name, position, team_id)")
          .eq("match_id", id!),
      ]);
      setMatch(mRes.data);
      setTeamStats(tsRes.data || []);
      setPlayerStats(psRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-[#888]">Loading...</div>;
  if (!match) return <div className="text-center py-12 text-[#888]">Match not found</div>;

  const t1Stats = teamStats.find(s => s.team_id === match.team1_id);
  const t2Stats = teamStats.find(s => s.team_id === match.team2_id);
  const t1Score = t1Stats?.goals_scored ?? 0;
  const t2Score = t2Stats?.goals_scored ?? 0;

  const t1Players = playerStats.filter(p => p.players?.team_id === match.team1_id);
  const t2Players = playerStats.filter(p => p.players?.team_id === match.team2_id);

  const t1Goals = t1Players.filter(p => p.goals > 0);
  const t2Goals = t2Players.filter(p => p.goals > 0);

  const sumStat = (list: any[], key: string) => list.reduce((acc, p) => acc + (p[key] || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Scoreboard */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-10 text-center">
        <div className="flex items-center justify-center gap-6 md:gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-[#888]" />
            </div>
            <p className="font-bold text-lg">{match.team1?.name}</p>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black">
              <span className={t1Score > t2Score ? "text-[#00c853]" : ""}>{t1Score}</span>
              <span className="text-[#888] mx-2">:</span>
              <span className={t2Score > t1Score ? "text-[#00c853]" : ""}>{t2Score}</span>
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#2a2a2a] flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-[#888]" />
            </div>
            <p className="font-bold text-lg">{match.team2?.name}</p>
          </div>
        </div>
        <p className="text-[#888] text-sm mt-4">{match.date} · GW{match.gameweeks?.number} · Season {match.gameweeks?.seasons?.number}</p>
      </div>

      {/* Goal Scorers */}
      {(t1Goals.length > 0 || t2Goals.length > 0) && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase text-[#888] mb-3">Goal Scorers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              {t1Goals.map(p => (
                <p key={p.id} className="text-sm">
                  ⚽ {p.players?.name} {p.players?.last_name} {p.goals > 1 ? `(${p.goals})` : ""}
                </p>
              ))}
            </div>
            <div className="space-y-1 text-right">
              {t2Goals.map(p => (
                <p key={p.id} className="text-sm">
                  {p.players?.name} {p.players?.last_name} {p.goals > 1 ? `(${p.goals})` : ""} ⚽
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Bars */}
      {t1Stats && t2Stats && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold uppercase text-[#888] mb-3">Match Statistics</h3>
          <StatBar label="Assists" val1={sumStat(t1Players, "assists")} val2={sumStat(t2Players, "assists")} />
          <StatBar label="Goals" val1={t1Score} val2={t2Score} />
          <StatBar label="Yellow Cards" val1={sumStat(t1Players, "yellow_cards")} val2={sumStat(t2Players, "yellow_cards")} />
          <StatBar label="Red Cards" val1={sumStat(t1Players, "red_cards")} val2={sumStat(t2Players, "red_cards")} />
          <StatBar label="Saves" val1={sumStat(t1Players, "total_saves")} val2={sumStat(t2Players, "total_saves")} />
        </div>
      )}

      {/* Lineups */}
      <div className="grid grid-cols-2 gap-4">
        {[{ label: match.team1?.name, players: t1Players }, { label: match.team2?.name, players: t2Players }].map(side => (
          <div key={side.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <h3 className="text-sm font-bold uppercase text-[#888] mb-3">{side.label}</h3>
            {side.players.length === 0 ? (
              <p className="text-xs text-[#888]">No player data</p>
            ) : (
              <div className="space-y-2">
                {side.players.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.players?.name} {p.players?.last_name}</span>
                    <div className="flex items-center gap-2 text-xs text-[#888]">
                      {p.goals > 0 && <span className="text-[#00c853]">⚽{p.goals}</span>}
                      {p.assists > 0 && <span className="text-blue-400">🅰️{p.assists}</span>}
                      {p.yellow_cards > 0 && <span className="text-yellow-400">🟨{p.yellow_cards}</span>}
                      {p.red_cards > 0 && <span className="text-red-400">🟥{p.red_cards}</span>}
                      <span>{p.minutes_played}'</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchDetailPage;
