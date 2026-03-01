import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import MatchRow from "@/components/MatchRow";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Filter } from "lucide-react";

interface Match {
  id: string; date: string; gameweek_id: string; team1_id: string; team2_id: string;
  gameweeks?: { number: number; seasons?: { number: number } };
  team1?: { name: string }; team2?: { name: string };
}
interface Team { id: string; name: string; }
interface GameWeek { id: string; number: number; season_id: string; seasons?: { number: number } }
interface Season { id: string; number: number; }

const MatchesPage = () => {
  const [data, setData] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameweeks, setGameweeks] = useState<GameWeek[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState({ date: "", gameweek_id: "", team1_id: "", team2_id: "" });
  const [saving, setSaving] = useState(false);
  const [filterSeason, setFilterSeason] = useState<string>("all");
  const [filterGW, setFilterGW] = useState<string>("all");
  const { toast } = useToast();

  // Fetch team match stats for scores
  const [matchStats, setMatchStats] = useState<Record<string, { team_id: string; goals_scored: number }[]>>({});

  const fetchData = async () => {
    const [mRes, tRes, gwRes, sRes, statsRes] = await Promise.all([
      supabase.from("matches").select("*, gameweeks(number, seasons(number)), team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)").order("date", { ascending: false }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("gameweeks").select("*, seasons(number)").order("number"),
      supabase.from("seasons").select("*").order("number"),
      supabase.from("team_match_stats").select("match_id, team_id, goals_scored"),
    ]);
    if (mRes.error) toast({ title: "Error", description: mRes.error.message, variant: "destructive" });
    else setData(mRes.data || []);
    setTeams(tRes.data || []);
    setGameweeks(gwRes.data || []);
    setSeasons(sRes.data || []);

    // Group stats by match_id
    const grouped: Record<string, { team_id: string; goals_scored: number }[]> = {};
    (statsRes.data || []).forEach((s: any) => {
      if (!grouped[s.match_id]) grouped[s.match_id] = [];
      grouped[s.match_id].push({ team_id: s.team_id, goals_scored: s.goals_scored });
    });
    setMatchStats(grouped);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getMatchScore = (match: Match) => {
    const stats = matchStats[match.id];
    if (!stats || stats.length < 2) return { team1Score: undefined, team2Score: undefined };
    const t1 = stats.find(s => s.team_id === match.team1_id);
    const t2 = stats.find(s => s.team_id === match.team2_id);
    return { team1Score: t1?.goals_scored, team2Score: t2?.goals_scored };
  };

  const filteredData = data.filter(m => {
    if (filterSeason !== "all" && m.gameweeks?.seasons?.number !== Number(filterSeason)) return false;
    if (filterGW !== "all" && m.gameweeks?.number !== Number(filterGW)) return false;
    return true;
  });

  const openAdd = () => { setEditing(null); setForm({ date: "", gameweek_id: "", team1_id: "", team2_id: "" }); setDialogOpen(true); };
  const openEdit = (m: Match) => { setEditing(m); setForm({ date: m.date, gameweek_id: m.gameweek_id, team1_id: m.team1_id, team2_id: m.team2_id }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = editing
      ? await supabase.from("matches").update(form).eq("id", editing.id)
      : await supabase.from("matches").insert(form);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (m: Match) => {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", m.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Latest Matches
        </h1>
        <Button onClick={openAdd} size="sm" className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Match
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter :</span>
        </div>
        <Select value={filterSeason} onValueChange={setFilterSeason}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons.map(s => (
              <SelectItem key={s.id} value={String(s.number)}>Season {s.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterGW} onValueChange={setFilterGW}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Gameweek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gameweeks</SelectItem>
            {gameweeks.map(gw => (
              <SelectItem key={gw.id} value={String(gw.number)}>GW {gw.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Match List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card h-14 animate-pulse" />
          ))
        ) : filteredData.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">No matches found</div>
        ) : (
          filteredData.map(m => {
            const { team1Score, team2Score } = getMatchScore(m);
            return (
              <div key={m.id} className="group relative">
                <Link to={`/matches/${m.id}`}>
                  <MatchRow
                    team1Name={m.team1?.name ?? "TBD"}
                    team2Name={m.team2?.name ?? "TBD"}
                    team1Score={team1Score}
                    team2Score={team2Score}
                    date={m.date}
                    time="5:00 PM"
                  />
                </Link>
                {/* Admin actions on hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(m)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">Edit</button>
                  <button onClick={() => handleDelete(m)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors">Del</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog */}
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Match" : "Add Match"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Game Week</Label>
            <Select value={form.gameweek_id} onValueChange={v => setForm(f => ({ ...f, gameweek_id: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{gameweeks.map(gw => <SelectItem key={gw.id} value={gw.id}>GW{gw.number} (S{gw.seasons?.number})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Team 1</Label>
            <Select value={form.team1_id} onValueChange={v => setForm(f => ({ ...f, team1_id: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Team 2</Label>
            <Select value={form.team2_id} onValueChange={v => setForm(f => ({ ...f, team2_id: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default MatchesPage;
