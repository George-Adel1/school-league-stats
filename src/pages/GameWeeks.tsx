import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameWeek { id: string; number: number; start_date: string; end_date: string; season_id: string; seasons?: { number: number } }
interface Season { id: string; number: number; }

const GameWeeksPage = () => {
  const [data, setData] = useState<GameWeek[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GameWeek | null>(null);
  const [form, setForm] = useState({ number: "", start_date: "", end_date: "", season_id: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [gwRes, sRes] = await Promise.all([
      supabase.from("gameweeks").select("*, seasons(number)").order("number"),
      supabase.from("seasons").select("*").order("number"),
    ]);
    if (gwRes.error) toast({ title: "Error", description: gwRes.error.message, variant: "destructive" });
    else setData(gwRes.data || []);
    setSeasons(sRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ number: "", start_date: "", end_date: "", season_id: "" }); setDialogOpen(true); };
  const openEdit = (g: GameWeek) => { setEditing(g); setForm({ number: String(g.number), start_date: g.start_date, end_date: g.end_date, season_id: g.season_id }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, number: parseInt(form.number) };
    const { error } = editing
      ? await supabase.from("gameweeks").update(payload).eq("id", editing.id)
      : await supabase.from("gameweeks").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (g: GameWeek) => {
    if (!confirm("Delete this game week?")) return;
    const { error } = await supabase.from("gameweeks").delete().eq("id", g.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<GameWeek>[] = [
    { key: "number", label: "Week #" },
    { key: "season_id", label: "Season", render: (g) => `Season ${g.seasons?.number ?? "?"}` },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
  ];

  return (
    <>
      <DataTable title="Game Weeks" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Game Week" : "Add Game Week"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Week Number</Label>
            <Input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={form.season_id} onValueChange={v => setForm(f => ({ ...f, season_id: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
              <SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
          </div>
        </div>
      </FormDialog>
    </>
  );
};

export default GameWeeksPage;
