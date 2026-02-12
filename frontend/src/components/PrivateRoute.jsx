import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * Wrapper that redirects unauthenticated users to /login.
 * Use for Account and Admin routes.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
