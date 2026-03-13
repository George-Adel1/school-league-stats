import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Season { id: string; number: number; }
interface Group { id: string; number: number; }
interface Team { id: string; name: string; group_id: string; }

const SeasonGroupStage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("seasons").select("id, number").order("number").then(({ data }) => {
      setSeasons(data || []);
      if (data && data.length > 0) setSelectedSeason(data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    Promise.all([
      supabase.from("groups").select("id, number").order("number"),
      supabase.from("teams").select("id, name, group_id").order("name"),
    ]).then(([gRes, tRes]) => {
      setGroups(gRes.data || []);
      setTeams(tRes.data || []);
      setLoading(false);
    });
  }, [selectedSeason]);

  const getTeamsByGroup = (groupId: string) => teams.filter(t => t.group_id === groupId);

  return (
    <div className="rounded-xl border-2 border-[#00FF88] bg-[#0a0a0a] p-6 font-mono">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#00FF88] font-bold">Season</span>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-40 bg-[#0a0a0a] border-[#00FF88]/30 text-white font-mono uppercase text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-[#00FF88]/30">
            {seasons.map(s => (
              <SelectItem key={s.id} value={s.id} className="font-mono uppercase text-white">
                Season {s.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#00FF88]" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-center text-white/50 py-16 uppercase text-sm tracking-wider">No groups found</p>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10">
          {groups.slice(0, 4).map(group => {
            const groupTeams = getTeamsByGroup(group.id);
            return (
              <div key={group.id} className="p-5 min-h-[140px]">
                <p className="text-white font-bold uppercase text-sm tracking-wider mb-3">
                  Group {group.number}
                </p>
                {groupTeams.length === 0 ? (
                  <p className="text-white/30 text-xs uppercase">No teams</p>
                ) : (
                  <div className="space-y-1.5">
                    {groupTeams.map(team => (
                      <p key={team.id} className="text-white/80 text-xs uppercase tracking-wide">
                        {team.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeasonGroupStage;
