import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Season { id: string; number: number; start_date: string | null; end_date: string | null; }

const SeasonsPage = () => {
  const [data, setData] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form, setForm] = useState({ number: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = async () => {
    const { data, error } = await supabase.from("seasons").select("*").order("number");
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ number: "", start_date: "", end_date: "" }); setDialogOpen(true); };
  const openEdit = (s: Season) => { setEditing(s); setForm({ number: String(s.number), start_date: s.start_date || "", end_date: s.end_date || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = { number: parseInt(form.number) };
    if (form.start_date) payload.start_date = form.start_date;
    if (form.end_date) payload.end_date = form.end_date;
    const { error } = editing
      ? await supabase.from("seasons").update(payload).eq("id", editing.id)
      : await supabase.from("seasons").insert(payload);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (s: Season) => {
    if (!confirm(t("deleteSeason"))) return;
    const { error } = await supabase.from("seasons").delete().eq("id", s.id);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Season>[] = [
    { key: "number", label: t("seasonNumber") },
    { key: "start_date", label: t("startDate"), render: (s) => s.start_date || "—" },
    { key: "end_date", label: t("endDate"), render: (s) => s.end_date || "—" },
  ];

  return (
    <>
      <DataTable title={t("seasons")} columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? t("editSeason") : t("addSeason")} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>{t("seasonNumber")}</Label>
          <Input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("startDate")}</Label>
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t("endDate")}</Label>
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
        </div>
      </FormDialog>
    </>
  );
};

export default SeasonsPage;
