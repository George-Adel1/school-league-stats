import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

  const fetchData = async () => {
    const [teamsRes, groupsRes] = await Promise.all([
      supabase.from("teams").select("*, groups(number)").order("name"),
      supabase.from("groups").select("*").order("number"),
    ]);
    if (teamsRes.error) toast({ title: "Error", description: teamsRes.error.message, variant: "destructive" });
    else setData(teamsRes.data || []);
    setGroups(groupsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setName(""); setGroupId(""); setDialogOpen(true); };
  const openEdit = (t: Team) => { setEditing(t); setName(t.name); setGroupId(t.group_id); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, group_id: groupId };
    const { error } = editing
      ? await supabase.from("teams").update(payload).eq("id", editing.id)
      : await supabase.from("teams").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (t: Team) => {
    if (!confirm("Delete this team?")) return;
    const { error } = await supabase.from("teams").delete().eq("id", t.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Team>[] = [
    { key: "name", label: "Team Name" },
    { key: "group_id", label: "Group", render: (t) => `Group ${t.groups?.number ?? "?"}` },
  ];

  return (
    <>
      <DataTable title="Teams" columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Team" : "Add Team"} onSubmit={handleSubmit} loading={saving}>
        <div className="space-y-2">
          <Label>Team Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Group</Label>
          <Select value={groupId} onValueChange={setGroupId} required>
            <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
            <SelectContent>
              {groups.map(g => <SelectItem key={g.id} value={g.id}>Group {g.number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </FormDialog>
    </>
  );
};

export default TeamsPage;
