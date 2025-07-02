// utils/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for dashboard, false for auth pages
  redirectTo?: string;
}

const AuthGuard: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // For pages that require authentication (like dashboard)
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // For auth pages (login/signup) - redirect if already authenticated
  if (!requireAuth && user) {
    return <Navigate to={redirectTo || "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
