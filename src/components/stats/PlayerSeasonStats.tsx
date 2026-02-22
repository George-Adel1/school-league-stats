import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PSS { id: string; player_id: string; season_id: string; goals: number; assists: number; clean_sheets: number; yellow_cards: number; red_cards: number; own_goals: number; total_saves: number; penalties_saved: number; penalties_missed: number; players?: { name: string; last_name: string }; seasons?: { number: number }; }

const STAT_FIELDS = ["goals","assists","clean_sheets","yellow_cards","red_cards","own_goals","total_saves","penalties_saved","penalties_missed"] as const;

const PlayerSeasonStats = () => {
  const [data, setData] = useState<PSS[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PSS | null>(null);
  const [form, setForm] = useState<any>({ player_id: "", season_id: "", ...Object.fromEntries(STAT_FIELDS.map(f => [f, "0"])) });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [res, pRes, sRes] = await Promise.all([
      supabase.from("player_season_stats").select("*, players(name, last_name), seasons(number)").order("goals", { ascending: false }),
      supabase.from("players").select("*").order("last_name"),
      supabase.from("seasons").select("*").order("number"),
    ]);
    if (res.error) toast({ title: "Error", description: res.error.message, variant: "destructive" });
    else setData(res.data || []);
    setPlayers(pRes.data || []);
    setSeasons(sRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ player_id: "", season_id: "", ...Object.fromEntries(STAT_FIELDS.map(f => [f, "0"])) }); setDialogOpen(true); };
  const openEdit = (s: PSS) => { setEditing(s); setForm({ player_id: s.player_id, season_id: s.season_id, ...Object.fromEntries(STAT_FIELDS.map(f => [f, String((s as any)[f])])) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { player_id: form.player_id, season_id: form.season_id, ...Object.fromEntries(STAT_FIELDS.map(f => [f, +form[f]])) };
    const { error } = editing
      ? await supabase.from("player_season_stats").update(payload).eq("id", editing.id)
      : await supabase.from("player_season_stats").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (s: PSS) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("player_season_stats").delete().eq("id", s.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<PSS>[] = [
    { key: "player_id", label: "Player", render: (s) => `${s.players?.name ?? ""} ${s.players?.last_name ?? ""}` },
    { key: "season_id", label: "Season", render: (s) => `S${s.seasons?.number ?? "?"}` },
    { key: "goals", label: "G" },
    { key: "assists", label: "A" },
    { key: "clean_sheets", label: "CS" },
    { key: "yellow_cards", label: "YC" },
    { key: "red_cards", label: "RC" },
    { key: "total_saves", label: "SV" },
  ];

  return (
    <>
      <DataTable title="Player Season Stats" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit" : "Add"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Player</Label>
            <Select value={form.player_id} onValueChange={v => setForm((f: any) => ({ ...f, player_id: v }))}><SelectTrigger><SelectValue placeholder="Player" /></SelectTrigger><SelectContent>{players.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.last_name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={form.season_id} onValueChange={v => setForm((f: any) => ({ ...f, season_id: v }))}><SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger><SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STAT_FIELDS.map(k => (
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

export default PlayerSeasonStats;
