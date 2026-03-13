import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Match { id: string; date: string; gameweek_id: string; team1_id: string; team2_id: string; season_id: string | null; motm_player_id: string | null; is_played: boolean; gameweeks?: { number: number; seasons?: { number: number } }; team1?: { name: string }; team2?: { name: string }; motm_player?: { name: string; last_name: string }; }
interface Team { id: string; name: string; }
interface GameWeek { id: string; number: number; season_id: string; seasons?: { number: number } }
interface Player { id: string; name: string; last_name: string; }

const MatchesPage = () => {
  const [data, setData] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameweeks, setGameweeks] = useState<GameWeek[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState({ date: "", gameweek_id: "", team1_id: "", team2_id: "", season_id: "", motm_player_id: "", is_played: false });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = async () => {
    const [mRes, tRes, gwRes, pRes] = await Promise.all([
      supabase.from("matches").select("*, gameweeks(number, seasons(number)), team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), motm_player:players!matches_motm_player_id_fkey(name, last_name)").order("date", { ascending: false }),
      supabase.from("teams").select("*").order("name"),
      supabase.from("gameweeks").select("*, seasons(number)").order("number"),
      supabase.from("players").select("id, name, last_name").order("last_name"),
    ]);
    if (mRes.error) toast({ title: t("error"), description: mRes.error.message, variant: "destructive" });
    else setData(mRes.data || []);
    setTeams(tRes.data || []);
    setGameweeks(gwRes.data || []);
    setPlayers(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ date: "", gameweek_id: "", team1_id: "", team2_id: "", season_id: "", motm_player_id: "", is_played: false }); setDialogOpen(true); };
  const openEdit = (m: Match) => { setEditing(m); setForm({ date: m.date, gameweek_id: m.gameweek_id, team1_id: m.team1_id, team2_id: m.team2_id, season_id: m.season_id || "", motm_player_id: m.motm_player_id || "", is_played: m.is_played || false }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = { date: form.date, gameweek_id: form.gameweek_id, team1_id: form.team1_id, team2_id: form.team2_id, is_played: form.is_played };
    if (form.season_id) payload.season_id = form.season_id;
    if (form.motm_player_id) payload.motm_player_id = form.motm_player_id;
    else payload.motm_player_id = null;
    const { error } = editing
      ? await supabase.from("matches").update(payload).eq("id", editing.id)
      : await supabase.from("matches").insert(payload);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (m: Match) => {
    if (!confirm(t("deleteMatch"))) return;
    const { error } = await supabase.from("matches").delete().eq("id", m.id);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Match>[] = [
    { key: "date", label: t("date") },
    { key: "gameweek_id", label: t("gameWeek"), render: (m) => `${t("gameWeek").substring(0,2)}${m.gameweeks?.number ?? "?"} (${t("season").substring(0,1)}${m.gameweeks?.seasons?.number ?? "?"})` },
    { key: "team1_id", label: t("team1"), render: (m) => (m as any).team1?.name ?? "?" },
    { key: "team2_id", label: t("team2"), render: (m) => (m as any).team2?.name ?? "?" },
    { key: "is_played", label: t("status"), render: (m) => m.is_played ? <Badge className="bg-success/15 text-success">{t("played")}</Badge> : <Badge variant="outline">{t("upcoming")}</Badge> },
    { key: "motm_player_id", label: t("motm"), render: (m) => (m as any).motm_player ? `${(m as any).motm_player.name} ${(m as any).motm_player.last_name}` : "—" },
  ];

  return (
    <>
      <DataTable title={t("matches")} columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? t("editMatch") : t("addMatch")} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("date")}</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{t("gameWeek")}</Label>
            <Select value={form.gameweek_id} onValueChange={v => setForm(f => ({ ...f, gameweek_id: v }))} required>
              <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{gameweeks.map(gw => <SelectItem key={gw.id} value={gw.id}>GW{gw.number} (S{gw.seasons?.number})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("team1")}</Label>
            <Select value={form.team1_id} onValueChange={v => setForm(f => ({ ...f, team1_id: v }))} required>
              <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{teams.map(tm => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("team2")}</Label>
            <Select value={form.team2_id} onValueChange={v => setForm(f => ({ ...f, team2_id: v }))} required>
              <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{teams.map(tm => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("manOfTheMatch")}</Label>
          <Select value={form.motm_player_id} onValueChange={v => setForm(f => ({ ...f, motm_player_id: v }))}>
            <SelectTrigger><SelectValue placeholder={t("none")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("none")}</SelectItem>
              {players.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_played} onCheckedChange={v => setForm(f => ({ ...f, is_played: v }))} />
          <Label>{t("matchPlayed")}</Label>
        </div>
      </FormDialog>
    </>
  );
};

export default MatchesPage;
