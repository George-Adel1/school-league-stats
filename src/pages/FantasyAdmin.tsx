import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Zap, Calculator } from "lucide-react";

const FantasyAdmin = () => {
  const [fantasyTeams, setFantasyTeams] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [chipUsage, setChipUsage] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = async () => {
    const [ftRes, lbRes, cuRes, mRes] = await Promise.all([
      supabase.from("fantasy_teams").select("*, profiles(display_name, email), fantasy_team_players(id, player_id, is_captain, is_vice_captain, is_benched, players(name, last_name, position))"),
      supabase.from("fantasy_teams").select("id, name, user_id, profiles(display_name)"),
      supabase.from("fantasy_team_chips").select("*, fantasy_teams(name), chips(name), gameweeks(number)").order("used_at", { ascending: false }),
      supabase.from("matches").select("id, date, is_played, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number)").order("date", { ascending: false }),
    ]);

    setFantasyTeams(ftRes.data || []);
    setChipUsage(cuRes.data || []);
    setMatches(mRes.data || []);

    const { data: allPoints } = await supabase.from("fantasy_team_match_points").select("fantasy_team_id, points");
    const pointsMap: Record<string, number> = {};
    (allPoints || []).forEach((p: any) => { pointsMap[p.fantasy_team_id] = (pointsMap[p.fantasy_team_id] || 0) + p.points; });

    const lb = (lbRes.data || []).map((ft: any) => ({
      ...ft,
      totalPoints: pointsMap[ft.id] || 0,
    })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    setLeaderboard(lb);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const calculatePoints = async (matchId: string) => {
    setCalculating(matchId);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-fantasy-points", { body: { match_id: matchId } });
      if (error) throw error;
      toast({ title: t("pointsCalculated"), description: `${data.calculated} ${t("playersProcessed")}` });
      fetchData();
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    }
    setCalculating(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="w-6 h-6 text-primary" /> {t("fantasyManagement")}
      </h1>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="leaderboard">{t("leaderboard")}</TabsTrigger>
          <TabsTrigger value="teams">{t("teams")}</TabsTrigger>
          <TabsTrigger value="calculate">{t("calculate")}</TabsTrigger>
          <TabsTrigger value="chips">{t("chipUsage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("fantasyLeaderboard")}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-muted-foreground">{t("loading")}</p> : leaderboard.length === 0 ? (
                <p className="text-muted-foreground">{t("noFantasyTeams")}</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((ft, i) => (
                    <div key={ft.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{ft.name}</p>
                          <p className="text-xs text-muted-foreground">{ft.profiles?.display_name}</p>
                        </div>
                      </div>
                      <span className="font-bold text-lg text-primary">{ft.totalPoints} {t("pts")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> {t("fantasyTeams")}</CardTitle></CardHeader>
            <CardContent>
              {fantasyTeams.length === 0 ? (
                <p className="text-muted-foreground">{t("noFantasyTeams")}</p>
              ) : (
                <div className="space-y-4">
                  {fantasyTeams.map(ft => (
                    <div key={ft.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold">{ft.name}</p>
                          <p className="text-xs text-muted-foreground">{ft.profiles?.display_name} ({ft.profiles?.email})</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{ft.fantasy_team_players?.length || 0} {t("players")}</span>
                      </div>
                      {ft.fantasy_team_players?.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 mt-2">
                          {ft.fantasy_team_players.map((ftp: any) => (
                            <div key={ftp.id} className="text-xs p-1.5 rounded bg-muted flex items-center gap-1">
                              <span className="font-medium">{ftp.players?.name} {ftp.players?.last_name}</span>
                              {ftp.is_captain && <span className="text-yellow-500 font-bold">(C)</span>}
                              {ftp.is_vice_captain && <span className="text-blue-400 font-bold">(VC)</span>}
                              {ftp.is_benched && <span className="text-muted-foreground">(B)</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculate">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4" /> {t("calculateMatchPoints")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("calculateDesc")}</p>
              <div className="space-y-2">
                {matches.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${m.is_played ? "bg-success" : "bg-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">{m.team1?.name} vs {m.team2?.name}</p>
                        <p className="text-xs text-muted-foreground">{m.date} · GW{m.gameweeks?.number}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={m.is_played ? "outline" : "default"}
                      onClick={() => calculatePoints(m.id)}
                      disabled={calculating === m.id}
                    >
                      {calculating === m.id ? t("calculating") : m.is_played ? t("recalculate") : t("calculate")}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chips">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4" /> {t("chipUsage")}</CardTitle></CardHeader>
            <CardContent>
              {chipUsage.length === 0 ? (
                <p className="text-muted-foreground">{t("noChipsUsed")}</p>
              ) : (
                <div className="space-y-2">
                  {chipUsage.map(cu => (
                    <div key={cu.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">{cu.chips?.name}</p>
                        <p className="text-xs text-muted-foreground">{cu.fantasy_teams?.name} · GW{cu.gameweeks?.number}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cu.used_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FantasyAdmin;
