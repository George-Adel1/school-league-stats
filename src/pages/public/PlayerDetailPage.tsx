import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

const PlayerDetailPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [seasonStats, setSeasonStats] = useState<any[]>([]);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [pRes, ssRes, msRes] = await Promise.all([
        supabase.from("players").select("*, teams(name)").eq("id", id!).single(),
        supabase.from("player_season_stats").select("*, seasons(number)").eq("player_id", id!),
        supabase.from("player_match_stats")
          .select("*, matches(date, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name))")
          .eq("player_id", id!)
          .order("match_id"),
      ]);
      setPlayer(pRes.data);
      setSeasonStats(ssRes.data || []);
      setMatchStats(msRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-[#888]">Loading...</div>;
  if (!player) return <div className="text-center py-12 text-[#888]">Player not found</div>;

  const statKeys = ["goals", "assists", "clean_sheets", "yellow_cards", "red_cards", "own_goals", "total_saves", "penalties_saved", "penalties_missed"];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Player Header */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
          <Users className="w-8 h-8 text-[#888]" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase">{player.name} {player.last_name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#888]">
            <span className="px-2 py-0.5 rounded-full bg-[#2a2a2a] text-xs font-semibold">{player.position}</span>
            <span>{player.teams?.name}</span>
            <span className="text-[#00c853] font-medium">${player.price}</span>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      {seasonStats.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase text-[#888] mb-3">Season Stats</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-[#888]">
                  <th className="text-left px-3 py-2 font-medium">Season</th>
                  {statKeys.map(k => <th key={k} className="text-center px-2 py-2 font-medium text-xs">{k.replace(/_/g, " ")}</th>)}
                </tr>
              </thead>
              <tbody>
                {seasonStats.map(s => (
                  <tr key={s.id} className="border-b border-[#2a2a2a]/50">
                    <td className="px-3 py-2 font-medium">S{s.seasons?.number}</td>
                    {statKeys.map(k => <td key={k} className="text-center px-2 py-2">{s[k]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Match Stats */}
      {matchStats.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase text-[#888] mb-3">Match History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-[#888]">
                  <th className="text-left px-3 py-2 font-medium">Match</th>
                  <th className="text-center px-2 py-2 font-medium">Min</th>
                  {statKeys.map(k => <th key={k} className="text-center px-2 py-2 font-medium text-xs">{k.replace(/_/g, " ")}</th>)}
                </tr>
              </thead>
              <tbody>
                {matchStats.map(s => (
                  <tr key={s.id} className="border-b border-[#2a2a2a]/50">
                    <td className="px-3 py-2 text-xs">
                      {s.matches?.team1?.name} vs {s.matches?.team2?.name}
                      <span className="text-[#888] ml-1">({s.matches?.date})</span>
                    </td>
                    <td className="text-center px-2 py-2">{s.minutes_played}'</td>
                    {statKeys.map(k => <td key={k} className="text-center px-2 py-2">{s[k]}</td>)}
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

export default PlayerDetailPage;
