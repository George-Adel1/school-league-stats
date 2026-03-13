import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Team { id: string; name: string; group_id: string; groups?: { number: number } }
interface Group { id: string; number: number; }

const TeamsPage = () => {
  const [data, setData] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = async () => {
    const [teamsRes, groupsRes] = await Promise.all([
      supabase.from("teams").select("*, groups(number)").order("name"),
      supabase.from("groups").select("*").order("number"),
    ]);
    if (teamsRes.error) toast({ title: t("error"), description: teamsRes.error.message, variant: "destructive" });
    else setData(teamsRes.data || []);
    setGroups(groupsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setName(""); setGroupId(""); setDialogOpen(true); };
  const openEdit = (tm: Team) => { setEditing(tm); setName(tm.name); setGroupId(tm.group_id); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, group_id: groupId };
    const { error } = editing
      ? await supabase.from("teams").update(payload).eq("id", editing.id)
      : await supabase.from("teams").insert(payload);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (tm: Team) => {
    if (!confirm(t("deleteTeam"))) return;
    const { error } = await supabase.from("teams").delete().eq("id", tm.id);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Team>[] = [
    { key: "name", label: t("teamName") },
    { key: "group_id", label: t("group"), render: (tm) => `${t("group")} ${tm.groups?.number ?? "?"}` },
  ];

  return (
    <>
      <DataTable title={t("teams")} columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? t("editTeam") : t("addTeam")} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>{t("teamName")}</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{t("group")}</Label>
          <Select value={groupId} onValueChange={setGroupId} required>
            <SelectTrigger><SelectValue placeholder={t("selectGroup")} /></SelectTrigger>
            <SelectContent>
              {groups.map(g => <SelectItem key={g.id} value={g.id}>{t("group")} {g.number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </FormDialog>
    </>
  );
};

export default TeamsPage;
