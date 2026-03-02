import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";

const StandingsPage = () => {
  const [standings, setStandings] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      const [sRes, gRes] = await Promise.all([
        supabase.from("seasons").select("*").order("number"),
        supabase.from("groups").select("*").order("number"),
      ]);
      setSeasons(sRes.data || []);
      setGroups(gRes.data || []);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      let query = supabase.from("team_season_stats")
        .select("*, teams(name, group_id, groups(number)), seasons(number)")
        .order("total_points", { ascending: false });

      if (selectedSeason !== "all") query = query.eq("season_id", selectedSeason);

      const { data } = await query;
      let filtered = data || [];
      if (selectedGroup !== "all") {
        filtered = filtered.filter((s: any) => s.teams?.group_id === selectedGroup);
      }
      setStandings(filtered);
      setLoading(false);
    };
    fetchStandings();
  }, [selectedSeason, selectedGroup]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#00c853]" /> Standings
        </h1>
        <div className="flex items-center gap-3">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-36 bg-[#1a1a1a] border-[#2a2a2a] text-white">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-36 bg-[#1a1a1a] border-[#2a2a2a] text-white">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map(g => <SelectItem key={g.id} value={g.id}>Group {g.number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#888]">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Team</th>
              <th className="text-center px-3 py-3 font-medium">Group</th>
              <th className="text-center px-3 py-3 font-medium">W</th>
              <th className="text-center px-3 py-3 font-medium">D</th>
              <th className="text-center px-3 py-3 font-medium">L</th>
              <th className="text-center px-3 py-3 font-medium">GF</th>
              <th className="text-center px-3 py-3 font-medium">GA</th>
              <th className="text-center px-3 py-3 font-medium">GD</th>
              <th className="text-center px-3 py-3 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-12 text-[#888]">Loading...</td></tr>
            ) : standings.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-12 text-[#888]">No standings data yet</td></tr>
            ) : (
              standings.map((s, i) => (
                <tr key={s.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#888]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                      <Trophy className="w-3 h-3 text-[#888]" />
                    </div>
                    {s.teams?.name}
                  </td>
                  <td className="text-center px-3 py-3 text-[#888]">{s.teams?.groups?.number}</td>
                  <td className="text-center px-3 py-3">{s.wins}</td>
                  <td className="text-center px-3 py-3">{s.draws}</td>
                  <td className="text-center px-3 py-3">{s.losses}</td>
                  <td className="text-center px-3 py-3">{s.goals_scored}</td>
                  <td className="text-center px-3 py-3">{s.goals_conceded}</td>
                  <td className="text-center px-3 py-3 font-medium">{s.goals_scored - s.goals_conceded}</td>
                  <td className="text-center px-3 py-3 font-bold text-[#00c853]">{s.total_points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsPage;
