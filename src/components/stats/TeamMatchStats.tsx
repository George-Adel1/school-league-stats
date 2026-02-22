import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TMS { id: string; team_id: string; match_id: string; goals_scored: number; goals_against: number; teams?: { name: string }; matches?: { date: string } }

const TeamMatchStats = () => {
  const [data, setData] = useState<TMS[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TMS | null>(null);
  const [form, setForm] = useState({ team_id: "", match_id: "", goals_scored: "0", goals_against: "0" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [res, tRes, mRes] = await Promise.all([
      supabase.from("team_match_stats").select("*, teams(name), matches(date)"),
      supabase.from("teams").select("*").order("name"),
      supabase.from("matches").select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)").order("date", { ascending: false }),
    ]);
    if (res.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else setData(res.data || []);
    setTeams(tRes.data || []);
    setMatches(mRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ team_id: "", match_id: "", goals_scored: "0", goals_against: "0" }); setDialogOpen(true); };
  const openEdit = (s: TMS) => { setEditing(s); setForm({ team_id: s.team_id, match_id: s.match_id, goals_scored: String(s.goals_scored), goals_against: String(s.goals_against) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { team_id: form.team_id, match_id: form.match_id, goals_scored: +form.goals_scored, goals_against: +form.goals_against };
    const { error } = editing
      ? await supabase.from("team_match_stats").update(payload).eq("id", editing.id)
      : await supabase.from("team_match_stats").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (s: TMS) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("team_match_stats").delete().eq("id", s.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const deriveResult = (gs: number, ga: number) => {
    if (gs > ga) return <span className="stat-badge bg-success/15 text-success">Win</span>;
    if (gs < ga) return <span className="stat-badge bg-destructive/15 text-destructive">Loss</span>;
    return <span className="stat-badge bg-warning/15 text-warning">Draw</span>;
  };

  const columns: Column<TMS>[] = [
    { key: "team_id", label: "Team", render: (s) => s.teams?.name ?? "?" },
    { key: "match_id", label: "Match Date", render: (s) => s.matches?.date ?? "?" },
    { key: "goals_scored", label: "GF" },
    { key: "goals_against", label: "GA" },
    { key: "result", label: "Result (derived)", render: (s) => deriveResult(s.goals_scored, s.goals_against) },
  ];

  return (
    <>
      <DataTable title="Team Match Stats" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit" : "Add"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))}><SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <Label>Match</Label>
            <Select value={form.match_id} onValueChange={v => setForm(f => ({ ...f, match_id: v }))}><SelectTrigger><SelectValue placeholder="Match" /></SelectTrigger><SelectContent>{matches.map(m => <SelectItem key={m.id} value={m.id}>{m.date} - {m.team1?.name} vs {m.team2?.name}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Goals Scored</Label><Input type="number" value={form.goals_scored} onChange={e => setForm(f => ({ ...f, goals_scored: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Goals Against</Label><Input type="number" value={form.goals_against} onChange={e => setForm(f => ({ ...f, goals_against: e.target.value }))} /></div>
        </div>
      </FormDialog>
    </>
  );
};

export default TeamMatchStats;
