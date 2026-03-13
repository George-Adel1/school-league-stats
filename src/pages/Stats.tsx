import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import TeamSeasonStats from "@/components/stats/TeamSeasonStats";
import TeamMatchStats from "@/components/stats/TeamMatchStats";
import PlayerSeasonStats from "@/components/stats/PlayerSeasonStats";
import PlayerMatchStats from "@/components/stats/PlayerMatchStats";

const StatsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">{t("statistics")}</h1>
      <Tabs defaultValue="team-season" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="team-season">{t("teamSeason")}</TabsTrigger>
          <TabsTrigger value="team-match">{t("teamMatch")}</TabsTrigger>
          <TabsTrigger value="player-season">{t("playerSeason")}</TabsTrigger>
          <TabsTrigger value="player-match">{t("playerMatch")}</TabsTrigger>
        </TabsList>
        <TabsContent value="team-season"><TeamSeasonStats /></TabsContent>
        <TabsContent value="team-match"><TeamMatchStats /></TabsContent>
        <TabsContent value="player-season"><PlayerSeasonStats /></TabsContent>
        <TabsContent value="player-match"><PlayerMatchStats /></TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
