import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamSeasonStats from "@/components/stats/TeamSeasonStats";
import TeamMatchStats from "@/components/stats/TeamMatchStats";
import PlayerSeasonStats from "@/components/stats/PlayerSeasonStats";
import PlayerMatchStats from "@/components/stats/PlayerMatchStats";

const StatsPage = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      <Tabs defaultValue="team-season" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="team-season">Team Season</TabsTrigger>
          <TabsTrigger value="team-match">Team Match</TabsTrigger>
          <TabsTrigger value="player-season">Player Season</TabsTrigger>
          <TabsTrigger value="player-match">Player Match</TabsTrigger>
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
