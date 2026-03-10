import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlayerStat {
  id: string;
  player_id: string;
  match_id: string;
  goals: number;
  assists: number;
  clean_sheet: boolean;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
  total_saves: number;
  penalties_saved: number;
  penalties_missed: number;
  halfs_played: number;
  bonus_points: number;
  players: {
    position: string;
    team_id: string;
    teams: { name: string; group_id: string; groups: { number: number } };
  };
}

interface TeamStat {
  team_id: string;
  goals_scored: number;
  goals_against: number;
}

/**
 * Fantasy Points Calculation Engine
 * Based on the School League Rules document
 *
 * Point system:
 * - Goals: GK=12, DEF=7, MID=4, FWD=3
 * - Assists: GK=7, DEF=4, MID/FWD=3
 * - Appearance: <full match=1pt, full match=2pt (based on halfs_played)
 * - Yellow card: -1, Red card: -3
 * - Clean sheet: GK=4, DEF=3
 * - Penalty miss: -3 (shooter), Penalty save: +5 (keeper)
 * - Every 2 saves: +1 point for GK
 * - Bonus points: 3/2/1 for top 3 players chosen by ref (stored as bonus_points)
 * - Own goal: -2
 * - Class difference >2: younger class points doubled
 */

function getGoalPoints(position: string): number {
  switch (position) {
    case "GK": return 12;
    case "DEF": return 7;
    case "MID": return 4;
    case "FWD": return 3;
    default: return 3;
  }
}

function getAssistPoints(position: string): number {
  switch (position) {
    case "GK": return 7;
    case "DEF": return 4;
    case "MID": return 3;
    case "FWD": return 3;
    default: return 3;
  }
}

function calculatePlayerPoints(
  stat: PlayerStat,
  teamStats: TeamStat[],
  team1GroupNum: number,
  team2GroupNum: number,
  playerTeamId: string
): { points: number; breakdown: Record<string, number> } {
  const pos = stat.players.position;
  const breakdown: Record<string, number> = {};
  let points = 0;

  // Appearance points (halfs_played: 0=didn't play, 1=played half, 2=played full)
  if (stat.halfs_played > 0 && stat.halfs_played < 2) {
    breakdown.appearance = 1;
    points += 1;
  } else if (stat.halfs_played >= 2) {
    breakdown.appearance = 2;
    points += 2;
  }

  // Goals
  if (stat.goals > 0) {
    const goalPts = getGoalPoints(pos) * stat.goals;
    breakdown.goals = goalPts;
    points += goalPts;
  }

  // Assists
  if (stat.assists > 0) {
    const assistPts = getAssistPoints(pos) * stat.assists;
    breakdown.assists = assistPts;
    points += assistPts;
  }

  // Yellow cards
  if (stat.yellow_cards > 0) {
    const yc = -1 * stat.yellow_cards;
    breakdown.yellow_cards = yc;
    points += yc;
  }

  // Red cards
  if (stat.red_cards > 0) {
    const rc = -3 * stat.red_cards;
    breakdown.red_cards = rc;
    points += rc;
  }

  // Clean sheet
  if (stat.clean_sheet) {
    if (pos === "GK") {
      breakdown.clean_sheet = 4;
      points += 4;
    } else if (pos === "DEF") {
      breakdown.clean_sheet = 3;
      points += 3;
    }
  }

  // Penalty miss
  if (stat.penalties_missed > 0) {
    const pm = -3 * stat.penalties_missed;
    breakdown.penalties_missed = pm;
    points += pm;
  }

  // Penalty save
  if (stat.penalties_saved > 0) {
    const ps = 5 * stat.penalties_saved;
    breakdown.penalties_saved = ps;
    points += ps;
  }

  // Saves (every 2 saves = 1 point for GK)
  if (pos === "GK" && stat.total_saves > 0) {
    const savePts = Math.floor(stat.total_saves / 2);
    if (savePts > 0) {
      breakdown.saves = savePts;
      points += savePts;
    }
  }

  // Own goals
  if (stat.own_goals > 0) {
    const og = -2 * stat.own_goals;
    breakdown.own_goals = og;
    points += og;
  }

  // Bonus points (referee picks)
  if (stat.bonus_points > 0) {
    breakdown.bonus = stat.bonus_points;
    points += stat.bonus_points;
  }

  // Class difference doubling
  // Teams are named after classes: prima(1), seconda(2), terza(3), quarta(4), quinta(5)
  // If difference > 2 years, younger class points are doubled
  const playerGroupNum = stat.players.teams?.groups?.number || 0;
  const opponentGroupNum = playerTeamId === teamStats[0]?.team_id ? team2GroupNum : team1GroupNum;
  
  if (playerGroupNum > 0 && opponentGroupNum > 0) {
    const diff = Math.abs(playerGroupNum - opponentGroupNum);
    if (diff > 2 && playerGroupNum < opponentGroupNum) {
      // Younger class (lower number = younger) gets doubled
      breakdown.class_bonus = points; // double = add the same amount again
      points *= 2;
    }
  }

  return { points, breakdown };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { match_id } = await req.json();
    if (!match_id) {
      return new Response(JSON.stringify({ error: "match_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get match info
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("*, team1:teams!matches_team1_id_fkey(name, group_id, groups(number)), team2:teams!matches_team2_id_fkey(name, group_id, groups(number))")
      .eq("id", match_id)
      .single();

    if (matchErr || !match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const team1GroupNum = match.team1?.groups?.number || 0;
    const team2GroupNum = match.team2?.groups?.number || 0;

    // Get player stats for this match
    const { data: playerStats } = await supabase
      .from("player_match_stats")
      .select("*, players(position, team_id, teams(name, group_id, groups(number)))")
      .eq("match_id", match_id);

    // Get team stats for this match
    const { data: teamStats } = await supabase
      .from("team_match_stats")
      .select("team_id, goals_scored, goals_against")
      .eq("match_id", match_id);

    if (!playerStats || playerStats.length === 0) {
      return new Response(JSON.stringify({ message: "No player stats for this match" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate points for each player
    const pointsToUpsert = playerStats.map((stat: any) => {
      const { points, breakdown } = calculatePlayerPoints(
        stat,
        teamStats || [],
        team1GroupNum,
        team2GroupNum,
        stat.players?.team_id
      );
      return {
        player_id: stat.player_id,
        match_id: match_id,
        points,
        breakdown,
      };
    });

    // Upsert fantasy player match points
    for (const pt of pointsToUpsert) {
      await supabase
        .from("fantasy_player_match_points")
        .upsert(pt, { onConflict: "player_id,match_id" });
    }

    // Mark match as played
    await supabase.from("matches").update({ is_played: true }).eq("id", match_id);

    return new Response(JSON.stringify({ 
      success: true, 
      calculated: pointsToUpsert.length,
      points: pointsToUpsert 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
