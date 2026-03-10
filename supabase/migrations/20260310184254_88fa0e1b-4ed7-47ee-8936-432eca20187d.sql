
-- =============================================
-- POSITIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage positions" ON public.positions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.positions (name) VALUES ('GK'), ('DEF'), ('MID'), ('FWD') ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEASONS: add start_date, end_date
-- =============================================
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS end_date date;

-- =============================================
-- MATCHES: add season_id, motm_player_id, is_played
-- =============================================
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS season_id uuid REFERENCES public.seasons(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS motm_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_played boolean DEFAULT false;

-- =============================================
-- PLAYER MATCH STATS: add clean_sheet, halfs_played, bonus_points
-- =============================================
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS clean_sheet boolean DEFAULT false;
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS halfs_played integer DEFAULT 0;
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0;

-- =============================================
-- PLAYER SEASON STATS: add matches_played, total_motm
-- =============================================
ALTER TABLE public.player_season_stats ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0;
ALTER TABLE public.player_season_stats ADD COLUMN IF NOT EXISTS total_motm integer DEFAULT 0;

-- =============================================
-- TEAM SEASON STATS: add matches_played
-- =============================================
ALTER TABLE public.team_season_stats ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0;

-- =============================================
-- PLAYER SEASON PRICE
-- =============================================
CREATE TABLE IF NOT EXISTS public.player_season_price (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  price decimal(6,2) NOT NULL DEFAULT 5.00,
  UNIQUE(player_id, season_id)
);
ALTER TABLE public.player_season_price ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read prices" ON public.player_season_price FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage prices" ON public.player_season_price FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY TEAMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric(8,2) DEFAULT 70.00,
  free_transfers integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read fantasy teams" ON public.fantasy_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own fantasy team" ON public.fantasy_teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fantasy team" ON public.fantasy_teams FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fantasy team" ON public.fantasy_teams FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all fantasy teams" ON public.fantasy_teams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY TEAM PLAYERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id),
  is_captain boolean DEFAULT false,
  is_vice_captain boolean DEFAULT false,
  is_benched boolean DEFAULT false,
  bench_order integer DEFAULT 0,
  UNIQUE(fantasy_team_id, player_id)
);
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read fantasy team players" ON public.fantasy_team_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own team players" ON public.fantasy_team_players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all team players" ON public.fantasy_team_players FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY PLAYER MATCH POINTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_player_match_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  breakdown jsonb DEFAULT '{}',
  UNIQUE(player_id, match_id)
);
ALTER TABLE public.fantasy_player_match_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read player points" ON public.fantasy_player_match_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage player points" ON public.fantasy_player_match_points FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY TEAM MATCH POINTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_team_match_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  UNIQUE(fantasy_team_id, match_id)
);
ALTER TABLE public.fantasy_team_match_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read team match points" ON public.fantasy_team_match_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage team match points" ON public.fantasy_team_match_points FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- CHIPS
-- =============================================
CREATE TABLE IF NOT EXISTS public.chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text
);
ALTER TABLE public.chips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read chips" ON public.chips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage chips" ON public.chips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.chips (name, description) VALUES
  ('2 Captains 1 Team', 'Both captain and vice captain are active for one gameweek. Double points for both.'),
  ('Wild Card', 'Unlimited free transfers for one gameweek.'),
  ('No Goalie', 'Swap GK with outfield player. +5 if team scores, -3 if team concedes (once each).'),
  ('Bench Boost', 'Bench player points count towards your total for one gameweek.'),
  ('Midfield Maestro', 'Double assist points for all midfielders in your team for one gameweek.'),
  ('Aguerooooooo', 'Goals scored by your players in the last 10 minutes + stoppage time award double goal points.')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- FANTASY TEAM CHIPS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_team_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  chip_id uuid NOT NULL REFERENCES public.chips(id),
  gameweek_id uuid NOT NULL REFERENCES public.gameweeks(id),
  used_at timestamptz DEFAULT now(),
  UNIQUE(fantasy_team_id, gameweek_id)
);
ALTER TABLE public.fantasy_team_chips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read chip usage" ON public.fantasy_team_chips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own chips" ON public.fantasy_team_chips FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all chips" ON public.fantasy_team_chips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
