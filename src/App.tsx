import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

// Layouts
import AppLayout from "@/components/AppLayout";
import PublicLayout from "@/components/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth
import Auth from "@/pages/Auth";

// Admin pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SeasonsPage from "./pages/Seasons";
import GroupsPage from "./pages/Groups";
import TeamsPage from "./pages/Teams";
import PlayersPage from "./pages/Players";
import GameWeeksPage from "./pages/GameWeeks";
import MatchesPage from "./pages/Matches";
import StatsPage from "./pages/Stats";

// Public pages
import MainPage from "./pages/public/MainPage";
import StandingsPage from "./pages/public/StandingsPage";
import PublicMatchesPage from "./pages/public/PublicMatchesPage";
import MatchDetailPage from "./pages/public/MatchDetailPage";
import PublicPlayersPage from "./pages/public/PublicPlayersPage";
import PlayerDetailPage from "./pages/public/PlayerDetailPage";

const queryClient = new QueryClient();

const RoleRedirect = () => {
  const { role, loading } = useUserRole();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/main" replace />;
};

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Auth />;

  return (
    <Routes>
      {/* Root redirect based on role */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<Index />} />
              <Route path="seasons" element={<SeasonsPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="gameweeks" element={<GameWeeksPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Public routes */}
      <Route path="/main" element={<PublicLayout><MainPage /></PublicLayout>} />
      <Route path="/standings" element={<PublicLayout><StandingsPage /></PublicLayout>} />
      <Route path="/matches" element={<PublicLayout><PublicMatchesPage /></PublicLayout>} />
      <Route path="/matches/:id" element={<PublicLayout><MatchDetailPage /></PublicLayout>} />
      <Route path="/players" element={<PublicLayout><PublicPlayersPage /></PublicLayout>} />
      <Route path="/players/:id" element={<PublicLayout><PlayerDetailPage /></PublicLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
