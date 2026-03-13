import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Season { id: string; number: number; }
interface Group { id: string; number: number; }
interface Team { id: string; name: string; group_id: string; }

const SeasonGroupStage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Season selector */}
      <div className="flex items-center gap-3 mb-6">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-48 bg-background border-border text-foreground text-sm">
            <SelectValue placeholder={t("selectSeason")} />
          </SelectTrigger>
          <SelectContent>
            {seasons.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {t("season")} {s.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">{t("noGroupsFound")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map(group => {
            const groupTeams = getTeamsByGroup(group.id);
            return (
              <div key={group.id} className="rounded-lg border border-border bg-muted/30 p-4 min-h-[120px]">
                <p className="text-foreground font-bold text-sm mb-3">
                  {t("group")} {group.number}
                </p>
                {groupTeams.length === 0 ? (
                  <p className="text-muted-foreground text-xs">{t("noTeams")}</p>
                ) : (
                  <div className="space-y-1.5">
                    {groupTeams.map(team => (
                      <p key={team.id} className="text-muted-foreground text-xs">
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
