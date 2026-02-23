import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * Renders children only if the current user is authenticated and has role "admin".
 * Otherwise redirects to home. No trace of admin is shown to non-admins.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
