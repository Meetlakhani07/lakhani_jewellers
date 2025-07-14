import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  const isAdminLocal = localStorage.getItem("isAdmin") === "true";

  if (loading) {
    return <div className="text-white p-4">Checking admin access...</div>;
  }

  if ((!isAuthenticated && !isAdminLocal) || (user && !user.isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
