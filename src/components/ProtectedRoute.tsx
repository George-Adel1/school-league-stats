import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (requiredRole === "admin" && role !== "admin") {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
