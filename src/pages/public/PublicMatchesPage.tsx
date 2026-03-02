import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, ChevronRight, Clock } from "lucide-react";

const PublicMatchesPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [gameweeks, setGameweeks] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedGameweek, setSelectedGameweek] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      const [sRes, gwRes] = await Promise.all([
        supabase.from("seasons").select("*").order("number"),
        supabase.from("gameweeks").select("*, seasons(number)").order("number"),
      ]);
      setSeasons(sRes.data || []);
      setGameweeks(gwRes.data || []);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      let query = supabase.from("matches")
        .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, season_id, seasons(number)), team_match_stats(team_id, goals_scored, goals_against)")
        .order("date", { ascending: false });

      if (selectedGameweek !== "all") query = query.eq("gameweek_id", selectedGameweek);

      const { data } = await query;
      let filtered = data || [];
      if (selectedSeason !== "all") {
        filtered = filtered.filter((m: any) => m.gameweeks?.season_id === selectedSeason);
      }
      setMatches(filtered);
      setLoading(false);
    };
    fetchMatches();
  }, [selectedSeason, selectedGameweek]);

  const getScore = (match: any) => {
    const stats = match.team_match_stats || [];
    const t1 = stats.find((s: any) => s.team_id === match.team1_id);
    const t2 = stats.find((s: any) => s.team_id === match.team2_id);
    if (t1 && t2) return `${t1.goals_scored} - ${t2.goals_scored}`;
    return "vs";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
          <Swords className="w-6 h-6 text-[#00c853]" /> Matches
        </h1>
        <div className="flex items-center gap-3 text-sm text-[#888]">
          <span>Filter:</span>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#2a2a2a] text-white text-xs">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedGameweek} onValueChange={setSelectedGameweek}>
            <SelectTrigger className="w-36 bg-[#1a1a1a] border-[#2a2a2a] text-white text-xs">
              <SelectValue placeholder="Gameweek" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All Gameweeks</SelectItem>
              {gameweeks.map(gw => <SelectItem key={gw.id} value={gw.id}>GW{gw.number} (S{gw.seasons?.number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse" />)
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-[#888]">No matches found</div>
        ) : (
          matches.map(m => (
            <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 hover:border-[#00c853]/40 transition-colors group">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-sm font-medium w-24 truncate">{m.team1?.name}</span>
                <span className="px-3 py-1 bg-[#2a2a2a] rounded-md text-sm font-bold min-w-[60px] text-center">
                  {getScore(m)}
                </span>
                <span className="text-sm font-medium w-24 truncate">{m.team2?.name}</span>
              </div>
              <div className="flex items-center gap-4 text-[#888] text-xs">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.date}</span>
                <span>GW{m.gameweeks?.number}</span>
                <ChevronRight className="w-4 h-4 text-[#00c853] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicMatchesPage;
