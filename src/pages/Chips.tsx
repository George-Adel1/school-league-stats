import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Chip { id: string; name: string; description: string | null; }

const ChipsPage = () => {
  const [data, setData] = useState<Chip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Chip | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data, error } = await supabase.from("chips").select("*").order("name");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "" }); setDialogOpen(true); };
  const openEdit = (c: Chip) => { setEditing(c); setForm({ name: c.name, description: c.description || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name, description: form.description || null };
    const { error } = editing
      ? await supabase.from("chips").update(payload).eq("id", editing.id)
      : await supabase.from("chips").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (c: Chip) => {
    if (!confirm("Delete this chip?")) return;
    const { error } = await supabase.from("chips").delete().eq("id", c.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Chip>[] = [
    { key: "name", label: "Chip Name" },
    { key: "description", label: "Description", render: (c) => <span className="text-muted-foreground text-xs line-clamp-2">{c.description || "—"}</span> },
  ];

  return (
    <>
      <DataTable title="Chips" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Chip" : "Add Chip"} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>Chip Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
        </div>
      </FormDialog>
    </>
  );
};

export default ChipsPage;
