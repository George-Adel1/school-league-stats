import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player { id: string; name: string; last_name: string; position: string; price: number; team_id: string; teams?: { name: string } }
interface Team { id: string; name: string; }

const POSITIONS = ["GK", "DEF", "MID", "FWD"];

const PlayersPage = () => {
  const [data, setData] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState({ name: "", last_name: "", position: "", price: "", team_id: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from("players").select("*, teams(name)").order("last_name"),
      supabase.from("teams").select("*").order("name"),
    ]);
    if (playersRes.error) toast({ title: "Error", description: playersRes.error.message, variant: "destructive" });
    else setData(playersRes.data || []);
    setTeams(teamsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", last_name: "", position: "", price: "", team_id: "" }); setDialogOpen(true); };
  const openEdit = (p: Player) => { setEditing(p); setForm({ name: p.name, last_name: p.last_name, position: p.position, price: String(p.price), team_id: p.team_id }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price) };
    const { error } = editing
      ? await supabase.from("players").update(payload).eq("id", editing.id)
      : await supabase.from("players").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (p: Player) => {
    if (!confirm("Delete this player?")) return;
    const { error } = await supabase.from("players").delete().eq("id", p.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Player>[] = [
    { key: "name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "position", label: "Position", render: (p) => <span className="stat-badge bg-primary/10 text-primary">{p.position}</span> },
    { key: "price", label: "Price", render: (p) => `$${p.price}` },
    { key: "team_id", label: "Team", render: (p) => p.teams?.name ?? "?" },
  ];

  return (
    <>
      <DataTable title="Players" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Player" : "Add Player"} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))} required>
              <SelectTrigger><SelectValue placeholder="Position" /></SelectTrigger>
              <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Team</Label>
          <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))} required>
            <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
            <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </FormDialog>
    </>
  );
};

export default PlayersPage;
