import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PMS { id: string; player_id: string; match_id: string; goals: number; assists: number; clean_sheets: number; clean_sheet: boolean; yellow_cards: number; red_cards: number; own_goals: number; total_saves: number; penalties_saved: number; penalties_missed: number; minutes_played: number; halfs_played: number; bonus_points: number; players?: { name: string; last_name: string }; matches?: { date: string } }

const NUM_FIELDS = ["goals","assists","yellow_cards","red_cards","own_goals","total_saves","penalties_saved","penalties_missed","halfs_played","bonus_points"] as const;

const PlayerMatchStats = () => {
  const [data, setData] = useState<PMS[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PMS | null>(null);
  const [form, setForm] = useState<any>({ player_id: "", match_id: "", clean_sheet: false, ...Object.fromEntries(NUM_FIELDS.map(f => [f, "0"])) });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [res, pRes, mRes] = await Promise.all([
      supabase.from("player_match_stats").select("*, players(name, last_name), matches(date)"),
      supabase.from("players").select("*").order("last_name"),
      supabase.from("matches").select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name)").order("date", { ascending: false }),
    ]);
    if (res.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else setData(res.data || []);
    setPlayers(pRes.data || []);
    setMatches(mRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ player_id: "", match_id: "", clean_sheet: false, ...Object.fromEntries(NUM_FIELDS.map(f => [f, "0"])) }); setDialogOpen(true); };
  const openEdit = (s: PMS) => { setEditing(s); setForm({ player_id: s.player_id, match_id: s.match_id, clean_sheet: s.clean_sheet || false, ...Object.fromEntries(NUM_FIELDS.map(f => [f, String((s as any)[f] || 0)])) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = { player_id: form.player_id, match_id: form.match_id, clean_sheet: form.clean_sheet, ...Object.fromEntries(NUM_FIELDS.map(f => [f, +form[f]])) };
    // Also set legacy fields for backward compatibility
    payload.minutes_played = payload.halfs_played * 45;
    payload.clean_sheets = payload.clean_sheet ? 1 : 0;
    const { error } = editing
      ? await supabase.from("player_match_stats").update(payload).eq("id", editing.id)
      : await supabase.from("player_match_stats").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (s: PMS) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("player_match_stats").delete().eq("id", s.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<PMS>[] = [
    { key: "player_id", label: "Player", render: (s) => `${s.players?.name ?? ""} ${s.players?.last_name ?? ""}` },
    { key: "match_id", label: "Match", render: (s) => s.matches?.date ?? "?" },
    { key: "goals", label: "G" },
    { key: "assists", label: "A" },
    { key: "halfs_played", label: "Halfs" },
    { key: "clean_sheet", label: "CS", render: (s) => s.clean_sheet ? "✓" : "" },
    { key: "yellow_cards", label: "YC" },
    { key: "red_cards", label: "RC" },
    { key: "total_saves", label: "SV" },
    { key: "bonus_points", label: "Bonus" },
  ];

  return (
    <>
      <DataTable title="Player Match Stats" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit" : "Add"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Player</Label>
            <Select value={form.player_id} onValueChange={v => setForm((f: any) => ({ ...f, player_id: v }))}><SelectTrigger><SelectValue placeholder="Player" /></SelectTrigger><SelectContent>{players.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.last_name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <Label>Match</Label>
            <Select value={form.match_id} onValueChange={v => setForm((f: any) => ({ ...f, match_id: v }))}><SelectTrigger><SelectValue placeholder="Match" /></SelectTrigger><SelectContent>{matches.map(m => <SelectItem key={m.id} value={m.id}>{m.date} - {m.team1?.name} vs {m.team2?.name}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="flex items-center gap-2 py-2">
          <Switch checked={form.clean_sheet} onCheckedChange={v => setForm((f: any) => ({ ...f, clean_sheet: v }))} />
          <Label>Clean Sheet</Label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {NUM_FIELDS.map(k => (
            <div key={k} className="space-y-1">
              <Label className="text-xs capitalize">{k.replace(/_/g, " ")}</Label>
              <Input type="number" value={form[k]} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
      </FormDialog>
    </>
  );
};

export default PlayerMatchStats;
