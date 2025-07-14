import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  const isPublicLocal = localStorage.getItem("isAdmin") === "false";

  if (loading) {
    return <div className="text-white p-4">Checking Accessible Pages...</div>;
  }

  if ((!isAuthenticated && !isPublicLocal) || (user && !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
