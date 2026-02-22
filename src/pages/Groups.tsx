import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Group { id: string; number: number; }

const GroupsPage = () => {
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data, error } = await supabase.from("groups").select("*").order("number");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setNumber(""); setDialogOpen(true); };
  const openEdit = (g: Group) => { setEditing(g); setNumber(String(g.number)); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { number: parseInt(number) };
    const { error } = editing
      ? await supabase.from("groups").update(payload).eq("id", editing.id)
      : await supabase.from("groups").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (g: Group) => {
    if (!confirm("Delete this group?")) return;
    const { error } = await supabase.from("groups").delete().eq("id", g.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Group>[] = [{ key: "number", label: "Group Number" }];

  return (
    <>
      <DataTable title="Groups" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Group" : "Add Group"} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>Group Number</Label>
          <Input type="number" value={number} onChange={e => setNumber(e.target.value)} required />
        </div>
      </FormDialog>
    </>
  );
};

export default GroupsPage;
