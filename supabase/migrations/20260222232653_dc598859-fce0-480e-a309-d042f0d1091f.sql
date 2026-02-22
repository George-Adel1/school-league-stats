
-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE
);

-- Seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE
);

-- GameWeeks table
CREATE TABLE public.gameweeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  UNIQUE(number, season_id)
);

-- Matches table (NO team1_score, team2_score - stored in Team_Match_Stats)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  gameweek_id UUID NOT NULL REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  team1_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE
);

-- Team_Season_Stats (NO goal_diff - calculated dynamically)
CREATE TABLE public.team_season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(team_id, season_id)
);

-- Team_Match_Stats (NO result - derived from goals_scored vs goals_against)
CREATE TABLE public.team_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  UNIQUE(team_id, match_id)
);

-- Player_Season_Stats
CREATE TABLE public.player_season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  clean_sheets INTEGER NOT NULL DEFAULT 0,
  yellow_cards INTEGER NOT NULL DEFAULT 0,
  red_cards INTEGER NOT NULL DEFAULT 0,
  own_goals INTEGER NOT NULL DEFAULT 0,
  total_saves INTEGER NOT NULL DEFAULT 0,
  penalties_saved INTEGER NOT NULL DEFAULT 0,
  penalties_missed INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, season_id)
);

-- Player_Match_Stats
CREATE TABLE public.player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  clean_sheets INTEGER NOT NULL DEFAULT 0,
  yellow_cards INTEGER NOT NULL DEFAULT 0,
  red_cards INTEGER NOT NULL DEFAULT 0,
  own_goals INTEGER NOT NULL DEFAULT 0,
  total_saves INTEGER NOT NULL DEFAULT 0,
  penalties_saved INTEGER NOT NULL DEFAULT 0,
  penalties_missed INTEGER NOT NULL DEFAULT 0,
  minutes_played INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, match_id)
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can read all data
CREATE POLICY "Authenticated users can read groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read seasons" ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read gameweeks" ON public.gameweeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read team_season_stats" ON public.team_season_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read team_match_stats" ON public.team_match_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read player_season_stats" ON public.player_season_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read player_match_stats" ON public.player_match_stats FOR SELECT TO authenticated USING (true);

-- RLS: Authenticated users can insert/update/delete all data (admin)
CREATE POLICY "Auth users can insert groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update groups" ON public.groups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete groups" ON public.groups FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert seasons" ON public.seasons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update seasons" ON public.seasons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete seasons" ON public.seasons FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update teams" ON public.teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete teams" ON public.teams FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update players" ON public.players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete players" ON public.players FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert gameweeks" ON public.gameweeks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update gameweeks" ON public.gameweeks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete gameweeks" ON public.gameweeks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update matches" ON public.matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete matches" ON public.matches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert team_season_stats" ON public.team_season_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update team_season_stats" ON public.team_season_stats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete team_season_stats" ON public.team_season_stats FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert team_match_stats" ON public.team_match_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update team_match_stats" ON public.team_match_stats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete team_match_stats" ON public.team_match_stats FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert player_season_stats" ON public.player_season_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update player_season_stats" ON public.player_season_stats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete player_season_stats" ON public.player_season_stats FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert player_match_stats" ON public.player_match_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update player_match_stats" ON public.player_match_stats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete player_match_stats" ON public.player_match_stats FOR DELETE TO authenticated USING (true);
