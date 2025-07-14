// Updated AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = localStorage.getItem("userInfo");
        const isAdmin = localStorage.getItem("isAdmin") === "true";

        if (token && userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          setUser({ ...parsedUserInfo, isAdmin });

          try {
            const { data } = await authService.getProfile();
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            localStorage.setItem("isAdmin", data.isAdmin.toString());
          } catch (err) {
            if (err.response?.status === 401) {
              handleLogout();
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user from storage", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isAdmin");
    setUser(null);
  };

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await authService.login({ email, password });

      // Store user data
      setUser(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Store isAdmin flag separately
      if (data.isAdmin !== undefined) {
        localStorage.setItem("isAdmin", data.isAdmin.toString());
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to login",
      };
    }
  };

  const register = async (name, email, password) => {
    setError("");
    try {
      const { data } = await authService.register({ name, email, password });

      // Store user data
      setUser(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Store isAdmin flag separately (likely false for new registrations)
      if (data.isAdmin !== undefined) {
        localStorage.setItem("isAdmin", data.isAdmin.toString());
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to register",
      };
    }
  };

  // New method for registering an admin
  const registerAdmin = async (name, email, password, secretKey) => {
    setError("");
    try {
      const { data } = await authService.createAdmin({
        name,
        email,
        password,
        secretKey,
      });

      // Store user data
      setUser(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Store isAdmin flag separately (should be true for admin)
      if (data.isAdmin !== undefined) {
        localStorage.setItem("isAdmin", data.isAdmin.toString());
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register admin");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to register admin",
      };
    }
  };

  const logout = () => {
    handleLogout();
    navigate("/");
  };

  const updateUserInfo = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    if (userData.isAdmin !== undefined) {
      localStorage.setItem("isAdmin", userData.isAdmin.toString());
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    registerAdmin,
    logout,
    updateUserInfo,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
