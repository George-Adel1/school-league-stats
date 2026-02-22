import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Season { id: string; number: number; }

const SeasonsPage = () => {
  const [data, setData] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetch = async () => {
    const { data, error } = await supabase.from("seasons").select("*").order("number");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setNumber(""); setDialogOpen(true); };
  const openEdit = (s: Season) => { setEditing(s); setNumber(String(s.number)); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { number: parseInt(number) };
    const { error } = editing
      ? await supabase.from("seasons").update(payload).eq("id", editing.id)
      : await supabase.from("seasons").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (s: Season) => {
    if (!confirm("Delete this season?")) return;
    const { error } = await supabase.from("seasons").delete().eq("id", s.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetch();
  };

  const columns: Column<Season>[] = [
    { key: "number", label: "Season Number" },
  ];

  return (
    <>
      <DataTable title="Seasons" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Season" : "Add Season"} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>Season Number</Label>
          <Input type="number" value={number} onChange={e => setNumber(e.target.value)} required />
        </div>
      </FormDialog>
    </>
  );
};

export default SeasonsPage;
