
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoaderCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedAccountTypes?: ("student" | "admin")[];
}

function ProtectedRoute({
  children,
  allowedAccountTypes,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait until the application finishes checking the session.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="animate-spin text-primary" size={36} />
          <p className="text-sm text-muted-foreground">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // Redirect visitors who are not authenticated.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Restrict access according to account type.
  if (
    allowedAccountTypes &&
    !allowedAccountTypes.includes(user.accountType)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
