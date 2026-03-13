import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, Shield, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const BUDGET = 70;
const MAX_PER_TEAM = 2;
const SQUAD_SIZE = 9; // 1GK + 3DEF + 3MID + 2FWD
const POSITION_LIMITS: Record<string, number> = { GK: 1, DEF: 3, MID: 3, FWD: 2 };

const FantasyPage = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [fantasyTeam, setFantasyTeam] = useState<any>(null);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [chips, setChips] = useState<any[]>([]);
  const [usedChips, setUsedChips] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!session?.user?.id) return;

    const [ftRes, playersRes, chipsRes] = await Promise.all([
      supabase.from("fantasy_teams").select("*, fantasy_team_players(*, players(id, name, last_name, position, price, teams(name)))").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("players").select("*, teams(name, group_id)").order("last_name"),
      supabase.from("chips").select("*").order("name"),
    ]);

    setAllPlayers(playersRes.data || []);
    setChips(chipsRes.data || []);

    if (ftRes.data) {
      setFantasyTeam(ftRes.data);
      setTeamPlayers(ftRes.data.fantasy_team_players || []);
      // Fetch used chips
      const { data: uc } = await supabase.from("fantasy_team_chips")
        .select("*, chips(name), gameweeks(number)")
        .eq("fantasy_team_id", ftRes.data.id);
      setUsedChips(uc || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [session?.user?.id]);

  const createTeam = async () => {
    if (!teamName.trim() || !session?.user?.id) return;
    setCreating(true);
    const { error } = await supabase.from("fantasy_teams").insert({
      user_id: session.user.id,
      name: teamName,
      budget: BUDGET,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Team Created!" }); fetchData(); }
    setCreating(false);
  };

  const addPlayer = async (playerId: string) => {
    if (!fantasyTeam) return;
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    // Validations
    const currentSquad = teamPlayers.map(tp => tp.players);
    const posCount = currentSquad.filter(p => p?.position === player.position).length;
    const teamCount = currentSquad.filter(p => p?.teams?.name === player.teams?.name).length;
    const totalSpent = currentSquad.reduce((sum, p) => sum + (p?.price || 0), 0);

    if (currentSquad.length >= SQUAD_SIZE) {
      toast({ title: "Squad Full", description: "You already have 9 players", variant: "destructive" }); return;
    }
    if (posCount >= (POSITION_LIMITS[player.position] || 0)) {
      toast({ title: "Position Limit", description: `Max ${POSITION_LIMITS[player.position]} ${player.position} players`, variant: "destructive" }); return;
    }
    if (teamCount >= MAX_PER_TEAM) {
      toast({ title: "Team Limit", description: `Max ${MAX_PER_TEAM} players from same class`, variant: "destructive" }); return;
    }
    if (totalSpent + player.price > BUDGET) {
      toast({ title: "Over Budget", description: `Adding this player exceeds your ${BUDGET}M budget`, variant: "destructive" }); return;
    }

    const isBenched = currentSquad.length >= 7;
    const { error } = await supabase.from("fantasy_team_players").insert({
      fantasy_team_id: fantasyTeam.id,
      player_id: playerId,
      is_benched: isBenched,
      bench_order: isBenched ? currentSquad.length - 6 : 0,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const removePlayer = async (ftpId: string) => {
    const { error } = await supabase.from("fantasy_team_players").delete().eq("id", ftpId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const setCaptain = async (ftpId: string, type: "captain" | "vice") => {
    // Remove existing captain/vc
    const field = type === "captain" ? "is_captain" : "is_vice_captain";
    await supabase.from("fantasy_team_players").update({ [field]: false }).eq("fantasy_team_id", fantasyTeam.id);
    await supabase.from("fantasy_team_players").update({ [field]: true }).eq("id", ftpId);
    fetchData();
  };

  const selectedPlayerIds = teamPlayers.map(tp => tp.player_id);
  const budgetSpent = teamPlayers.reduce((sum, tp) => sum + (tp.players?.price || 0), 0);
  const budgetRemaining = BUDGET - budgetSpent;

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  // No team yet - show creation
  if (!fantasyTeam) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-3xl tracking-wide">Create Your Fantasy Team</h1>
          <p className="text-muted-foreground mt-2">Build your dream squad with a {BUDGET}M budget</p>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Team name..."
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="text-center text-lg"
          />
          <Button onClick={createTeam} disabled={creating || !teamName.trim()} className="w-full">
            {creating ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">{fantasyTeam.name}</h1>
          <p className="text-sm text-muted-foreground">
            Budget: <span className="text-success font-bold">{budgetRemaining.toFixed(1)}M</span> remaining of {BUDGET}M
          </p>
        </div>
        <Link to="/fantasy/leaderboard">
          <Button variant="outline" size="sm" className="gap-1">
            Leaderboard <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Squad */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> Your Squad ({teamPlayers.length}/{SQUAD_SIZE})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamPlayers.length === 0 ? (
                <p className="text-muted-foreground text-sm">Add players from the list on the right</p>
              ) : (
                <div className="space-y-2">
                  {/* Starters */}
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Starting XI</p>
                  {teamPlayers.filter(tp => !tp.is_benched).map(tp => (
                    <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-[10px]">{tp.players?.position}</Badge>
                        <div>
                          <p className="text-sm font-medium">{tp.players?.name} {tp.players?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{tp.players?.teams?.name} · <span className="font-bold text-foreground">${Number(tp.players?.price || 0).toFixed(1)}M</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {tp.is_captain && <Badge className="bg-yellow-500/20 text-yellow-500 text-[10px]">C</Badge>}
                        {tp.is_vice_captain && <Badge className="bg-blue-400/20 text-blue-400 text-[10px]">VC</Badge>}
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setCaptain(tp.id, "captain")}>C</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setCaptain(tp.id, "vice")}>VC</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => removePlayer(tp.id)}>✕</Button>
                      </div>
                    </div>
                  ))}
                  {/* Bench */}
                  {teamPlayers.filter(tp => tp.is_benched).length > 0 && (
                    <>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-4">Bench</p>
                      {teamPlayers.filter(tp => tp.is_benched).map(tp => (
                        <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[10px]">{tp.players?.position}</Badge>
                            <div>
                              <p className="text-sm font-medium">{tp.players?.name} {tp.players?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{tp.players?.teams?.name} · <span className="font-bold text-foreground">${Number(tp.players?.price || 0).toFixed(1)}M</span></p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => removePlayer(tp.id)}>✕</Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" /> Available Chips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {chips.map(chip => {
                  const used = usedChips.some(uc => uc.chip_id === chip.id);
                  return (
                    <div key={chip.id} className={`p-3 rounded-lg border ${used ? "border-muted bg-muted/30 opacity-50" : "border-border bg-card hover:border-success/30"} transition-colors`}>
                      <p className="text-sm font-semibold">{chip.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{chip.description}</p>
                      {used && <Badge variant="outline" className="mt-2 text-[10px]">Used</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Market */}
        <Card className="h-fit max-h-[700px] overflow-auto">
          <CardHeader className="sticky top-0 bg-card z-10">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" /> Player Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {allPlayers.filter(p => !selectedPlayerIds.includes(p.id)).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] w-8 justify-center">{p.position}</Badge>
                  <div>
                    <p className="text-xs font-medium">{p.name} {p.last_name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.teams?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">${Number(p.price).toFixed(1)}M</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-success" onClick={() => addPlayer(p.id)}>+</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FantasyPage;
