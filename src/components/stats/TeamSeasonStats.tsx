import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TSS { id: string; team_id: string; season_id: string; wins: number; draws: number; losses: number; goals_scored: number; goals_conceded: number; total_points: number; teams?: { name: string }; seasons?: { number: number }; }

const TeamSeasonStats = () => {
  const [data, setData] = useState<TSS[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TSS | null>(null);
  const [form, setForm] = useState({ team_id: "", season_id: "", wins: "0", draws: "0", losses: "0", goals_scored: "0", goals_conceded: "0", total_points: "0" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [res, tRes, sRes] = await Promise.all([
      supabase.from("team_season_stats").select("*, teams(name), seasons(number)").order("total_points", { ascending: false }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("seasons").select("*").order("number"),
    ]);
    if (res.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else setData(res.data || []);
    setTeams(tRes.data || []);
    setSeasons(sRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ team_id: "", season_id: "", wins: "0", draws: "0", losses: "0", goals_scored: "0", goals_conceded: "0", total_points: "0" }); setDialogOpen(true); };
  const openEdit = (s: TSS) => { setEditing(s); setForm({ team_id: s.team_id, season_id: s.season_id, wins: String(s.wins), draws: String(s.draws), losses: String(s.losses), goals_scored: String(s.goals_scored), goals_conceded: String(s.goals_conceded), total_points: String(s.total_points) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { team_id: form.team_id, season_id: form.season_id, wins: +form.wins, draws: +form.draws, losses: +form.losses, goals_scored: +form.goals_scored, goals_conceded: +form.goals_conceded, total_points: +form.total_points };
    const { error } = editing
      ? await supabase.from("team_season_stats").update(payload).eq("id", editing.id)
      : await supabase.from("team_season_stats").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (s: TSS) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("team_season_stats").delete().eq("id", s.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<TSS>[] = [
    { key: "team_id", label: "Team", render: (s) => s.teams?.name ?? "?" },
    { key: "season_id", label: "Season", render: (s) => `S${s.seasons?.number ?? "?"}` },
    { key: "wins", label: "W" },
    { key: "draws", label: "D" },
    { key: "losses", label: "L" },
    { key: "goals_scored", label: "GF" },
    { key: "goals_conceded", label: "GA" },
    { key: "goal_diff", label: "GD", render: (s) => { const gd = s.goals_scored - s.goals_conceded; return <span className={gd > 0 ? "text-success" : gd < 0 ? "text-destructive" : ""}>{gd > 0 ? `+${gd}` : gd}</span>; } },
    { key: "total_points", label: "Pts", render: (s) => <span className="font-bold">{s.total_points}</span> },
  ];

  return (
    <>
      <DataTable title="Team Season Stats" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit" : "Add"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))}><SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={form.season_id} onValueChange={v => setForm(f => ({ ...f, season_id: v }))}><SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger><SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["wins","draws","losses","goals_scored","goals_conceded","total_points"] as const).map(k => (
            <div key={k} className="space-y-1">
              <Label className="text-xs capitalize">{k.replace("_"," ")}</Label>
              <Input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
      </FormDialog>
    </>
  );
};

export default TeamSeasonStats;
